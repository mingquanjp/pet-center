import { apiRequest } from "@/lib/api"

import type {
  DoctorPrescriptionDetail,
  DoctorPrescriptionFilters,
  DoctorPrescriptionListItem,
  DoctorPrescriptionPagination,
  DoctorPrescriptionStats,
} from "../types/prescription.types"

export interface DoctorPrescriptionListResponse {
  data: DoctorPrescriptionListItem[]
  stats: DoctorPrescriptionStats
  pagination: DoctorPrescriptionPagination
}

export const doctorPrescriptionsApi = {
  getDoctorPrescriptions: async (filters: DoctorPrescriptionFilters) => {
    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.date) params.append("date", filters.date)
    params.append("page", String(filters.page))
    params.append("limit", String(filters.limit))

    const res = await apiRequest<DoctorPrescriptionListItem[]>(`/doctor/prescriptions?${params.toString()}`)

    return res as unknown as DoctorPrescriptionListResponse
  },
  getDoctorPrescriptionDetail: async (prescriptionId: string) => {
    const res = await apiRequest<DoctorPrescriptionDetail>(`/doctor/prescriptions/${prescriptionId}`)

    return res.data
  },
}
