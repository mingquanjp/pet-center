import { apiRequest, clearApiCache } from "@/lib/api"
import type {
  GroomingTicketListItem,
  GroomingTicketHistoryParams,
  GroomingTicketListParams,
  CreateGroomingTicketPayload,
  CreateStaffCounterGroomingTicketPayload,
  GroomingAvailability,
  GroomingBookingOptions,
  GroomingService,
  GroomingTicketCreated,
  Pagination,
  StaffCounterGroomingOptions,
  StaffGroomingTicket,
  StaffGroomingTicketList,
  StaffGroomingTicketQuery,
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
    const response = await apiRequest<GroomingService[]>("/grooming/services", {
      cacheTtlMs: 5 * 60 * 1000,
      ...init,
    })

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
      {
        cacheTtlMs: 60 * 1000,
        ...init,
      }
    )

    return response.data
  },

  async getAvailability(date: string, init: RequestInit = {}): Promise<GroomingAvailability> {
    const response = await apiRequest<GroomingAvailability>(
      `/grooming/availability?date=${encodeURIComponent(date)}`,
      {
        cacheTtlMs: 30 * 1000,
        ...init,
      }
    )

    return response.data
  },

  async listStaffAvailableServices(init: RequestInit = {}): Promise<GroomingService[]> {
    const response = await apiRequest<GroomingService[]>("/grooming/staff/services", {
      cacheTtlMs: 5 * 60 * 1000,
      ...init,
    })

    return response.data
  },

  async getStaffCounterOptions(
    params: { petId?: string; search?: string; limit?: number } = {},
    init: RequestInit = {}
  ): Promise<StaffCounterGroomingOptions> {
    const query = new URLSearchParams()

    if (params.petId) {
      query.set("petId", params.petId)
    }

    if (params.search) {
      query.set("search", params.search)
    }

    if (params.limit) {
      query.set("limit", String(params.limit))
    }

    const response = await apiRequest<StaffCounterGroomingOptions>(
      `/grooming/counter/options${query.toString() ? `?${query.toString()}` : ""}`,
      {
        cacheTtlMs: 20 * 1000,
        ...init,
      }
    )

    return response.data
  },

  async getStaffCounterAvailability(date: string, init: RequestInit = {}): Promise<GroomingAvailability> {
    const response = await apiRequest<GroomingAvailability>(
      `/grooming/counter/availability?date=${encodeURIComponent(date)}`,
      {
        cacheTtlMs: 20 * 1000,
        ...init,
      }
    )

    return response.data
  },

  async createTicket(payload: CreateGroomingTicketPayload, init: RequestInit = {}): Promise<GroomingTicketCreated> {
    const response = await apiRequest<GroomingTicketCreated>("/grooming/tickets", {
      ...init,
      method: "POST",
      body: JSON.stringify(payload),
    })

    clearApiCache("/grooming/")
    clearApiCache("/dashboards/staff/overview")

    return response.data
  },

  async createStaffCounterTicket(
    payload: CreateStaffCounterGroomingTicketPayload,
    init: RequestInit = {}
  ): Promise<GroomingTicketCreated> {
    const response = await apiRequest<GroomingTicketCreated>("/grooming/counter/tickets", {
      ...init,
      method: "POST",
      body: JSON.stringify(payload),
    })

    clearApiCache("/grooming/")
    clearApiCache("/dashboards/staff/overview")

    return response.data
  },

  async listStaffTickets(params: StaffGroomingTicketQuery = {}, init: RequestInit = {}): Promise<StaffGroomingTicketList> {
    const query = new URLSearchParams()

    if (params.status) {
      query.set("status", params.status)
    }

    if (params.serviceId) {
      query.set("serviceId", params.serviceId)
    }

    if (params.species) {
      query.set("species", params.species)
    }

    if (params.timeRange) {
      query.set("timeRange", params.timeRange)
    }

    if (params.search) {
      query.set("search", params.search)
    }

    if (params.page) {
      query.set("page", String(params.page))
    }

    if (params.limit) {
      query.set("limit", String(params.limit))
    }

    const response = await apiRequest<StaffGroomingTicketList>(
      `/grooming/staff/tickets${query.toString() ? `?${query.toString()}` : ""}`,
      {
        cacheTtlMs: 30 * 1000,
        ...init,
      }
    )

    return response.data
  },

  async acceptStaffTicket(ticketId: string, init: RequestInit = {}): Promise<StaffGroomingTicket> {
    const response = await apiRequest<StaffGroomingTicket>(`/grooming/staff/tickets/${encodeURIComponent(ticketId)}/accept`, {
      ...init,
      method: "PATCH",
    })

    clearApiCache("/grooming/staff/tickets")
    clearApiCache("/dashboards/staff/overview")

    return response.data
  },

  async completeStaffTicket(ticketId: string, init: RequestInit = {}): Promise<StaffGroomingTicket> {
    const response = await apiRequest<StaffGroomingTicket>(`/grooming/staff/tickets/${encodeURIComponent(ticketId)}/complete`, {
      ...init,
      method: "PATCH",
    })

    clearApiCache("/grooming/staff/tickets")
    clearApiCache("/dashboards/staff/overview")

    return response.data
  },

  async startStaffTicket(ticketId: string, init: RequestInit = {}): Promise<StaffGroomingTicket> {
    const response = await apiRequest<StaffGroomingTicket>(`/grooming/staff/tickets/${encodeURIComponent(ticketId)}/start`, {
      ...init,
      method: "PATCH",
    })

    clearApiCache("/grooming/staff/tickets")
    clearApiCache("/dashboards/staff/overview")

    return response.data
  },

  async cancelStaffTicket(ticketId: string, init: RequestInit = {}): Promise<StaffGroomingTicket> {
    const response = await apiRequest<StaffGroomingTicket>(`/grooming/staff/tickets/${encodeURIComponent(ticketId)}/cancel`, {
      ...init,
      method: "PATCH",
    })

    clearApiCache("/grooming/staff/tickets")
    clearApiCache("/dashboards/staff/overview")

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

  async listTicketHistory(
    params: GroomingTicketHistoryParams = {},
    init: RequestInit = {}
  ): Promise<{ tickets: GroomingTicketListItem[]; pagination: Pagination }> {
    const response = await apiRequest<GroomingTicketListItem[]>(
      `/grooming/tickets/history${buildQuery({
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
