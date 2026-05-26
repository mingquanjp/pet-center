import { apiRequest } from "@/lib/api"
import type {
  CreateGroomingTicketPayload,
  GroomingAvailability,
  GroomingBookingOptions,
  GroomingService,
  GroomingTicketCreated,
} from "../types/spa.types"

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
}
