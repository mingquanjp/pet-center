import { apiRequest } from "@/lib/api"
import type { AdminDashboardOverview, AdminDashboardRecentActivity, Pagination } from "../types/admin-dashboard.types"

export const adminDashboardApi = {
  async getOverview(params: { startDate: string; endDate: string }, init: RequestInit = {}): Promise<AdminDashboardOverview> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    })
    const response = await apiRequest<AdminDashboardOverview>(`/dashboards/admin/overview?${searchParams.toString()}`, init)

    return response.data
  },

  async listActivityLogs(
    params: { startDate?: string; endDate?: string; page?: number; limit?: number } = {},
    init: RequestInit = {}
  ): Promise<{ activities: AdminDashboardRecentActivity[]; pagination: Pagination }> {
    const searchParams = new URLSearchParams()

    if (params.startDate) searchParams.set("startDate", params.startDate)
    if (params.endDate) searchParams.set("endDate", params.endDate)
    if (params.page) searchParams.set("page", String(params.page))
    if (params.limit) searchParams.set("limit", String(params.limit))

    const query = searchParams.toString()
    const response = await apiRequest<AdminDashboardRecentActivity[]>(
      `/dashboards/admin/activity-logs${query ? `?${query}` : ""}`,
      init
    )

    return {
      activities: response.data,
      pagination: response.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? response.data.length,
        total: response.data.length,
        totalPages: response.data.length > 0 ? 1 : 0,
      },
    }
  },
}
