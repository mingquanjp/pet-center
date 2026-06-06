import { apiRequest } from "@/lib/api"

import {
  CompleteDoctorExaminationPayload,
  DoctorExamination,
  DoctorExaminationDetail,
  DoctorExaminationFilters,
  SaveDraftDoctorExaminationPayload,
} from "../types/examination.types"

export interface DoctorExaminationListResponse {
  data: DoctorExamination[]
  stats: {
    totalCount: number
    waitingCount: number
    examiningCount: number
    completedCount: number
    followUpCount: number
  }
  tabStats: {
    totalCount: number
    waitingCount: number
    examiningCount: number
    completedCount: number
    followUpCount: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const doctorExaminationsApi = {
  getDoctorExaminations: async (filters: DoctorExaminationFilters) => {
    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.status !== "ALL") params.append("tab", filters.status)
    if (filters.examType !== "ALL") params.append("examType", filters.examType)
    if (filters.date) params.append("date", filters.date)
    params.append("page", String(filters.page))
    params.append("limit", String(filters.limit))

    const qs = params.toString()
    const res = await apiRequest<DoctorExamination[]>(`/doctor/examinations?${qs}`)

    return res as unknown as DoctorExaminationListResponse
  },
  getDoctorExaminationDetail: async (appointmentId: string) => {
    const res = await apiRequest<DoctorExaminationDetail>(`/doctor/examinations/${appointmentId}`)
    return res.data
  },
  startDoctorExamination: async (appointmentId: string) => {
    const res = await apiRequest<DoctorExaminationDetail>(`/doctor/examinations/${appointmentId}/start`, {
      method: "POST",
    })
    return res.data
  },
  saveDraftDoctorExamination: async (appointmentId: string, payload: SaveDraftDoctorExaminationPayload) => {
    const res = await apiRequest<DoctorExaminationDetail>(`/doctor/examinations/${appointmentId}/draft`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data
  },
  completeDoctorExamination: async (appointmentId: string, payload: CompleteDoctorExaminationPayload) => {
    const res = await apiRequest<DoctorExaminationDetail>(`/doctor/examinations/${appointmentId}/complete`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data
  },
}
