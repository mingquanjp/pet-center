import { apiRequest } from "@/lib/api";
import type { OwnerDashboard, OwnerDashboardActivity, Pagination } from "../types/owner-dashboard.types";

export const ownerDashboardApi = {
  async get(init: RequestInit = {}): Promise<OwnerDashboard> {
    const response = await apiRequest<OwnerDashboard>("/owner/dashboard", init);

    return response.data;
  },

  async listActivityLogs(
    params: { page?: number; limit?: number } = {},
    init: RequestInit = {}
  ): Promise<{ activities: OwnerDashboardActivity[]; pagination: Pagination }> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    const response = await apiRequest<OwnerDashboardActivity[]>(
      `/owner/dashboard/activity-logs${query ? `?${query}` : ""}`,
      init
    );

    return {
      activities: response.data,
      pagination: response.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? response.data.length,
        total: response.data.length,
        totalPages: response.data.length > 0 ? 1 : 0,
      },
    };
  },
};
