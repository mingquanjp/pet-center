import { apiRequest } from "@/lib/api";
import type {
  AdminUser,
  AdminUserActivity,
  AdminUserDetail,
  AdminUserFilters,
  AdminUserStats,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from "../types/admin-user.types";

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

export type AdminUserActivitiesResponse = {
  data: AdminUserActivity[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
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
  create: async (input: CreateAdminUserInput): Promise<AdminUser> => {
    const response = await apiRequest<AdminUser>("/admin/users", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return response.data;
  },
  getDetail: async (userId: string): Promise<AdminUserDetail> => {
    const response = await apiRequest<AdminUserDetail>(`/admin/users/${userId}`);

    return response.data;
  },
  listActivities: async (userId: string, params: { limit: number; offset: number }): Promise<AdminUserActivitiesResponse> => {
    const searchParams = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    const response = await apiRequest<AdminUserActivity[]>(`/admin/users/${userId}/activities?${searchParams.toString()}`);

    return response as unknown as AdminUserActivitiesResponse;
  },
  update: async (userId: string, input: UpdateAdminUserInput): Promise<AdminUser> => {
    const response = await apiRequest<AdminUser>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });

    return response.data;
  },
  delete: async (userId: string): Promise<AdminUser> => {
    const response = await apiRequest<AdminUser>(`/admin/users/${userId}`, {
      method: "DELETE",
    });

    return response.data;
  },
};
