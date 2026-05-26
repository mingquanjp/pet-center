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

export type PetsListParams = {
  species?: "all" | PetSpecies;
  status?: "all" | PetDisplayStatus;
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
