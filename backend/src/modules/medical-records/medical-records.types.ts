export type DoctorMedicalRecordSpeciesFilter =
  | "ALL"
  | "Dog"
  | "Cat"
  | "Other";

export type DoctorMedicalRecordExamStatus =
  | "result_recorded"
  | "prescribed"
  | "follow_up_required";

export interface DoctorMedicalRecordsQueryDto {
  keyword: string;
  species: DoctorMedicalRecordSpeciesFilter;
  examStatus: "ALL" | DoctorMedicalRecordExamStatus;
  page: number;
  limit: number;
}

export interface DoctorMedicalRecordListItemDto {
  petId: string;
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  avatarUrl: string | null;
  ownerId: string;
  ownerName: string;
  ownerPhone: string | null;
  latestExamId: string;
  latestExamDate: string;
  latestDiagnosis: string;
  latestExamTypeCode: string | null;
  latestExamTypeName: string | null;
  examStatus: DoctorMedicalRecordExamStatus;
}

export interface DoctorMedicalRecordListResponseDto {
  items: DoctorMedicalRecordListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorMedicalRecordPetProfileDto {
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
    email: string | null;
    address: string | null;
  };
}

export interface DoctorMedicalExamHistoryItemDto {
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

export interface DoctorMedicalExamFieldValueDto {
  fieldValueId: string;
  examId: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "date" | "select" | "file";
  valueText: string | null;
  valueNumber: number | null;
  valueDate: string | null;
  fileUrl: string | null;
  displayOrder: number;
}

export interface DoctorVaccinationItemDto {
  vaccinationId: string;
  examId: string | null;
  vaccineName: string;
  vaccinationDate: string;
  note: string | null;
}

export interface DoctorPrescriptionItemDto {
  prescriptionItemId: string;
  medicineName: string;
  medicineUnit: string;
  quantity: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  usageInstruction: string | null;
  note: string | null;
}

export interface DoctorPrescriptionRecordDto {
  prescriptionId: string;
  examId: string;
  prescribedAt: string;
  generalNote: string | null;
  items: DoctorPrescriptionItemDto[];
}

export interface DoctorFollowUpInstructionItemDto {
  followUpId: string;
  examId: string;
  followUpDate: string;
  reason: string;
  ownerNote: string | null;
  followUpStatus: "pending" | "completed" | "cancelled";
  completedAt: string | null;
}

export interface DoctorMedicalRecordDetailDto {
  pet: DoctorMedicalRecordPetProfileDto;
  exams: DoctorMedicalExamHistoryItemDto[];
  examFieldValues: DoctorMedicalExamFieldValueDto[];
  vaccinations: DoctorVaccinationItemDto[];
  prescriptions: DoctorPrescriptionRecordDto[];
  followUps: DoctorFollowUpInstructionItemDto[];
}
