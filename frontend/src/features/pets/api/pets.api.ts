import { apiRequest } from "@/lib/api";
import type { Pagination, Pet, PetsListParams } from "../types/pet.types";

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
  async list(params: PetsListParams = {}): Promise<{ pets: Pet[]; pagination: Pagination }> {
    const response = await apiRequest<Pet[]>(`/pets${buildQuery(params)}`);

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
};
