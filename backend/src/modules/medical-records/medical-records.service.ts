import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import { findDoctorMedicalRecordDetailRows, findDoctorMedicalRecords } from "./medical-records.repository.js";
import {
  DoctorMedicalRecordDetailDto,
  DoctorMedicalRecordsQueryDto,
  DoctorMedicalRecordListResponseDto,
  DoctorMedicalRecordListItemDto,
  DoctorMedicalRecordExamStatus,
  DoctorPrescriptionItemDto,
} from "./medical-records.types.js";

export async function getDoctorMedicalRecords(
  query: DoctorMedicalRecordsQueryDto
): Promise<DoctorMedicalRecordListResponseDto> {
  const { keyword, species, examStatus, page, limit } = query;
  const offset = (page - 1) * limit;

  const { rows, total } = await findDoctorMedicalRecords({
    keyword,
    species,
    examStatus,
    limit,
    offset,
  });

  const items: DoctorMedicalRecordListItemDto[] = rows.map((row) => ({
    petId: row.pet_id,
    petName: row.pet_name,
    species: row.species as "Dog" | "Cat" | "Other",
    breed: row.breed || null,
    avatarUrl: row.avatar_url || null,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone || null,
    latestExamId: row.latest_exam_id,
    latestExamDate: row.latest_exam_date ? row.latest_exam_date.toISOString() : new Date().toISOString(),
    latestDiagnosis: row.latest_diagnosis || "Chưa có chẩn đoán",
    latestExamTypeCode: row.exam_type_code || null,
    latestExamTypeName: row.exam_type_name || null,
    examStatus: row.exam_status as DoctorMedicalRecordExamStatus,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getDoctorMedicalRecordDetail(petId: string): Promise<DoctorMedicalRecordDetailDto> {
  const rows = await findDoctorMedicalRecordDetailRows(petId);

  if (!rows.pet || rows.exams.length === 0) {
    throw new AppError("Không tìm thấy bệnh án", "MEDICAL_RECORD_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const prescriptionItemsByPrescriptionId = rows.prescriptionItems.reduce<Record<string, DoctorPrescriptionItemDto[]>>(
    (acc, item) => {
      acc[item.prescription_id] = acc[item.prescription_id] ?? [];
      acc[item.prescription_id].push({
        prescriptionItemId: item.prescription_item_id,
        medicineName: item.medicine_name,
        medicineUnit: item.medicine_unit,
        quantity: item.quantity,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        usageInstruction: item.usage_instruction,
        note: item.note,
      });
      return acc;
    },
    {}
  );

  return {
    pet: {
      petId: rows.pet.pet_id,
      petName: rows.pet.pet_name,
      species: rows.pet.species as "Dog" | "Cat" | "Other",
      breed: rows.pet.breed,
      gender: rows.pet.gender as "male" | "female" | "unknown" | null,
      birthDate: toDateString(rows.pet.birth_date),
      estimatedAge: toNumberOrNull(rows.pet.estimated_age),
      furColor: rows.pet.fur_color,
      weightKg: toNumberOrNull(rows.pet.weight_kg),
      avatarUrl: rows.pet.avatar_url,
      owner: {
        ownerId: rows.pet.owner_id,
        fullName: rows.pet.owner_name,
        phoneNumber: rows.pet.owner_phone,
        email: rows.pet.owner_email,
        address: rows.pet.owner_address,
      },
    },
    exams: rows.exams.map((exam) => ({
      examId: exam.exam_id,
      appointmentId: exam.appointment_id,
      examDate: toIsoString(exam.exam_date),
      examTypeCode: exam.exam_type_code,
      examTypeName: exam.exam_type_name,
      veterinarianId: exam.veterinarian_id,
      veterinarianName: exam.veterinarian_name,
      symptomDescription: exam.symptom_description,
      diagnosis: exam.diagnosis,
      conclusion: exam.conclusion,
      healthNote: exam.health_note,
      examStatus: exam.exam_status as DoctorMedicalRecordExamStatus,
    })),
    examFieldValues: rows.fieldValues.map((field) => ({
      fieldValueId: field.field_value_id,
      examId: field.exam_id,
      fieldLabel: field.field_label,
      fieldType: field.field_type,
      valueText: field.value_text,
      valueNumber: toNumberOrNull(field.value_number),
      valueDate: toDateString(field.value_date),
      fileUrl: field.file_url,
      displayOrder: field.display_order,
    })),
    vaccinations: rows.vaccinations.map((vaccination) => ({
      vaccinationId: vaccination.vaccination_id,
      examId: vaccination.exam_id,
      vaccineName: vaccination.vaccine_name,
      vaccinationDate: toDateString(vaccination.vaccination_date) ?? toIsoString(vaccination.vaccination_date),
      note: vaccination.note,
    })),
    prescriptions: rows.prescriptions.map((prescription) => ({
      prescriptionId: prescription.prescription_id,
      examId: prescription.exam_id,
      prescribedAt: toDateString(prescription.prescribed_at) ?? toIsoString(prescription.prescribed_at),
      generalNote: prescription.general_note,
      items: prescriptionItemsByPrescriptionId[prescription.prescription_id] ?? [],
    })),
    followUps: rows.followUps.map((followUp) => ({
      followUpId: followUp.follow_up_id,
      examId: followUp.exam_id,
      followUpDate: toDateString(followUp.follow_up_date) ?? toIsoString(followUp.follow_up_date),
      reason: followUp.reason,
      ownerNote: followUp.owner_note,
      followUpStatus: followUp.follow_up_status,
      completedAt: followUp.completed_at ? toIsoString(followUp.completed_at) : null,
    })),
  };
}

function toNumberOrNull(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function toDateString(value: Date | string | null): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function toIsoString(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}
