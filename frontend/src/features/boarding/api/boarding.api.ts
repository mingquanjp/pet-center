import { apiRequest } from "@/lib/api"
import type { BoardingRecordListItem, BoardingRecordListParams, Pagination } from "../types/boarding.types"

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
}
