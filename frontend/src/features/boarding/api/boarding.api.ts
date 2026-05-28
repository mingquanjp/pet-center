import { apiRequest } from "@/lib/api"
import type {
  BoardingBookingOptions,
  BoardingBookingOptionsParams,
  BoardingRecordCreated,
  BoardingRecordListItem,
  BoardingRecordListParams,
  CreateBoardingRecordPayload,
  Pagination,
  StaffBoardingListItem,
  StaffBoardingPagination,
  StaffBoardingStats,
  StaffBoardingListQuery,
  StaffBoardingDraftUpdate,
  StaffBoardingDetail,
} from "../types/boarding.types"

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return query ? `?${query}` : ""
}

export const boardingApi = {

  async getBookingOptions(
    params: BoardingBookingOptionsParams = {},
    init: RequestInit = {}
  ): Promise<BoardingBookingOptions> {
    const response = await apiRequest<BoardingBookingOptions>(
      `/boarding/booking-options${buildQuery({
        petId: params.petId,
        plannedCheckInAt: params.plannedCheckInAt,
        plannedCheckOutAt: params.plannedCheckOutAt,
      })}`,
      init
    )

    return response.data
  },

  async createRecord(payload: CreateBoardingRecordPayload, init: RequestInit = {}): Promise<BoardingRecordCreated> {
    const response = await apiRequest<BoardingRecordCreated>("/boarding/records", {
      ...init,
      method: "POST",
      body: JSON.stringify(payload),
    })

    return response.data
  },

  async listOwnerRecords(
    params: BoardingRecordListParams = {},
    init: RequestInit = {}
  ): Promise<{ records: BoardingRecordListItem[]; pagination: Pagination }> {
    const response = await apiRequest<BoardingRecordListItem[]>(
      `/boarding/records${buildQuery({
        search: params.search,
        status: params.status,
        roomTypeId: params.roomTypeId,
        timeRange: params.timeRange,
        page: params.page,
        limit: params.limit,
      })}`,
      init
    )

    return {
      records: response.data,
      pagination: response.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? response.data.length,
        total: response.data.length,
        totalPages: response.data.length > 0 ? 1 : 0,
      },
    }
  },

  async getRoomTypes(init: RequestInit = {}): Promise<{ id: string; name: string }[]> {
    const response = await apiRequest<{ id: string; name: string }[]>("/staff/boarding/room-types", init)
    return response.data
  },

  async getStaffBoarding(
    query: StaffBoardingListQuery,
    init: RequestInit = {}
  ): Promise<{ data: StaffBoardingListItem[]; stats: StaffBoardingStats; pagination: StaffBoardingPagination }> {
    const response = await apiRequest<StaffBoardingListItem[]>(
      `/staff/boarding${buildQuery({
        search: query.search,
        status: query.status,
        tab: query.tab,
        roomType: query.roomType,
        timeRange: query.timeRange,
        page: query.page,
        limit: query.limit,
      })}`,
      init
    )

    return {
      data: response.data,
      stats: response.stats as StaffBoardingStats,
      pagination: response.pagination as StaffBoardingPagination
    }
  },

  async getStaffBoardingDetail(boardingId: string, init: RequestInit = {}): Promise<StaffBoardingDetail> {
    const response = await apiRequest<StaffBoardingDetail>(`/staff/boarding/${boardingId}`, init)
    return response.data
  },

  async confirmStaffBoarding(boardingId: string, payload: { internalNote?: string }, init: RequestInit = {}): Promise<void> {
    await apiRequest(`/staff/boarding/${boardingId}/confirm`, {
      ...init,
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async rejectStaffBoarding(boardingId: string, payload: { rejectionReason: string, internalNote?: string }, init: RequestInit = {}): Promise<void> {
    await apiRequest(`/staff/boarding/${boardingId}/reject`, {
      ...init,
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async checkInStaffBoarding(boardingId: string, payload: { internalNote?: string }, init: RequestInit = {}): Promise<void> {
    await apiRequest(`/staff/boarding/${boardingId}/check-in`, {
      ...init,
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async checkOutStaffBoarding(boardingId: string, payload: { internalNote?: string, finalAmount?: number }, init: RequestInit = {}): Promise<void> {
    await apiRequest(`/staff/boarding/${boardingId}/check-out`, {
      ...init,
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async getStaffBoardingDraftUpdate(boardingId: string, init: RequestInit = {}): Promise<StaffBoardingDraftUpdate | null> {
    const response = await apiRequest<StaffBoardingDraftUpdate | null>(`/staff/boarding/${boardingId}/draft-update`, init)
    return response.data
  },

  async updateStaffBoardingLog(boardingId: string, payload: { description: string; alertLevel?: string; visibilityStatus?: string; attachmentUrl?: string | null; attachmentUrls?: string[] }, init: RequestInit = {}): Promise<void> {
    await apiRequest(`/staff/boarding/${boardingId}/update-log`, {
      ...init,
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async deleteStaffBoardingDraftUpdate(boardingId: string, init: RequestInit = {}): Promise<void> {
    await apiRequest(`/staff/boarding/${boardingId}/draft-update`, {
      ...init,
      method: "DELETE",
    })
  }
}
