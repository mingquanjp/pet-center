import { apiRequest } from "@/lib/api"
import {
  AdminPriceRule,
  AdminPricingPagination,
  AdminPricingServiceOption,
  AdminPricingStats,
  CreateAdminPriceRulePayload,
  PricingFilters,
  UpdateAdminPriceRulePayload,
} from "../types/pricing.types"

export const adminPricingApi = {
  getPricing: async (params: {
    filters: PricingFilters
    page: number
    limit: number
  }): Promise<{
    items: AdminPriceRule[]
    stats: AdminPricingStats
    serviceOptions: AdminPricingServiceOption[]
    pagination: AdminPricingPagination
  }> => {
    const queryParams = new URLSearchParams()

    if (params.filters.search) queryParams.set("search", params.filters.search)
    if (params.filters.category !== "ALL") queryParams.set("category", params.filters.category)
    if (params.filters.status !== "ALL") queryParams.set("status", params.filters.status)
    if (params.filters.serviceId) queryParams.set("serviceId", params.filters.serviceId)

    queryParams.set("page", params.page.toString())
    queryParams.set("limit", params.limit.toString())

    const response = await apiRequest<{
      items: AdminPriceRule[]
      stats: AdminPricingStats
      serviceOptions: AdminPricingServiceOption[]
      pagination: AdminPricingPagination
    }>(`/admin/pricing?${queryParams.toString()}`)

    return response.data
  },

  createPriceRule: async (payload: CreateAdminPriceRulePayload): Promise<AdminPriceRule> => {
    const response = await apiRequest<AdminPriceRule>("/admin/pricing", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.data
  },

  updatePriceRule: async (payload: UpdateAdminPriceRulePayload): Promise<AdminPriceRule> => {
    const { id, ...body } = payload
    const response = await apiRequest<AdminPriceRule>(`/admin/pricing/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    return response.data
  },

  deletePriceRule: async (id: string): Promise<{ deleted: boolean; id: string }> => {
    const response = await apiRequest<{ deleted: boolean; id: string }>(`/admin/pricing/${id}`, {
      method: "DELETE",
    })
    return response.data
  },
}
