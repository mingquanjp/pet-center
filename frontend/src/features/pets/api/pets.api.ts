import { apiRequest } from "@/lib/api";
import type {
  CreatePetInput,
  Pagination,
  Pet,
  PetDetail,
  PetMedicalExam,
  PetMedicalExamDetail,
  PetMedicalExamsParams,
  PetVaccination,
  PetVaccinationsParams,
  PetsListParams,
} from "../types/pet.types";

function buildQuery(params: PetsListParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export const petsApi = {
  async list(params: PetsListParams = {}, init: RequestInit = {}): Promise<{ pets: Pet[]; pagination: Pagination }> {
    const response = await apiRequest<Pet[]>(`/pets${buildQuery(params)}`, init);

    return {
      pets: response.data,
      pagination: response.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? response.data.length,
        total: response.data.length,
        totalPages: response.data.length > 0 ? 1 : 0,
      },
    };
  },

  async create(payload: CreatePetInput): Promise<Pet> {
    const response = await apiRequest<Pet>("/pets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  async get(petId: string): Promise<PetDetail> {
    const response = await apiRequest<PetDetail>(`/pets/${encodeURIComponent(petId)}`);

    return response.data;
  },

  async listMedicalExams(
    petId: string,
    params: PetMedicalExamsParams = {},
    init: RequestInit = {}
  ): Promise<{ exams: PetMedicalExam[]; pagination: Pagination }> {
    const response = await apiRequest<PetMedicalExam[]>(`/pets/${encodeURIComponent(petId)}/medical-exams${buildQuery(params)}`, init);

    return {
      exams: response.data,
      pagination: response.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? response.data.length,
        total: response.data.length,
        totalPages: response.data.length > 0 ? 1 : 0,
      },
    };
  },

  async getMedicalExam(petId: string, examId: string, init: RequestInit = {}): Promise<PetMedicalExamDetail> {
    const response = await apiRequest<PetMedicalExamDetail>(
      `/pets/${encodeURIComponent(petId)}/medical-exams/${encodeURIComponent(examId)}`,
      init
    );

    return response.data;
  },

  async listVaccinations(
    petId: string,
    params: PetVaccinationsParams = {},
    init: RequestInit = {}
  ): Promise<{ vaccinations: PetVaccination[]; pagination: Pagination }> {
    const response = await apiRequest<PetVaccination[]>(`/pets/${encodeURIComponent(petId)}/vaccinations${buildQuery(params)}`, init);

    return {
      vaccinations: response.data,
      pagination: response.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? response.data.length,
        total: response.data.length,
        totalPages: response.data.length > 0 ? 1 : 0,
      },
    };
  },
};
