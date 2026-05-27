import { apiRequest } from "@/lib/api"
import type {
  BoardingBookingOptions,
  BoardingBookingOptionsParams,
  BoardingRecordCreated,
  BoardingRecordListItem,
  BoardingRecordListParams,
  CreateBoardingRecordPayload,
  Pagination,
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

  async getOwnerRecordById(
    boardingRecordId: string,
    init: RequestInit = {}
  ): Promise<BoardingRecordListItem | null> {
    const result = await this.listOwnerRecords(
      {
        search: boardingRecordId,
        page: 1,
        limit: 10,
      },
      init
    )

    return result.records.find((record) => record.boardingRecordId === boardingRecordId) ?? null
  },
}
