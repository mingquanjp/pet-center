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

export type PetListFilters = {
  ownerUserId: string;
  q?: string;
  species?: PetSpecies;
  sort: "petName:asc" | "petName:desc";
  page: number;
  limit: number;
  offset: number;
};
