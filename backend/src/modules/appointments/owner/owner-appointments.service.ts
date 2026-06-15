import { withTransaction } from "../../../db/transactions.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { httpStatus } from "../../../shared/errors/http-status.js";
import { createId } from "../../../shared/utils/id.js";
import { getMaxConcurrentIntervals } from "../../../shared/utils/interval-capacity.js";
import * as repo from "./owner-appointments.repository.js";
import { notifyAppointmentCreated } from "../../notifications/notification-events.js";
import type {
  CancelOwnerAppointmentBody,
  CreateOwnerAppointmentBody,
  CreateOwnerAppointmentResultDto,
  OwnerAppointmentDetailDto,
  OwnerAppointmentDetailRow,
  OwnerAppointmentDto,
  OwnerAppointmentListQuery,
  OwnerAppointmentListRow,
  OwnerAppointmentPetOptionDto,
  OwnerAppointmentServiceTypeDto,
  OwnerAppointmentStatusDto,
  OwnerAppointmentTimeSlotDto,
  OwnerExamTypeOptionDto,
  OwnerExamTypeOptionRow,
  OwnerPetOptionRow,
} from "./owner-appointments.types.js";

const FIXED_TIME_SLOTS = Array.from({ length: 18 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});
const timeZone = "Asia/Ho_Chi_Minh";
const MIN_BOOKING_LEAD_TIME_MS = 30 * 60 * 1000;
const MEDICAL_CLOSING_HOUR = 17;

function getVietnamDateInputValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function buildVietnamSlotDate(date: string, slot: string) {
  return new Date(`${date}T${slot}:00+07:00`);
}

function buildVietnamClosingDate(date: string) {
  return new Date(`${date}T${MEDICAL_CLOSING_HOUR.toString().padStart(2, "0")}:00:00+07:00`);
}

function getVietnamTimeValue(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getVietnamTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function mapDbStatus(row: Pick<OwnerAppointmentListRow, "appointment_status" | "completed_exam_id">): OwnerAppointmentStatusDto {
  if (row.completed_exam_id) {
    return "COMPLETED";
  }

  return row.appointment_status.toUpperCase() as OwnerAppointmentStatusDto;
}

function mapTypeCode(dbCode: string): OwnerAppointmentServiceTypeDto {
  return dbCode.toUpperCase() as OwnerAppointmentServiceTypeDto;
}

function mapSpecies(species: string): "Dog" | "Cat" | "Other" {
  return species === "Dog" || species === "Cat" ? species : "Other";
}

function mapSpeciesVi(species: string): string {
  if (species === "Dog") {
    return "Chó";
  }
  if (species === "Cat") {
    return "Mèo";
  }
  return "Khác";
}

function mapGender(gender: string | null): string | undefined {
  if (gender === "male") {
    return "Đực";
  }
  if (gender === "female") {
    return "Cái";
  }
  if (gender === "unknown") {
    return "Không rõ";
  }
  return undefined;
}

function formatAppointmentCode(appointmentId: string): string {
  return appointmentId;
}

function formatAgeText(birthDate: Date | null, estimatedAge: string | null): string | undefined {
  if (birthDate) {
    const now = new Date();
    let months =
      (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());

    if (now.getDate() < birthDate.getDate()) {
      months -= 1;
    }

    if (months < 12) {
      return `${Math.max(months, 0)} tháng`;
    }

    const years = Math.floor(months / 12);
    return `${years} tuổi`;
  }

  if (!estimatedAge) {
    return undefined;
  }

  const age = Number(estimatedAge);
  if (!Number.isFinite(age)) {
    return undefined;
  }

  if (age < 1) {
    return `${Math.round(age * 12)} tháng`;
  }

  return `${Number.isInteger(age) ? age : age.toFixed(1)} tuổi`;
}

function formatWeightText(weightKg: string | null): string | undefined {
  if (!weightKg) {
    return undefined;
  }

  const weight = Number(weightKg);
  if (!Number.isFinite(weight) || weight <= 0) {
    return undefined;
  }

  return `${Number.isInteger(weight) ? weight : weight.toFixed(1)} kg`;
}

function mapListRowToDto(row: OwnerAppointmentListRow): OwnerAppointmentDto {
  return {
    id: row.appointment_id,
    appointmentCode: formatAppointmentCode(row.appointment_id),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: mapSpecies(row.species),
      breed: row.breed ?? undefined,
      imageUrl: row.profile_image_url ?? undefined,
    },
    examType: {
      id: row.exam_type_id,
      code: mapTypeCode(row.type_code),
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    status: mapDbStatus(row),
    symptomDescription: row.symptom_description ?? undefined,
  };
}

function mapPetOption(row: OwnerPetOptionRow): OwnerAppointmentPetOptionDto {
  return {
    id: row.pet_id,
    name: row.pet_name,
    species: mapSpecies(row.species),
    breed: row.breed ?? undefined,
    ageText: formatAgeText(row.birth_date, row.estimated_age),
    weightText: formatWeightText(row.weight_kg),
    imageUrl: row.profile_image_url ?? undefined,
  };
}

function mapExamTypeOption(row: OwnerExamTypeOptionRow): OwnerExamTypeOptionDto {
  return {
    id: row.exam_type_id,
    code: mapTypeCode(row.type_code),
    name: row.type_name,
    description: row.description ?? undefined,
  };
}

function buildTimeline(row: OwnerAppointmentDetailRow) {
  const status = mapDbStatus(row);
  const createdAt = new Date(row.scheduled_at).toISOString();

  if (status === "CANCELLED") {
    return [
      { key: "created", label: "Đã tạo lịch", occurredAt: createdAt, status: "DONE" as const },
      { key: "cancelled", label: "Đã hủy", status: "CURRENT" as const },
      { key: "confirmed", label: "Đã xác nhận", status: "UPCOMING" as const },
      { key: "completed", label: "Hoàn tất khám", status: "UPCOMING" as const },
    ];
  }

  if (status === "REJECTED") {
    return [
      {
        key: "rejected",
        label: "Từ chối",
        description: row.rejection_reason ?? "Trung tâm đã từ chối lịch hẹn này.",
        status: "CURRENT" as const,
      },
      { key: "confirmed", label: "Đã xác nhận", status: "UPCOMING" as const },
      { key: "completed", label: "Hoàn tất khám", status: "UPCOMING" as const },
    ];
  }

  return [
    { key: "created", label: "Đã tạo lịch", occurredAt: createdAt, status: "DONE" as const },
    {
      key: "waiting_confirmation",
      label: "Chờ trung tâm xác nhận",
      description: "Hệ thống đang chờ nhân viên phòng khám tiếp nhận và xác nhận lịch hẹn của bạn.",
      status: status === "PENDING" || status === "PENDING_PAYMENT" ? ("CURRENT" as const) : ("DONE" as const),
    },
    {
      key: "confirmed",
      label: "Đã xác nhận",
      status: status === "CONFIRMED" ? ("CURRENT" as const) : status === "COMPLETED" ? ("DONE" as const) : ("UPCOMING" as const),
    },
    {
      key: "completed",
      label: "Hoàn tất khám",
      status: status === "COMPLETED" ? ("DONE" as const) : ("UPCOMING" as const),
    },
  ];
}

function mapDetailRowToDto(row: OwnerAppointmentDetailRow): OwnerAppointmentDetailDto {
  return {
    id: row.appointment_id,
    appointmentCode: formatAppointmentCode(row.appointment_id),
    status: mapDbStatus(row),
    serviceName: row.type_name,
    serviceType: mapTypeCode(row.type_code),
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    reason: row.symptom_description ?? "Không có mô tả triệu chứng",
    note: row.internal_note ?? undefined,
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: mapSpecies(row.species),
      breed: row.breed ?? undefined,
      ageText: formatAgeText(row.birth_date, row.estimated_age),
      gender: mapGender(row.gender),
      imageUrl: row.profile_image_url ?? undefined,
    },
    owner: {
      id: row.owner_user_id,
      fullName: row.owner_full_name,
      phoneNumber: row.owner_phone_number ?? undefined,
      email: row.owner_email ?? undefined,
    },
    timeline: buildTimeline(row),
  };
}

async function buildTimeSlots(date: string, examTypeId?: string): Promise<OwnerAppointmentTimeSlotDto[]> {
  const examType = examTypeId ? await repo.findActiveExamTypeById(examTypeId) : null;
  if (examTypeId && !examType) {
    throw new AppError("Không tìm thấy loại khám", "EXAM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
  }
  const durationMinutes = examType?.duration_minutes ?? 60;
  const dayStart = buildVietnamSlotDate(date, FIXED_TIME_SLOTS[0]);
  const dayEnd = buildVietnamClosingDate(date);
  const [doctorCount, appointmentRows] = await Promise.all([
    repo.countActiveDoctors(),
    repo.listActiveAppointmentIntervals(dayStart, dayEnd),
  ]);
  const intervals = appointmentRows.map((row) => {
    const start = new Date(row.scheduled_at);
    return {
      start,
      end: new Date(start.getTime() + row.duration_minutes * 60 * 1000),
    };
  });
  const now = new Date();

  return FIXED_TIME_SLOTS.map((slot) => {
    const slotStartsAt = buildVietnamSlotDate(date, slot);
    const slotEndsAt = new Date(slotStartsAt.getTime() + durationMinutes * 60 * 1000);
    const isCutoffPassed = slotStartsAt.getTime() - now.getTime() <= MIN_BOOKING_LEAD_TIME_MS;
    const isAfterClosing = slotEndsAt > dayEnd;
    const bookedUnits = getMaxConcurrentIntervals(intervals, slotStartsAt, slotEndsAt);
    const availableUnits = isCutoffPassed
      ? 0
      : isAfterClosing
        ? 0
        : Math.max(doctorCount - bookedUnits, 0);
    const disabledReason = isCutoffPassed
      ? "cutoff"
      : isAfterClosing
        ? "outside_working_hours"
      : availableUnits <= 0
        ? "full"
        : undefined;

    return {
      value: slot,
      label: `${slot} - ${getVietnamTimeLabel(slotEndsAt)}`,
      startAt: slotStartsAt.toISOString(),
      endAt: slotEndsAt.toISOString(),
      durationMinutes,
      disabled: Boolean(disabledReason),
      disabledReason,
      availableUnits,
    };
  });
}

export async function listOwnerAppointments(ownerUserId: string, filters: OwnerAppointmentListQuery) {
  const [rows, total] = await Promise.all([
    repo.listOwnerAppointments(ownerUserId, filters),
    repo.countOwnerAppointments(ownerUserId, filters),
  ]);

  return {
    data: rows.map(mapListRowToDto),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getOwnerAppointmentDetail(ownerUserId: string, appointmentId: string) {
  const row = await repo.findOwnerAppointmentDetail(appointmentId, ownerUserId);
  if (!row) {
    throw new AppError("Không tìm thấy lịch hẹn", "APPOINTMENT_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return mapDetailRowToDto(row);
}

export async function getOwnerAppointmentCreateOptions(ownerUserId: string) {
  const [pets, examTypes, timeSlots] = await Promise.all([
    repo.listOwnerPetOptions(ownerUserId),
    repo.listActiveExamTypes(),
    buildTimeSlots(getVietnamDateInputValue()),
  ]);

  return {
    pets: pets.map(mapPetOption),
    examTypes: examTypes.map(mapExamTypeOption),
    timeSlots,
  };
}

export async function getOwnerAvailableSlots(date: string, examTypeId?: string) {
  return buildTimeSlots(date, examTypeId);
}

export async function createOwnerAppointment(
  ownerUserId: string,
  body: CreateOwnerAppointmentBody,
): Promise<CreateOwnerAppointmentResultDto> {
  const scheduledAt = new Date(body.scheduledAt);
  if (scheduledAt.getTime() - Date.now() <= MIN_BOOKING_LEAD_TIME_MS) {
    throw new AppError("Vui lòng đặt lịch trước giờ khám ít nhất 30 phút", "APPOINTMENT_TIME_TOO_SOON", httpStatus.BAD_REQUEST);
  }
  if (!FIXED_TIME_SLOTS.includes(getVietnamTimeValue(scheduledAt))) {
    throw new AppError(
      "Giờ khám phải nằm trong các khung giờ bắt đầu từ 08:00 đến 16:30",
      "INVALID_APPOINTMENT_TIME",
      httpStatus.BAD_REQUEST,
    );
  }

  const result = await withTransaction(async (client) => {
    const [pet, examType] = await Promise.all([
      repo.findOwnerPetById(ownerUserId, body.petId, client),
      repo.findActiveExamTypeById(body.examTypeId, client),
    ]);

    if (!pet) {
      throw new AppError("Không tìm thấy thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    if (!examType) {
      throw new AppError("Không tìm thấy loại khám", "EXAM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    const durationMinutes = examType.duration_minutes ?? 60;
    const appointmentEnd = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);
    const appointmentDate = getVietnamDateInputValue(scheduledAt);
    if (appointmentEnd > buildVietnamClosingDate(appointmentDate)) {
      throw new AppError(
        "Thời gian khám vượt quá giờ làm việc",
        "APPOINTMENT_OUTSIDE_WORKING_HOURS",
        httpStatus.BAD_REQUEST,
      );
    }

    await repo.lockMedicalAppointmentsForScheduling(client);

    const [doctorCount, activeIntervals, petHasOverlap] = await Promise.all([
      repo.countActiveDoctors(client),
      repo.listActiveAppointmentIntervals(scheduledAt, appointmentEnd, client),
      repo.hasOverlappingPetAppointment(body.petId, scheduledAt, appointmentEnd, client),
    ]);
    if (petHasOverlap) {
      throw new AppError("Thú cưng này đã có lịch hẹn trong khung giờ đã chọn", "PET_APPOINTMENT_TIME_DUPLICATED", httpStatus.CONFLICT);
    }

    const intervals = activeIntervals.map((row) => {
      const start = new Date(row.scheduled_at);
      return {
        start,
        end: new Date(start.getTime() + row.duration_minutes * 60 * 1000),
      };
    });
    const bookedUnits = getMaxConcurrentIntervals(intervals, scheduledAt, appointmentEnd);
    if (doctorCount <= 0 || bookedUnits >= doctorCount) {
      throw new AppError("Khung giờ này đã có lịch hẹn", "APPOINTMENT_SLOT_UNAVAILABLE", httpStatus.CONFLICT);
    }

    const appointmentId = await createId("appt", client);
    await repo.insertOwnerAppointment(
      {
        appointmentId,
        ownerUserId,
        petId: body.petId,
        examTypeId: body.examTypeId,
        scheduledAt,
        durationMinutes,
        symptomDescription: body.symptomDescription,
      },
      client,
    );
    await repo.insertOwnerMedicalExam(await createId("mex", client), appointmentId, client);

    return {
      id: appointmentId,
      appointmentCode: formatAppointmentCode(appointmentId),
      petName: pet.pet_name,
      petSpecies: mapSpeciesVi(pet.species),
      examTypeName: examType.type_name,
      scheduledAt: scheduledAt.toISOString(),
      status: "PENDING" as const,
    };
  });

  notifyAppointmentCreated(result.id).catch(console.error);

  return result;
}

export async function cancelOwnerAppointment(
  ownerUserId: string,
  appointmentId: string,
  _body: CancelOwnerAppointmentBody,
) {
  await withTransaction(async (client) => {
    const row = await repo.findOwnerAppointmentDetailForUpdate(appointmentId, ownerUserId, client);
    if (!row) {
      throw new AppError("Không tìm thấy lịch hẹn", "APPOINTMENT_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    const status = mapDbStatus(row);
    if (status !== "PENDING" && status !== "CONFIRMED") {
      throw new AppError("Không thể hủy lịch hẹn ở trạng thái hiện tại", "INVALID_APPOINTMENT_STATUS", httpStatus.CONFLICT);
    }

    await repo.cancelOwnerAppointment(appointmentId, ownerUserId, client);
  });

  return getOwnerAppointmentDetail(ownerUserId, appointmentId);
}
