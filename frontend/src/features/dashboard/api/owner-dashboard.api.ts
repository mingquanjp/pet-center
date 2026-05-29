import { apiRequest } from "@/lib/api";
import type { OwnerDashboard } from "../types/owner-dashboard.types";

export const ownerDashboardApi = {
  async get(init: RequestInit = {}): Promise<OwnerDashboard> {
    const response = await apiRequest<OwnerDashboard>("/owner/dashboard", init);

    return response.data;
  },
};
