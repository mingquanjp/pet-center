import { apiRequest } from "@/lib/api"
import type { AdminDashboardOverview } from "../types/admin-dashboard.types"

export const adminDashboardApi = {
  async getOverview(params: { startDate: string; endDate: string }, init: RequestInit = {}): Promise<AdminDashboardOverview> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    })
    const response = await apiRequest<AdminDashboardOverview>(`/dashboards/admin/overview?${searchParams.toString()}`, init)

    return response.data
  },
}
