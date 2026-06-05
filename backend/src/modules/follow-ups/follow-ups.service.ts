import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as repo from "./follow-ups.repository.js";
import type {
  DoctorFollowUpDetailRow,
  DoctorFollowUpListRow,
  ListDoctorFollowUpsFilters,
} from "./follow-ups.types.js";

function formatFollowUpCode(followUpId: string) {
  const suffix = followUpId.replace(/^fui_?/i, "").replace(/^follow_up_?/i, "").toUpperCase();
  return `TK-${suffix}`;
}

function formatExaminationCode(row: Pick<DoctorFollowUpListRow | DoctorFollowUpDetailRow, "appointment_id" | "exam_id">) {
  const appointmentSuffix = row.appointment_id.replace(/^appt_/, "").toUpperCase();
  if (appointmentSuffix !== row.appointment_id) {
    return `PK-${appointmentSuffix}`;
  }

  return `PK-${row.exam_id.replace(/^exam_?/, "").toUpperCase()}`;
}

function mapSpeciesLabel(species: string) {
  if (species === "Dog") return "Chó";
  if (species === "Cat") return "Mèo";
  return "Khác";
}

function mapGenderLabel(gender: string | null) {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  if (gender === "unknown") return "Không rõ";
  return undefined;
}

function formatPetAge(row: Pick<DoctorFollowUpListRow | DoctorFollowUpDetailRow, "birth_date" | "estimated_age">) {
  if (row.birth_date) {
    const today = new Date();
    const birthDate = new Date(row.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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

function mapBaseFollowUp(row: DoctorFollowUpListRow | DoctorFollowUpDetailRow) {
  return {
    followUpId: row.follow_up_id,
    followUpCode: formatFollowUpCode(row.follow_up_id),
    examId: row.exam_id,
    examinationCode: formatExaminationCode(row),
    appointmentId: row.appointment_id,
    followUpDate: row.follow_up_date,
    reason: row.reason,
    ownerNote: row.owner_note,
    status: row.effective_status,
    completedAt: row.completed_at,
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species,
      speciesLabel: mapSpeciesLabel(row.species),
      breed: row.breed,
      ageLabel: formatPetAge(row),
      genderLabel: mapGenderLabel(row.gender),
      imageUrl: row.profile_image_url,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone,
      email: row.owner_email,
    },
    doctor: {
      id: row.doctor_id,
      fullName: row.doctor_name,
    },
    exam: {
      id: row.exam_id,
      examinationCode: formatExaminationCode(row),
      examDate: row.exam_date,
      diagnosis: row.diagnosis,
      conclusion: row.conclusion,
      medicineCount: parseInt(row.medicine_count, 10),
    },
  };
}

function mapFollowUpListItem(row: DoctorFollowUpListRow) {
  return mapBaseFollowUp(row);
}

function mapFollowUpDetail(row: DoctorFollowUpDetailRow) {
  const base = mapBaseFollowUp(row);
  const reminderHistory = [
    {
      title: "Đã tạo lịch tái khám",
      time: row.exam_date,
      description: `${row.doctor_name} đã chỉ định lịch tái khám cho ${row.pet_name}.`,
    },
  ];

  if (row.completed_at) {
    reminderHistory.push({
      title: "Đã hoàn tất tái khám",
      time: row.completed_at,
      description: `Lịch tái khám của ${row.pet_name} đã được ghi nhận hoàn tất.`,
    });
  }

  return {
    ...base,
    exam: {
      ...base.exam,
      healthNote: row.health_note,
      prescription: row.prescription_id
        ? {
            prescriptionId: row.prescription_id,
            prescribedAt: row.prescribed_at,
            generalNote: row.general_note,
            medicineCount: parseInt(row.medicine_count, 10),
          }
        : null,
    },
    reminderHistory,
  };
}

export async function listDoctorFollowUps(
  doctorUserId: string,
  filters: ListDoctorFollowUpsFilters
) {
  const [rows, total, statsRow] = await Promise.all([
    repo.getDoctorFollowUpsList(doctorUserId, filters),
    repo.getDoctorFollowUpsCount(doctorUserId, filters),
    repo.getDoctorFollowUpsStats(doctorUserId),
  ]);

  return {
    data: rows.map(mapFollowUpListItem),
    stats: {
      upcomingCount: parseInt(statsRow?.upcoming_count ?? "0", 10),
      overdueCount: parseInt(statsRow?.overdue_count ?? "0", 10),
      completedCount: parseInt(statsRow?.completed_count ?? "0", 10),
    },
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getDoctorFollowUpDetail(doctorUserId: string, followUpId: string) {
  const row = await repo.getDoctorFollowUpDetail(doctorUserId, followUpId);
  if (!row) {
    throw new AppError("Không tìm thấy lịch tái khám", "FOLLOW_UP_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return mapFollowUpDetail(row);
}
