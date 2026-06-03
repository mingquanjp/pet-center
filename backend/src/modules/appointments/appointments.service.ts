import type { PoolClient } from "pg";
import { withTransaction } from "../../db/transactions.js";
import { AppError } from "../../shared/errors/app-error.js";
import { createId } from "../../shared/utils/id.js";
import * as repo from "./appointments.repository.js";
import type {
  AppointmentDetailRow,
  AvailableDoctorRow,
  CompleteDoctorExaminationBody,
  DoctorExaminationDetailRow,
  DoctorExaminationFieldDefinitionRow,
  DoctorExaminationFieldValueRow,
  ConfirmStaffAppointmentBody,
  DoctorExaminationListRow,
  PendingAppointmentAssignmentRow,
  RejectStaffAppointmentBody,
  StaffAppointmentDetailDto,
  StaffAssignedDoctorDto,
} from "./appointments.types.js";

function mapStatus(dbStatus: string): string {
  return dbStatus.toUpperCase();
}

function mapTypeCode(dbCode: string): string {
  return dbCode.toUpperCase();
}

function formatAppointmentCode(appointmentId: string): string {
  const suffix = appointmentId.replace(/^appt_/, "").toUpperCase();
  return `LH-${suffix}`;
}

function formatExaminationCode(appointmentId: string): string {
  const suffix = appointmentId.replace(/^appt_/, "").toUpperCase();
  return `PK-${suffix}`;
}

function formatPetAge(row: Pick<DoctorExaminationListRow, "birth_date" | "estimated_age">): string | undefined {
  if (row.birth_date) {
    const now = new Date();
    const birthDate = new Date(row.birth_date);
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age > 0 ? `${age} tuổi` : "Dưới 1 tuổi";
  }

  if (!row.estimated_age) {
    return undefined;
  }

  const estimatedAge = Number(row.estimated_age);
  if (!Number.isFinite(estimatedAge)) {
    return undefined;
  }

  const ageText = Number.isInteger(estimatedAge) ? String(estimatedAge) : estimatedAge.toFixed(1);
  return estimatedAge >= 1 ? `${ageText} tuổi` : "Dưới 1 tuổi";
}

function pickLeastBusyDoctor(
  availableDoctors: AvailableDoctorRow[],
  excludedDoctorIds = new Set<string>(),
): AvailableDoctorRow | null {
  const candidatesPool = availableDoctors.filter((doctor) => !excludedDoctorIds.has(doctor.user_id));
  if (candidatesPool.length === 0) {
    return null;
  }

  const minCount = Math.min(...candidatesPool.map((doctor) => parseInt(doctor.confirmed_count_in_day, 10)));
  const candidates = candidatesPool.filter((doctor) => parseInt(doctor.confirmed_count_in_day, 10) === minCount);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getAppointmentRange(row: AppointmentDetailRow) {
  const appointmentStart = new Date(row.scheduled_at);
  const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

  return { appointmentStart, appointmentEnd };
}

export async function listStaffAppointments(filters: any) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [rows, total, statsRow] = await Promise.all([
    repo.getStaffAppointmentsList(filters),
    repo.getStaffAppointmentsCount(filters),
    repo.getStaffAppointmentsStats(filters),
  ]);

  const data = rows.map((row) => ({
    id: row.id,
    appointmentCode: formatAppointmentCode(row.id),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species || "Other",
      breed: row.breed || undefined,
      imageUrl: row.profile_image_url || undefined,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone || undefined,
      email: row.owner_email || undefined,
    },
    examType: {
      id: row.exam_type_id,
      code: mapTypeCode(row.type_code),
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    bookingChannel: "ONLINE" as const,
    status: mapStatus(row.appointment_status),
    symptomDescription: row.symptom_description || undefined,
  }));

  const stats = {
    pendingCount: parseInt(statsRow?.pending_count ?? "0", 10),
    confirmedCount: parseInt(statsRow?.confirmed_count ?? "0", 10),
    rejectedCount: parseInt(statsRow?.rejected_count ?? "0", 10),
    cancelledCount: parseInt(statsRow?.cancelled_count ?? "0", 10),
    todayTotalCount: parseInt(statsRow?.today_total_count ?? "0", 10),
  };

  return {
    data,
    stats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listDoctorExaminations(doctorUserId: string, filters: any) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [rows, total, statsRow, tabStatsRow] = await Promise.all([
    repo.getDoctorExaminationsList(doctorUserId, filters),
    repo.getDoctorExaminationsCount(doctorUserId, filters),
    repo.getDoctorExaminationsStats(doctorUserId),
    repo.getDoctorExaminationsTabStats(doctorUserId, filters),
  ]);

  const data = rows.map((row) => ({
    id: row.id,
    examId: row.exam_id,
    examinationCode: formatExaminationCode(row.id),
    appointmentCode: formatAppointmentCode(row.id),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species === "Dog" || row.species === "Cat" ? row.species : "Other",
      breed: row.breed || undefined,
      ageText: formatPetAge(row),
      imageUrl: row.profile_image_url || undefined,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone || undefined,
      email: row.owner_email || undefined,
    },
    examType: {
      id: row.exam_type_id,
      code: mapTypeCode(row.type_code),
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    status: mapStatus(row.examination_status),
    symptomDescription: row.symptom_description || undefined,
    internalNote: row.internal_note || undefined,
  }));

  const stats = {
    totalCount: parseInt(statsRow?.total_count ?? "0", 10),
    waitingCount: parseInt(statsRow?.waiting_count ?? "0", 10),
    examiningCount: parseInt(statsRow?.examining_count ?? "0", 10),
    completedCount: parseInt(statsRow?.completed_count ?? "0", 10),
    followUpCount: parseInt(statsRow?.follow_up_count ?? "0", 10),
  };

  const tabStats = {
    totalCount: parseInt(tabStatsRow?.total_count ?? "0", 10),
    waitingCount: parseInt(tabStatsRow?.waiting_count ?? "0", 10),
    examiningCount: parseInt(tabStatsRow?.examining_count ?? "0", 10),
    completedCount: parseInt(tabStatsRow?.completed_count ?? "0", 10),
    followUpCount: parseInt(tabStatsRow?.follow_up_count ?? "0", 10),
  };

  return {
    data,
    stats,
    tabStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function getDoctorExaminationStatus(row: DoctorExaminationDetailRow) {
  return mapStatus(row.examination_status);
}

function mapDoctorExaminationFieldDefinition(
  definition: DoctorExaminationFieldDefinitionRow,
  values: DoctorExaminationFieldValueRow[]
) {
  const value = values.find((item) => item.field_definition_id === definition.field_definition_id);

  return {
    id: definition.field_definition_id,
    name: definition.field_name,
    label: definition.field_label,
    type: definition.field_type,
    isRequired: definition.is_required,
    displayOrder: definition.display_order,
    optionSource: definition.option_source,
    value: value
      ? {
          text: value.value_text,
          number: value.value_number ? Number(value.value_number) : null,
          date: value.value_date,
          fileUrl: value.file_url,
        }
      : null,
  };
}

async function mapDoctorExaminationDetail(row: DoctorExaminationDetailRow) {
  const [fieldDefinitions, fieldValues] = await Promise.all([
    repo.getDoctorExaminationFieldDefinitions(row.exam_type_id),
    repo.getDoctorExaminationFieldValues(row.exam_id),
  ]);

  return {
    id: row.id,
    examId: row.exam_id,
    examinationCode: formatExaminationCode(row.id),
    appointmentCode: formatAppointmentCode(row.id),
    status: getDoctorExaminationStatus(row),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species === "Dog" || row.species === "Cat" ? row.species : "Other",
      breed: row.breed || undefined,
      ageText: formatPetAge(row),
      gender: row.gender || undefined,
      weightText: row.weight_kg ? `${row.weight_kg} kg` : undefined,
      imageUrl: row.profile_image_url || undefined,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone || undefined,
      email: row.owner_email || undefined,
    },
    examType: {
      id: row.exam_type_id,
      code: mapTypeCode(row.type_code),
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    symptomDescription: row.symptom_description || undefined,
    internalNote: row.internal_note || undefined,
    diagnosis: row.diagnosis || "",
    conclusion: row.conclusion || "",
    healthNote: row.health_note || "",
    examDate: row.exam_date || undefined,
    fields: fieldDefinitions.map((definition) => mapDoctorExaminationFieldDefinition(definition, fieldValues)),
  };
}

export async function getDoctorExaminationDetail(doctorUserId: string, appointmentId: string) {
  const row = await repo.findDoctorExaminationDetail(doctorUserId, appointmentId);

  if (!row) {
    throw new AppError("Examination not found", "EXAMINATION_NOT_FOUND", 404);
  }

  return mapDoctorExaminationDetail(row);
}

export async function startDoctorExamination(doctorUserId: string, appointmentId: string) {
  await withTransaction(async (client) => {
    const row = await repo.findDoctorExaminationForUpdate(doctorUserId, appointmentId, client);

    if (!row) {
      throw new AppError("Examination not found", "EXAMINATION_NOT_FOUND", 404);
    }

    if (!row.exam_id) {
      await repo.createMedicalExamForAppointment(
        createId("mex"),
        row.appointment_id,
        row.exam_type_id,
        doctorUserId,
        client
      );
    }
  });

  return getDoctorExaminationDetail(doctorUserId, appointmentId);
}

function normalizeFieldValues(fieldValues: CompleteDoctorExaminationBody["fieldValues"] = []) {
  return fieldValues.filter((fieldValue) => {
    const providedValues = [
      fieldValue.valueText,
      fieldValue.valueNumber,
      fieldValue.valueDate,
      fieldValue.fileUrl,
    ].filter((value) => value !== undefined && value !== null && value !== "");

    return providedValues.length === 1;
  });
}

export async function completeDoctorExamination(
  doctorUserId: string,
  appointmentId: string,
  body: CompleteDoctorExaminationBody
) {
  await withTransaction(async (client) => {
    const row = await repo.findDoctorExaminationForUpdate(doctorUserId, appointmentId, client);

    if (!row) {
      throw new AppError("Examination not found", "EXAMINATION_NOT_FOUND", 404);
    }

    const examId = row.exam_id || createId("mex");
    if (!row.exam_id) {
      await repo.createMedicalExamForAppointment(examId, row.appointment_id, row.exam_type_id, doctorUserId, client);
    }

    await repo.completeMedicalExam(examId, body.diagnosis, body.conclusion, body.healthNote, client);
    await repo.replaceMedicalExamFieldValues(examId, normalizeFieldValues(body.fieldValues), client);
  });

  return getDoctorExaminationDetail(doctorUserId, appointmentId);
}

function mapAppointmentRowToStaffDetailDto(
  row: AppointmentDetailRow,
  suggestedDoctor: StaffAssignedDoctorDto | null = null,
  assignmentStatus: "ASSIGNED" | "NO_AVAILABLE_DOCTOR" | undefined = undefined,
): StaffAppointmentDetailDto {
  const status = mapStatus(row.appointment_status) as any;
  const examTypeCode = mapTypeCode(row.type_code) as any;

  let assignedDoctor: StaffAssignedDoctorDto | null = null;
  if (row.veterinarian_user_id) {
    assignedDoctor = {
      id: row.veterinarian_user_id,
      fullName: row.doctor_full_name || "",
      phoneNumber: row.doctor_phone_number,
      email: row.doctor_email,
      avatarUrl: row.doctor_avatar,
    };
  }

  return {
    id: row.appointment_id,
    appointmentCode: formatAppointmentCode(row.appointment_id),
    status,
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species === "Dog" || row.species === "Cat" ? row.species : "Other",
      breed: row.breed,
      imageUrl: row.profile_image_url,
      ageText: undefined,
      weightText: row.weight_kg ? `${row.weight_kg} kg` : undefined,
    },
    owner: {
      id: row.owner_user_id,
      fullName: row.owner_full_name,
      phoneNumber: row.owner_phone_number,
      email: row.owner_email,
    },
    examType: {
      id: row.exam_type_id,
      code: examTypeCode,
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    bookingChannel: "ONLINE",
    symptomDescription: row.symptom_description,
    ownerNote: row.symptom_description,
    assignedDoctor,
    suggestedDoctor,
    assignmentStatus,
    rejectionReason: row.rejection_reason,
  };
}

function mapDoctorToDto(doctor: AvailableDoctorRow): StaffAssignedDoctorDto {
  return {
    id: doctor.user_id,
    fullName: doctor.full_name,
    phoneNumber: doctor.phone_number,
    email: doctor.email,
    avatarUrl: doctor.profile_image_url,
  };
}

function getPendingAppointmentRange(row: PendingAppointmentAssignmentRow) {
  const appointmentStart = new Date(row.scheduled_at);
  const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

  return { appointmentStart, appointmentEnd };
}

async function refreshPendingAssignmentsAfterConfirm(
  client: PoolClient,
  confirmedAppointmentId: string,
  confirmedDoctorId: string,
  confirmedStart: Date,
  confirmedEnd: Date,
) {
  const conflictingPendingAppointments = await repo.findPendingAppointmentsAssignedToDoctorInRange(
    confirmedDoctorId,
    confirmedStart,
    confirmedEnd,
    confirmedAppointmentId,
    client,
  );

  const reservedDoctorIds = new Set<string>([confirmedDoctorId]);

  for (const pendingAppointment of conflictingPendingAppointments) {
    const { appointmentStart, appointmentEnd } = getPendingAppointmentRange(pendingAppointment);
    const availableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      pendingAppointment.appointment_id,
      client,
    );
    const replacementDoctor = pickLeastBusyDoctor(availableDoctors, reservedDoctorIds);

    await repo.updateAppointmentDoctor(
      pendingAppointment.appointment_id,
      replacementDoctor?.user_id ?? null,
      client,
    );

    if (replacementDoctor) {
      reservedDoctorIds.add(replacementDoctor.user_id);
    }
  }
}

async function pickDoctorForConfirmation(
  client: PoolClient,
  appointmentStart: Date,
  appointmentEnd: Date,
  appointmentId: string,
  preferredDoctorId?: string | null,
): Promise<AvailableDoctorRow | null> {
  const attemptedDoctorIds = new Set<string>();

  while (true) {
    const availableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      appointmentId,
      client,
    );

    let candidate: AvailableDoctorRow | null = null;
    if (preferredDoctorId && !attemptedDoctorIds.has(preferredDoctorId)) {
      candidate = availableDoctors.find((doctor) => doctor.user_id === preferredDoctorId) ?? null;
    }

    if (!candidate) {
      candidate = pickLeastBusyDoctor(availableDoctors, attemptedDoctorIds);
    }

    if (!candidate) {
      return null;
    }

    attemptedDoctorIds.add(candidate.user_id);
    const doctorLocked = await repo.lockDoctorForAssignment(candidate.user_id, client);
    if (!doctorLocked) {
      continue;
    }

    const freshAvailableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      appointmentId,
      client,
    );
    const freshCandidate = freshAvailableDoctors.find((doctor) => doctor.user_id === candidate.user_id);
    if (freshCandidate) {
      return freshCandidate;
    }
  }
}

export async function getStaffAppointmentDetail(appointmentId: string): Promise<StaffAppointmentDetailDto> {
  const row = await repo.findStaffAppointmentDetailById(appointmentId);
  if (!row) {
    throw new AppError("Appointment not found", "APPOINTMENT_NOT_FOUND", 404);
  }

  let suggestedDoctor: StaffAssignedDoctorDto | null = null;
  let assignmentStatus: "ASSIGNED" | "NO_AVAILABLE_DOCTOR" | undefined = undefined;

  if (row.appointment_status === "pending") {
    const { appointmentStart, appointmentEnd } = getAppointmentRange(row);
    const availableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      appointmentId,
    );

    if (availableDoctors.length > 0) {
      let doctorToSuggest: AvailableDoctorRow | undefined | null;
      if (row.veterinarian_user_id) {
        doctorToSuggest = availableDoctors.find((doctor) => doctor.user_id === row.veterinarian_user_id);
      }
      if (!doctorToSuggest) {
        doctorToSuggest = pickLeastBusyDoctor(availableDoctors);
      }
      if (doctorToSuggest) {
        suggestedDoctor = mapDoctorToDto(doctorToSuggest);
        assignmentStatus = "ASSIGNED";
      } else {
        assignmentStatus = "NO_AVAILABLE_DOCTOR";
      }
    } else {
      assignmentStatus = "NO_AVAILABLE_DOCTOR";
    }
  } else if (row.appointment_status === "confirmed" || row.veterinarian_user_id) {
    assignmentStatus = "ASSIGNED";
  }

  return mapAppointmentRowToStaffDetailDto(row, suggestedDoctor, assignmentStatus);
}

export async function confirmStaffAppointment(
  appointmentId: string,
  staffUserId: string,
  body: ConfirmStaffAppointmentBody,
) {
  await withTransaction(async (client) => {
    const row = await repo.findStaffAppointmentDetailByIdForUpdate(appointmentId, client);
    if (!row) {
      throw new AppError("Appointment not found", "APPOINTMENT_NOT_FOUND", 404);
    }

    if (row.appointment_status !== "pending") {
      if (row.appointment_status === "confirmed") {
        throw new AppError("Appointment already confirmed.", "APPOINTMENT_ALREADY_CONFIRMED", 409);
      }
      throw new AppError("Cannot confirm this appointment.", "INVALID_APPOINTMENT_STATUS", 409);
    }

    const { appointmentStart, appointmentEnd } = getAppointmentRange(row);
    const preferredDoctorId = body.doctorUserId ?? row.veterinarian_user_id;
    const selectedDoctor = await pickDoctorForConfirmation(
      client,
      appointmentStart,
      appointmentEnd,
      appointmentId,
      preferredDoctorId,
    );

    if (!selectedDoctor) {
      throw new AppError("No available doctor for this time slot.", "NO_AVAILABLE_DOCTOR", 409);
    }

    await repo.confirmAppointmentWithDoctor(
      appointmentId,
      staffUserId,
      selectedDoctor.user_id,
      body.internalNote,
      client,
    );

    await refreshPendingAssignmentsAfterConfirm(
      client,
      appointmentId,
      selectedDoctor.user_id,
      appointmentStart,
      appointmentEnd,
    );
  });

  return getStaffAppointmentDetail(appointmentId);
}

export async function rejectStaffAppointment(
  appointmentId: string,
  staffUserId: string,
  body: RejectStaffAppointmentBody,
) {
  const row = await repo.findStaffAppointmentDetailById(appointmentId);
  if (!row) {
    throw new AppError("Appointment not found", "APPOINTMENT_NOT_FOUND", 404);
  }

  if (row.appointment_status !== "pending") {
    if (row.appointment_status === "rejected") {
      throw new AppError("Appointment already rejected.", "APPOINTMENT_ALREADY_REJECTED", 409);
    }
    throw new AppError("Cannot reject this appointment.", "INVALID_APPOINTMENT_STATUS", 409);
  }

  await repo.rejectAppointment(
    appointmentId,
    staffUserId,
    body.rejectionReason,
    body.internalNote,
  );

  return getStaffAppointmentDetail(appointmentId);
}
