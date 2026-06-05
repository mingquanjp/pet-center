import {
  AdminMedicine,
  AdminMedicineFilters,
  AdminMedicinePagination,
  AdminMedicineStats,
  CreateAdminMedicinePayload,
  UpdateAdminMedicinePayload,
} from "../types/medicine.types"
import { apiRequest } from "@/lib/api"

export const adminMedicinesApi = {
  getMedicines: async (params: {
    filters: AdminMedicineFilters
    page: number
    limit: number
  }): Promise<{
    items: AdminMedicine[]
    stats: AdminMedicineStats
    pagination: AdminMedicinePagination
  }> => {
    const queryParams = new URLSearchParams()
    
    if (params.filters.search) queryParams.set("search", params.filters.search)
    if (params.filters.unit !== "ALL") queryParams.set("unit", params.filters.unit)
    if (params.filters.status !== "ALL") queryParams.set("status", params.filters.status)
    
    queryParams.set("page", params.page.toString())
    queryParams.set("limit", params.limit.toString())

    const response = await apiRequest<{ items: AdminMedicine[], stats: AdminMedicineStats, pagination: AdminMedicinePagination }>(`/admin/medicines?${queryParams.toString()}`)
    return response.data
  },

  createMedicine: async (
    payload: CreateAdminMedicinePayload
  ): Promise<AdminMedicine> => {
    const response = await apiRequest<AdminMedicine>("/admin/medicines", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.data
  },

  updateMedicine: async (
    payload: UpdateAdminMedicinePayload
  ): Promise<AdminMedicine> => {
    const { id, ...body } = payload
    const response = await apiRequest<AdminMedicine>(`/admin/medicines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    return response.data
  },

  toggleMedicineStatus: async (medicineId: string): Promise<AdminMedicine> => {
    const getRes = await apiRequest<AdminMedicine>(`/admin/medicines/${medicineId}`)
    const currentStatus = getRes.data.medicineStatus
    const nextStatus = currentStatus === "active" ? "inactive" : "active"
    
    const response = await apiRequest<AdminMedicine>(`/admin/medicines/${medicineId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ medicineStatus: nextStatus }),
    })
    return response.data
  },

  deleteMedicine: async (
    medicineId: string
  ): Promise<{ deleted: boolean; deactivated: boolean; id: string }> => {
    const response = await apiRequest<{ deleted: boolean; deactivated: boolean; id: string }>(`/admin/medicines/${medicineId}`, {
      method: "DELETE",
    })
    return response.data
  },
}
