import { apiRequest } from "@/lib/api";
import { AdminBoardingRoom, CreateAdminBoardingRoomPayload, UpdateAdminBoardingRoomPayload, AdminBoardingRoomUsageRecord, AdminBoardingRoomFilters, AdminBoardingRoomsApiResponse } from "../types/room.types";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "ALL") {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return query ? `?${query}` : ""
}

export const adminBoardingRoomsApi = {
  getRoomUsageHistory: async (roomTypeId: string, params?: Record<string, string | number | undefined>): Promise<AdminBoardingRoomUsageRecord[]> => {
    const response = await apiRequest<{ items: AdminBoardingRoomUsageRecord[], pagination: unknown }>(
      `/admin/boarding-rooms/${roomTypeId}/usage-history${buildQuery(params || {})}`
    );
    return response.data.items;
  },

  getRooms: async (
    params?: Partial<AdminBoardingRoomFilters> & { page?: number; limit?: number },
    init?: RequestInit
  ): Promise<AdminBoardingRoomsApiResponse> => {
    const response = await apiRequest<AdminBoardingRoomsApiResponse>(
      `/admin/boarding-rooms${buildQuery(params || {})}`,
      init
    );
    return response.data;
  },
  
  getRoomDetail: async (roomId: string): Promise<AdminBoardingRoom> => {
    const response = await apiRequest<AdminBoardingRoom>(`/admin/boarding-rooms/${roomId}`);
    return response.data;
  },

  createRoom: async (payload: CreateAdminBoardingRoomPayload): Promise<AdminBoardingRoom> => {
    const response = await apiRequest<AdminBoardingRoom>("/admin/boarding-rooms", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return response.data;
  },
  
  updateRoom: async (payload: UpdateAdminBoardingRoomPayload): Promise<AdminBoardingRoom> => {
    const { id, ...rest } = payload;
    const response = await apiRequest<AdminBoardingRoom>(`/admin/boarding-rooms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(rest)
    });
    return response.data;
  },
  
  toggleRoomStatus: async (roomId: string, status: string): Promise<AdminBoardingRoom> => {
    const response = await adminBoardingRoomsApi.updateRoomStatus(roomId, status);
    return response;
  },

  updateRoomStatus: async (roomId: string, status: string): Promise<AdminBoardingRoom> => {
    const response = await apiRequest<AdminBoardingRoom>(`/admin/boarding-rooms/${roomId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    return response.data;
  },
  
  deleteRoom: async (roomId: string): Promise<{ deleted: boolean, deactivated: boolean, id: string, message: string }> => {
    const response = await apiRequest<{ deleted: boolean, deactivated: boolean, id: string, message: string }>(`/admin/boarding-rooms/${roomId}`, {
      method: "DELETE"
    });
    return response.data;
  }
};
