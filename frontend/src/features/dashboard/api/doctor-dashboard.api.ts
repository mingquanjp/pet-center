import { apiRequest } from "@/lib/api";
import type { DoctorDashboardData } from "../types/doctor-dashboard.types";

export const doctorDashboardApi = {
  async getOverview(examLimit = 5, activityLimit = 3): Promise<DoctorDashboardData> {
    const params = new URLSearchParams({
      examLimit: String(examLimit),
      activityLimit: String(activityLimit),
    });
    const response = await apiRequest<DoctorDashboardData>(
      `/dashboards/doctor/overview?${params.toString()}`,
      { cacheTtlMs: 30 * 1000 }
    );

    return response.data;
  },
};
