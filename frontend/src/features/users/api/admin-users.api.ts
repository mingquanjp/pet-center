import { apiRequest } from "@/lib/api";
import type { AdminUser, AdminUserFilters, AdminUserStats } from "../types/admin-user.types";

export type AdminUsersListResponse = {
  data: AdminUser[];
  stats: AdminUserStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const adminUsersApi = {
  list: async (filters: AdminUserFilters): Promise<AdminUsersListResponse> => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.role !== "ALL") params.set("role", filters.role);
    if (filters.status !== "ALL") params.set("status", filters.status);
    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    const response = await apiRequest<AdminUser[]>(`/admin/users?${params.toString()}`);

    return response as unknown as AdminUsersListResponse;
  },
};
