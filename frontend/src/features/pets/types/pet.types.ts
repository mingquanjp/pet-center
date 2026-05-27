export type PetSpecies = "Dog" | "Cat" | "Other";
export type PetGender = "male" | "female" | "unknown";
export type PetDisplayStatus = "healthy" | "watching" | "boarding" | "inactive" | "deceased";

export type Pet = {
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
  petStatus: "active" | "inactive" | "deceased";
  displayStatus: PetDisplayStatus;
  displayStatusLabel: string;
};

export type PetHealthProfile = {
  medicalHistory: string | null;
  allergyNotes: string | null;
  chronicConditionNotes: string | null;
  foodType: string | null;
  feedingPortion: string | null;
  specialCareNotes: string | null;
  updatedAt: string | null;
};

export type PetDetail = Pet & {
  healthProfile: PetHealthProfile;
  recentActivities: PetActivityLog[];
};

export type PetActivityLog = {
  activityLogId: string;
  petId: string;
  ownerUserId: string;
  actorUserId: string | null;
  actorName: string | null;
  activityCategory: "medical" | "vaccination" | "grooming" | "boarding" | "invoice" | "payment" | "profile";
  activityType: string;
  activityStatus: "scheduled" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "failed";
  occurredAt: string;
  title: string;
  summary: string | null;
  sourceType:
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
  sourceId: string;
  metadata: Record<string, unknown>;
};

export type PetMedicalExam = {
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

export type PetMedicalExamFieldValue = {
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

export type PetPrescriptionItem = {
  prescriptionItemId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  usageInstruction: string | null;
  note: string | null;
};

export type PetPrescription = {
  prescriptionId: string;
  prescribedAt: string;
  generalNote: string | null;
  items: PetPrescriptionItem[];
};

export type PetFollowUpInstruction = {
  followUpId: string;
  followUpDate: string;
  reason: string;
  ownerNote: string | null;
};

export type PetMedicalExamDetail = PetMedicalExam & {
  pet: Pet;
  fieldValues: PetMedicalExamFieldValue[];
  prescription: PetPrescription | null;
  followUp: PetFollowUpInstruction | null;
};

export type PetVaccinationStatus = "completed" | "due-soon" | "overdue";

export type PetVaccination = {
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

export type PetMedicalExamsParams = {
  q?: string;
  examType?: "all" | PetMedicalExam["examTypeCode"];
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type PetVaccinationsParams = {
  q?: string;
  status?: "all" | PetVaccinationStatus;
  page?: number;
  limit?: number;
};

export type PetHealthProfileInput = {
  medicalHistory?: string | null;
  allergyNotes?: string | null;
  chronicConditionNotes?: string | null;
  foodType?: string | null;
  feedingPortion?: string | null;
  specialCareNotes?: string | null;
};

export type CreatePetInput = {
  petName: string;
  species: PetSpecies;
  breed?: string | null;
  gender?: PetGender | null;
  birthDate?: string | null;
  estimatedAge?: number | null;
  furColor?: string | null;
  weightKg?: number | null;
  profileImageUrl?: string | null;
  identifyingMarks?: string | null;
  healthProfile?: PetHealthProfileInput;
};

export type PetsListParams = {
  q?: string;
  species?: "all" | PetSpecies;
  page?: number;
  limit?: number;
  sort?: "petName:asc" | "petName:desc";
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
