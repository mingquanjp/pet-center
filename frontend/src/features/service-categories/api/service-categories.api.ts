import { apiRequest } from "@/lib/api"
import {
  AdminServiceCategory,
  AdminServiceCategoryPagination,
  AdminServiceCategoryStats,
  CreateAdminServiceCategoryPayload,
  ServiceCategoryFilters,
  ServiceCategoryStatus,
  UpdateAdminServiceCategoryPayload,
} from "../types/service-category.types"

export const adminServiceCategoriesApi = {
  getServiceCategories: async (params: {
    filters: ServiceCategoryFilters
    page: number
    limit: number
  }): Promise<{
    items: AdminServiceCategory[]
    stats: AdminServiceCategoryStats
    pagination: AdminServiceCategoryPagination
  }> => {
    const queryParams = new URLSearchParams()

    if (params.filters.search) queryParams.set("search", params.filters.search)
    if (params.filters.category !== "ALL") queryParams.set("category", params.filters.category)
    if (params.filters.status !== "ALL") queryParams.set("status", params.filters.status)

    queryParams.set("page", params.page.toString())
    queryParams.set("limit", params.limit.toString())

    const response = await apiRequest<{
      items: AdminServiceCategory[]
      stats: AdminServiceCategoryStats
      pagination: AdminServiceCategoryPagination
    }>(`/admin/service-categories?${queryParams.toString()}`)

    return response.data
  },

  createServiceCategory: async (payload: CreateAdminServiceCategoryPayload): Promise<AdminServiceCategory> => {
    const response = await apiRequest<AdminServiceCategory>("/admin/service-categories", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    return response.data
  },

  updateServiceCategory: async (payload: UpdateAdminServiceCategoryPayload): Promise<AdminServiceCategory> => {
    const { id, ...body } = payload
    const response = await apiRequest<AdminServiceCategory>(`/admin/service-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })

    return response.data
  },

  updateServiceCategoryStatus: async (id: string, status: ServiceCategoryStatus): Promise<AdminServiceCategory> => {
    const response = await apiRequest<AdminServiceCategory>(`/admin/service-categories/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })

    return response.data
  },

  deleteServiceCategory: async (id: string): Promise<{ deleted: boolean; deactivated: boolean; id: string }> => {
    const response = await apiRequest<{ deleted: boolean; deactivated: boolean; id: string }>(`/admin/service-categories/${id}`, {
      method: "DELETE",
    })

    return response.data
  },
}
