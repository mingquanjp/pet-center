import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as repo from "./prescriptions.repository.js";
import type {
  DoctorPrescriptionDetailRow,
  DoctorPrescriptionItemRow,
  DoctorPrescriptionListRow,
  ListDoctorPrescriptionsFilters,
} from "./prescriptions.types.js";

function formatPrescriptionCode(prescriptionId: string) {
  const suffix = prescriptionId.replace(/^rx_?/i, "").replace(/^pre/i, "").replace(/^prescription_?/i, "").toUpperCase();
  return `DT-${suffix}`;
}

function formatExaminationCode(row: Pick<DoctorPrescriptionListRow | DoctorPrescriptionDetailRow, "appointment_id" | "exam_id">) {
  const appointmentSuffix = row.appointment_id.replace(/^appt_?/i, "").toUpperCase();
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

function formatPetAge(row: Pick<DoctorPrescriptionListRow | DoctorPrescriptionDetailRow, "birth_date" | "estimated_age">) {
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

function mapPrescriptionListItem(row: DoctorPrescriptionListRow) {
  return {
    prescriptionId: row.prescription_id,
    prescriptionCode: formatPrescriptionCode(row.prescription_id),
    examId: row.exam_id,
    examinationCode: formatExaminationCode(row),
    prescribedDate: row.prescribed_at,
    status: "prescribed" as const,
    doctorName: row.doctor_name,
    diagnosis: row.diagnosis,
    conclusion: row.conclusion,
    generalNote: row.general_note,
    medicineCount: parseInt(row.medicine_count, 10),
    hasFollowUp: row.has_follow_up,
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species,
      speciesLabel: mapSpeciesLabel(row.species),
      breed: row.breed,
      ageLabel: formatPetAge(row),
      imageUrl: row.profile_image_url,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone,
    },
  };
}

function mapPrescriptionItem(row: DoctorPrescriptionItemRow) {
  return {
    prescriptionItemId: row.prescription_item_id,
    medicineId: row.medicine_id,
    medicineName: row.medicine_name,
    quantity: row.quantity,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    usageInstruction: row.usage_instruction,
    note: row.note,
  };
}

function mapPrescriptionDetail(row: DoctorPrescriptionDetailRow, items: DoctorPrescriptionItemRow[]) {
  return {
    prescriptionId: row.prescription_id,
    prescriptionCode: formatPrescriptionCode(row.prescription_id),
    examId: row.exam_id,
    examinationCode: formatExaminationCode(row),
    prescribedDate: row.prescribed_at,
    status: "prescribed" as const,
    diagnosis: row.diagnosis,
    conclusion: row.conclusion,
    generalNote: row.general_note,
    doctor: {
      id: row.doctor_id,
      fullName: row.doctor_name,
    },
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species,
      speciesLabel: mapSpeciesLabel(row.species),
      breed: row.breed,
      ageLabel: formatPetAge(row),
      imageUrl: row.profile_image_url,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone,
    },
    medicines: items.map(mapPrescriptionItem),
    followUp: row.follow_up_id
      ? {
          followUpId: row.follow_up_id,
          followUpDate: row.follow_up_date,
          reason: row.follow_up_reason,
          ownerNote: row.follow_up_owner_note,
        }
      : null,
  };
}

export async function listDoctorPrescriptions(
  doctorUserId: string,
  filters: ListDoctorPrescriptionsFilters
) {
  const [rows, total, statsRow] = await Promise.all([
    repo.getDoctorPrescriptionsList(doctorUserId, filters),
    repo.getDoctorPrescriptionsCount(doctorUserId, filters),
    repo.getDoctorPrescriptionsStats(doctorUserId),
  ]);

  return {
    data: rows.map(mapPrescriptionListItem),
    stats: {
      totalCount: parseInt(statsRow?.total_count ?? "0", 10),
      todayCount: parseInt(statsRow?.today_count ?? "0", 10),
      followUpCount: parseInt(statsRow?.follow_up_count ?? "0", 10),
    },
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function getDoctorPrescriptionDetail(doctorUserId: string, prescriptionId: string) {
  const row = await repo.getDoctorPrescriptionDetail(doctorUserId, prescriptionId);
  if (!row) {
    throw new AppError("Không tìm thấy đơn thuốc", "PRESCRIPTION_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const items = await repo.getDoctorPrescriptionItems(prescriptionId);
  return mapPrescriptionDetail(row, items);
}
