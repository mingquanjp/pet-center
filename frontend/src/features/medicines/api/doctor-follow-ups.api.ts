import { apiRequest } from "@/lib/api"

import type {
  DoctorFollowUpDetail,
  DoctorFollowUpFilters,
  DoctorFollowUpListItem,
  DoctorFollowUpPagination,
  DoctorFollowUpStats,
} from "../types/follow-up.types"

export interface DoctorFollowUpListResponse {
  data: DoctorFollowUpListItem[]
  stats: DoctorFollowUpStats
  pagination: DoctorFollowUpPagination
}

export const doctorFollowUpsApi = {
  getDoctorFollowUps: async (filters: DoctorFollowUpFilters) => {
    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.status !== "all") params.append("status", filters.status)
    if (filters.date) params.append("date", filters.date)
    params.append("page", String(filters.page))
    params.append("limit", String(filters.limit))

    const res = await apiRequest<DoctorFollowUpListItem[]>(`/doctor/follow-ups?${params.toString()}`)

    return res as unknown as DoctorFollowUpListResponse
  },
  getDoctorFollowUpDetail: async (followUpId: string) => {
    const res = await apiRequest<DoctorFollowUpDetail>(`/doctor/follow-ups/${followUpId}`)

    return res.data
  },
}
