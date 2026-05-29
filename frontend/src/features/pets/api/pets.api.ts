import { apiRequest, clearApiCache } from "@/lib/api";
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
  StaffCreatePetInput,
  StaffCreateOwnerInput,
  StaffOwnerCandidate,
  StaffPet,
  StaffPetDetail,
  StaffUpdatePetInput,
} from "../types/pet.types";

function buildQuery(params: Record<string, string | number | undefined>): string {
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
    const response = await apiRequest<Pet[]>(`/pets${buildQuery(params)}`, {
      cacheTtlMs: 60 * 1000,
      ...init,
    });

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

  async listStaff(params: PetsListParams = {}, init: RequestInit = {}): Promise<{ pets: StaffPet[]; pagination: Pagination }> {
    const response = await apiRequest<StaffPet[]>(`/staff/pets${buildQuery(params)}`, {
      cacheTtlMs: 60 * 1000,
      ...init,
    });

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

  async getStaff(petId: string, init: RequestInit = {}): Promise<StaffPetDetail> {
    const response = await apiRequest<StaffPetDetail>(`/staff/pets/${encodeURIComponent(petId)}`, {
      cacheTtlMs: 60 * 1000,
      ...init,
    });

    return response.data;
  },

  async searchStaffOwners(q: string, init: RequestInit = {}): Promise<StaffOwnerCandidate[]> {
    const response = await apiRequest<StaffOwnerCandidate[]>(`/staff/owners/search${buildQuery({ q })}`, {
      cacheTtlMs: 30 * 1000,
      ...init,
    });

    return response.data;
  },

  async createStaffOwner(payload: StaffCreateOwnerInput): Promise<StaffOwnerCandidate> {
    const response = await apiRequest<StaffOwnerCandidate>("/staff/owners", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    clearApiCache("/staff/owners/search");

    return response.data;
  },

  async createStaff(payload: StaffCreatePetInput): Promise<StaffPetDetail> {
    const response = await apiRequest<StaffPetDetail>("/staff/pets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    clearApiCache("/staff/pets");

    return response.data;
  },

  async updateStaff(petId: string, payload: StaffUpdatePetInput): Promise<StaffPetDetail> {
    const response = await apiRequest<StaffPetDetail>(`/staff/pets/${encodeURIComponent(petId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    clearApiCache("/staff/pets");
    clearApiCache(`/staff/pets/${encodeURIComponent(petId)}`);

    return response.data;
  },

  async create(payload: CreatePetInput): Promise<Pet> {
    const response = await apiRequest<Pet>("/pets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    clearApiCache("/pets");

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
    const response = await apiRequest<PetMedicalExam[]>(
      `/pets/${encodeURIComponent(petId)}/medical-exams${buildQuery(params)}`,
      init
    );

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
    const response = await apiRequest<PetVaccination[]>(
      `/pets/${encodeURIComponent(petId)}/vaccinations${buildQuery(params)}`,
      init
    );

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
