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
