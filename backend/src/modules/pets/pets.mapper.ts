import { AppError } from "../../shared/errors/app-error.js";
import { PetSpecies, PetGender, PetDisplayStatus, PetHealthProfileInput, PetDto, StaffPetDto, StaffPetDetailDto, StaffOwnerCandidateDto, PetDetailDto, PetActivityCategory, PetActivityStatus, PetActivitySourceType, PetActivityLogDto, PetMedicalExamDto, PetMedicalExamFieldValueDto, PetPrescriptionItemDto, PetPrescriptionDto, PetFollowUpInstructionDto, PetMedicalExamDetailDto, PetVaccinationStatus, PetVaccinationDto, PetSpaHistoryDto, PetMedicalExamFilters, PetVaccinationFilters, PetSpaHistoryFilters, PetListFilters, StaffPetListFilters } from "./pets.types.js";
import { PetRow, PetDetailRow, StaffPetRow, StaffPetDetailRow, StaffOwnerCandidateRow, PetActivityLogRow, CountRow, PetMedicalExamRow, PetMedicalExamDetailRow, PetMedicalExamFieldValueRow, PrescriptionRow, PrescriptionItemRow, PetVaccinationRow, PetSpaHistoryRow } from "./pets.repository.js";

import { httpStatus } from "../../shared/errors/http-status.js";


export function toDateInput(value: Date | null | undefined): string | null {
    return value ? value.toISOString().slice(0, 10) : null;
}

export function toNumber(value: string | number | null): number | null {
    if (value === null) return null;
    return Number(value);
}

export function getSpeciesLabel(species: PetSpecies): string {
    const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác"
    } as const;

    return labels[species];
}

export function getGenderLabel(gender: PetRow["gender"]): string {
    const labels = {
    male: "Đực",
    female: "Cái",
    unknown: "Chưa rõ"
    } as const;

    return gender ? labels[gender] : "Chưa cập nhật";
}

export function getAgeLabel(row: PetRow): string {
    if (row.birth_date) {
    const birthDate = new Date(row.birth_date);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday =
      now.getMonth() > birthDate.getMonth() ||
      (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());

    if (!hasHadBirthday) years -= 1;

    return years > 0 ? `${years} năm tuổi` : "Dưới 1 năm tuổi";
    }

    const estimatedAge = toNumber(row.estimated_age);

    if (estimatedAge === null) return "Chưa cập nhật";
    if (estimatedAge < 1) return "Dưới 1 năm tuổi";

    return `${Math.floor(estimatedAge)} năm tuổi`;
}

export function getDisplayStatus(row: PetRow): PetDisplayStatus {
    if (row.has_active_boarding) return "boarding";
    if (row.needs_attention) return "watching";

    return "healthy";
}

export function getDisplayStatusLabel(displayStatus: PetDisplayStatus): string {
    const labels = {
    healthy: "Khỏe mạnh",
    watching: "Cần theo dõi",
    boarding: "Đang lưu trú",
    } as const;

    return labels[displayStatus];
}

export function mapPet(row: PetRow): PetDto {
    const displayStatus = getDisplayStatus(row);

    return {
    petId: row.pet_id,
    petName: row.pet_name,
    species: row.species,
    speciesLabel: getSpeciesLabel(row.species),
    breed: row.breed,
    gender: row.gender,
    genderLabel: getGenderLabel(row.gender),
    birthDate: row.birth_date,
    estimatedAge: toNumber(row.estimated_age),
    ageLabel: getAgeLabel(row),
    furColor: row.fur_color,
    weightKg: toNumber(row.weight_kg),
    profileImageUrl: row.profile_image_url,
    identifyingMarks: row.identifying_marks,
    displayStatus,
    displayStatusLabel: getDisplayStatusLabel(displayStatus)
    };
}

export function mapStaffPet(row: StaffPetRow): StaffPetDto {
    return {
    ...mapPet(row),
    owner: {
      userId: row.owner_user_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone_number
    }
    };
}

export function mapStaffPetDetail(row: StaffPetDetailRow, recentActivities: PetActivityLogDto[]): StaffPetDetailDto {
    return {
    ...mapPetDetail(row, recentActivities),
    owner: {
      userId: row.owner_user_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone_number,
      email: row.owner_email,
      address: row.owner_address
    }
    };
}

export function mapStaffOwnerCandidate(row: StaffOwnerCandidateRow): StaffOwnerCandidateDto {
    return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phoneNumber: row.phone_number,
    address: row.address
    };
}

export function mapPetDetail(row: PetDetailRow, recentActivities: PetActivityLogDto[]): PetDetailDto {
    return {
    ...mapPet(row),
    healthProfile: {
      medicalHistory: row.medical_history,
      allergyNotes: row.allergy_notes,
      chronicConditionNotes: row.chronic_condition_notes,
      foodType: row.food_type,
      feedingPortion: row.feeding_portion,
      specialCareNotes: row.special_care_notes,
      updatedAt: row.health_profile_updated_at
    },
    recentActivities
    };
}

export function normalizeMetadata(value: PetActivityLogRow["metadata"]): Record<string, unknown> {
    if (!value) return {};
    if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
    }

    return value;
}

export function mapPetActivityLog(row: PetActivityLogRow): PetActivityLogDto {
    return {
    activityLogId: row.activity_log_id,
    petId: row.pet_id,
    ownerUserId: row.owner_user_id,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    activityCategory: row.activity_category,
    activityType: row.activity_type,
    activityStatus: row.activity_status,
    occurredAt: row.occurred_at,
    title: row.title,
    summary: row.summary,
    sourceType: row.source_type,
    sourceId: row.source_id,
    metadata: normalizeMetadata(row.metadata)
    };
}

export function mapPetMedicalExam(row: PetMedicalExamRow): PetMedicalExamDto {
    return {
    examId: row.exam_id,
    appointmentId: row.appointment_id,
    petId: row.pet_id,
    examTypeId: row.exam_type_id,
    examTypeCode: row.type_code,
    examTypeName: row.type_name,
    scheduledAt: row.scheduled_at,
    examDate: row.exam_date,
    veterinarianUserId: row.veterinarian_user_id,
    veterinarianName: row.veterinarian_name,
    diagnosis: row.diagnosis,
    conclusion: row.conclusion,
    healthNote: row.health_note,
    examStatus: row.exam_status,
    symptomDescription: row.symptom_description,
    hasPrescription: row.has_prescription,
    hasFollowUp: row.has_follow_up,
    followUpDate: row.follow_up_date,
    followUpReason: row.follow_up_reason
    };
}

export function mapPetMedicalExamFieldValue(row: PetMedicalExamFieldValueRow): PetMedicalExamFieldValueDto {
    return {
    fieldValueId: row.field_value_id,
    fieldDefinitionId: row.field_definition_id,
    fieldName: row.field_name,
    fieldLabel: row.field_label,
    fieldType: row.field_type,
    valueText: row.value_text,
    valueNumber: toNumber(row.value_number),
    valueDate: row.value_date,
    fileUrl: row.file_url,
    createdAt: row.created_at
    };
}

export function mapPrescriptionItem(row: PrescriptionItemRow): PetPrescriptionItemDto {
    return {
    prescriptionItemId: row.prescription_item_id,
    medicineId: row.medicine_id,
    medicineName: row.medicine_name,
    medicineUnit: row.medicine_unit,
    quantity: row.quantity,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    usageInstruction: row.usage_instruction,
    note: row.note
    };
}

export function mapPetVaccination(row: PetVaccinationRow): PetVaccinationDto {
    return {
    vaccinationId: row.vaccination_id,
    petId: row.pet_id,
    examId: row.exam_id,
    appointmentId: row.appointment_id,
    vaccineName: row.vaccine_name,
    vaccinationDate: row.vaccination_date,
    nextReminderDate: row.next_reminder_date,
    status: row.status,
    note: row.note,
    veterinarianUserId: row.veterinarian_user_id,
    veterinarianName: row.veterinarian_name
    };
}

export function getSpaTicketStatusLabel(status: PetSpaHistoryDto["ticketStatus"]): string {
    const labels = {
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
    } as const;

    return labels[status];
}

export function mapPetSpaHistory(row: PetSpaHistoryRow): PetSpaHistoryDto {
    return {
    groomingTicketId: row.grooming_ticket_id,
    petId: row.pet_id,
    serviceName: row.service_name,
    serviceTypeName: row.service_type_name,
    scheduledAt: row.scheduled_at,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    ticketStatus: row.ticket_status,
    ticketStatusLabel: getSpaTicketStatusLabel(row.ticket_status),
    specialRequest: row.special_request,
    totalAmount: Number(row.total_amount),
    includedServices: row.included_services
    };
}
