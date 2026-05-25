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
};

export type PetListFilters = {
  ownerUserId: string;
  species?: PetSpecies;
  status?: PetDisplayStatus;
  sort: "petName:asc" | "petName:desc";
  page: number;
  limit: number;
  offset: number;
};
