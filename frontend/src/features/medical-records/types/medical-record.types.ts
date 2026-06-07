export type DoctorMedicalRecordExamStatus =
  | "result_recorded"
  | "prescribed"
  | "follow_up_required";

export interface DoctorMedicalRecordListItem {
  petId: string;
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed?: string;
  avatarUrl?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  latestExamId: string;
  latestExamDate: string;
  latestDiagnosis: string;
  examTypeCode:
    | "GENERAL_CHECKUP"
    | "VACCINATION"
    | "TESTING"
    | "FOLLOW_UP"
    | "PARASITE";
  examTypeName: string;
  examStatus: DoctorMedicalRecordExamStatus;
}

export interface DoctorMedicalRecordFilters {
  keyword: string;
  species: "ALL" | DoctorMedicalRecordListItem["species"];
  examStatus: "ALL" | DoctorMedicalRecordExamStatus;
  page: number;
  limit: number;
}

export interface DoctorMedicalRecordListResponse {
  items: DoctorMedicalRecordListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorMedicalRecordPetProfile {
  petId: string;
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  gender: "male" | "female" | "unknown" | null;
  birthDate: string | null;
  estimatedAge: number | null;
  furColor: string | null;
  weightKg: number | null;
  avatarUrl: string | null;
  owner: {
    ownerId: string;
    fullName: string;
    phoneNumber: string | null;
    email?: string | null;
    address?: string | null;
  };
}

export interface DoctorMedicalExamHistoryItem {
  examId: string;
  appointmentId: string;
  examDate: string;
  examTypeCode: string | null;
  examTypeName: string | null;
  veterinarianId: string;
  veterinarianName: string;
  symptomDescription: string | null;
  diagnosis: string | null;
  conclusion: string | null;
  healthNote: string | null;
  examStatus: DoctorMedicalRecordExamStatus;
}

export interface DoctorMedicalExamFieldValue {
  fieldValueId: string;
  examId: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "date" | "select" | "file";
  valueText?: string | null;
  valueNumber?: number | null;
  valueDate?: string | null;
  fileUrl?: string | null;
  displayOrder: number;
}

export interface DoctorVaccinationItem {
  vaccinationId: string;
  examId: string | null;
  vaccineName: string;
  vaccinationDate: string;
  note: string | null;
}

export interface DoctorPrescriptionItem {
  prescriptionItemId: string;
  medicineName: string;
  quantity: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  usageInstruction: string | null;
  note: string | null;
}

export interface DoctorPrescriptionRecord {
  prescriptionId: string;
  examId: string;
  prescribedAt: string;
  generalNote: string | null;
  items: DoctorPrescriptionItem[];
}

export interface DoctorFollowUpInstructionItem {
  followUpId: string;
  examId: string;
  followUpDate: string;
  reason: string;
  ownerNote: string | null;
  followUpStatus: "pending" | "completed" | "cancelled";
  completedAt: string | null;
}

export interface DoctorMedicalRecordDetail {
  pet: DoctorMedicalRecordPetProfile;
  exams: DoctorMedicalExamHistoryItem[];
  examFieldValues: DoctorMedicalExamFieldValue[];
  vaccinations: DoctorVaccinationItem[];
  prescriptions: DoctorPrescriptionRecord[];
  followUps: DoctorFollowUpInstructionItem[];
}
