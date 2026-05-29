export type PetSpecies = "Dog" | "Cat" | "Other";
export type PetGender = "male" | "female" | "unknown";
export type PetStatus = "active" | "inactive" | "deceased";
export type PetDisplayStatus = "healthy" | "watching" | "boarding" | "inactive" | "deceased";

export type PetHealthProfileInput = {
  medicalHistory?: string | null;
  allergyNotes?: string | null;
  chronicConditionNotes?: string | null;
  foodType?: string | null;
  feedingPortion?: string | null;
  specialCareNotes?: string | null;
};

export type PetDto = {
  petId: string;
  petName: string;
  species: PetSpecies;
  speciesLabel: string;
  breed: string | null;
  gender: PetGender | null;
  genderLabel: string;
  birthDate: string | null;
  estimatedAge: number | null;
  ageLabel: string;
  furColor: string | null;
  weightKg: number | null;
  profileImageUrl: string | null;
  identifyingMarks: string | null;
  petStatus: PetStatus;
  displayStatus: PetDisplayStatus;
  displayStatusLabel: string;
};

export type StaffPetDto = PetDto & {
  owner: {
    userId: string;
    fullName: string;
    phoneNumber: string | null;
  };
};

export type StaffPetDetailDto = PetDetailDto & {
  owner: {
    userId: string;
    fullName: string;
    phoneNumber: string | null;
    email: string | null;
    address: string | null;
  };
};

export type StaffOwnerCandidateDto = {
  userId: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
};

export type PetDetailDto = PetDto & {
  healthProfile: {
    medicalHistory: string | null;
    allergyNotes: string | null;
    chronicConditionNotes: string | null;
    foodType: string | null;
    feedingPortion: string | null;
    specialCareNotes: string | null;
    updatedAt: string | null;
  };
  recentActivities: PetActivityLogDto[];
};

export type PetActivityCategory = "medical" | "vaccination" | "grooming" | "boarding" | "invoice" | "payment" | "profile";
export type PetActivityStatus = "scheduled" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "failed";
export type PetActivitySourceType =
  | "medical_appointment"
  | "medical_exam"
  | "vaccination"
  | "prescription"
  | "follow_up_instruction"
  | "grooming_ticket"
  | "boarding_record"
  | "boarding_update"
  | "invoice"
  | "payment"
  | "pet";

export type PetActivityLogDto = {
  activityLogId: string;
  petId: string;
  ownerUserId: string;
  actorUserId: string | null;
  actorName: string | null;
  activityCategory: PetActivityCategory;
  activityType: string;
  activityStatus: PetActivityStatus;
  occurredAt: string;
  title: string;
  summary: string | null;
  sourceType: PetActivitySourceType;
  sourceId: string;
  metadata: Record<string, unknown>;
};

export type PetMedicalExamDto = {
  examId: string;
  appointmentId: string;
  petId: string;
  examTypeId: string;
  examTypeCode: "general_checkup" | "vaccination" | "lab_test" | "recheck";
  examTypeName: string;
  scheduledAt: string;
  examDate: string;
  veterinarianUserId: string;
  veterinarianName: string;
  diagnosis: string | null;
  conclusion: string | null;
  healthNote: string | null;
  examStatus: "result_recorded" | "prescribed" | "follow_up_required";
  symptomDescription: string | null;
  hasPrescription: boolean;
  hasFollowUp: boolean;
  followUpDate: string | null;
  followUpReason: string | null;
};

export type PetMedicalExamFieldValueDto = {
  fieldValueId: string;
  fieldDefinitionId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "date" | "select" | "file";
  valueText: string | null;
  valueNumber: number | null;
  valueDate: string | null;
  fileUrl: string | null;
  createdAt: string;
};

export type PetPrescriptionItemDto = {
  prescriptionItemId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  usageInstruction: string | null;
  note: string | null;
};

export type PetPrescriptionDto = {
  prescriptionId: string;
  prescribedAt: string;
  generalNote: string | null;
  items: PetPrescriptionItemDto[];
};

export type PetFollowUpInstructionDto = {
  followUpId: string;
  followUpDate: string;
  reason: string;
  ownerNote: string | null;
};

export type PetMedicalExamDetailDto = PetMedicalExamDto & {
  pet: PetDto;
  fieldValues: PetMedicalExamFieldValueDto[];
  prescription: PetPrescriptionDto | null;
  followUp: PetFollowUpInstructionDto | null;
};

export type PetVaccinationStatus = "completed" | "due-soon" | "overdue";

export type PetVaccinationDto = {
  vaccinationId: string;
  petId: string;
  examId: string | null;
  appointmentId: string | null;
  vaccineName: string;
  vaccinationDate: string;
  nextReminderDate: string;
  status: PetVaccinationStatus;
  note: string | null;
  veterinarianUserId: string | null;
  veterinarianName: string | null;
};

export type PetMedicalExamFilters = {
  ownerUserId: string;
  petId: string;
  q?: string;
  examType?: PetMedicalExamDto["examTypeCode"];
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
  offset: number;
};

export type PetVaccinationFilters = {
  ownerUserId: string;
  petId: string;
  q?: string;
  status?: PetVaccinationStatus;
  page: number;
  limit: number;
  offset: number;
};

export type PetListFilters = {
  ownerUserId: string;
  q?: string;
  species?: PetSpecies;
  gender?: PetDto["gender"];
  petStatus?: PetStatus;
  sort: "petName:asc" | "petName:desc";
  page: number;
  limit: number;
  offset: number;
};

export type StaffPetListFilters = Omit<PetListFilters, "ownerUserId">;
