import { apiRequest } from "@/lib/api";
import type { StaffDashboardOverview } from "../types/staff-dashboard.types";

export const staffDashboardApi = {
  async getOverview(taskLimit = 2): Promise<StaffDashboardOverview> {
    const response = await apiRequest<StaffDashboardOverview>(
      `/dashboards/staff/overview?taskLimit=${encodeURIComponent(String(taskLimit))}`,
      { cacheTtlMs: 30 * 1000 }
    );

    return response.data;
  },
};
