import { apiRequest } from "@/lib/api"
import type {
  GroomingTicketListItem,
  GroomingTicketListParams,
  CreateGroomingTicketPayload,
  GroomingAvailability,
  GroomingBookingOptions,
  GroomingService,
  GroomingTicketCreated,
  Pagination,
} from "../types/spa.types"

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

export const spaApi = {
  async listAvailableServices(init: RequestInit = {}): Promise<GroomingService[]> {
    const response = await apiRequest<GroomingService[]>("/grooming/services", init)

    return response.data
  },

  async getBookingOptions(petId?: string, init: RequestInit = {}): Promise<GroomingBookingOptions> {
    const params = new URLSearchParams()

    if (petId) {
      params.set("petId", petId)
    }

    const query = params.toString()
    const response = await apiRequest<GroomingBookingOptions>(
      `/grooming/booking-options${query ? `?${query}` : ""}`,
      init
    )

    return response.data
  },

  async getAvailability(date: string, init: RequestInit = {}): Promise<GroomingAvailability> {
    const response = await apiRequest<GroomingAvailability>(
      `/grooming/availability?date=${encodeURIComponent(date)}`,
      init
    )

    return response.data
  },

  async createTicket(payload: CreateGroomingTicketPayload, init: RequestInit = {}): Promise<GroomingTicketCreated> {
    const response = await apiRequest<GroomingTicketCreated>("/grooming/tickets", {
      ...init,
      method: "POST",
      body: JSON.stringify(payload),
    })

    return response.data
  },

  async listBookedTickets(
    params: GroomingTicketListParams = {},
    init: RequestInit = {}
  ): Promise<{ tickets: GroomingTicketListItem[]; pagination: Pagination }> {
    const response = await apiRequest<GroomingTicketListItem[]>(
      `/grooming/tickets${buildQuery({
        search: params.search,
        petId: params.petId,
        status: params.status,
        timeRange: params.timeRange,
        page: params.page,
        limit: params.limit,
      })}`,
      init
    )

    return {
      tickets: response.data,
      pagination: response.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? response.data.length,
        total: response.data.length,
        totalPages: response.data.length > 0 ? 1 : 0,
      },
    }
  },
}
