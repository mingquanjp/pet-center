import { useCallback, useEffect, useState } from "react"

import { doctorExaminationsApi } from "../api/doctor-examinations.api"
import {
  DoctorExamination,
  DoctorExaminationFilters,
} from "../types/examination.types"

interface DoctorExaminationStats {
  totalCount: number
  waitingCount: number
  examiningCount: number
  completedCount: number
  followUpCount: number
}

interface PaginationInfo {
  total: number
  totalPages: number
  currentPage: number
  limit: number
}

export function useDoctorExaminations(filters: DoctorExaminationFilters) {
  const [data, setData] = useState<DoctorExamination[]>([])
  const [stats, setStats] = useState<DoctorExaminationStats>({
    totalCount: 0,
    waitingCount: 0,
    examiningCount: 0,
    completedCount: 0,
    followUpCount: 0,
  })
  const [tabStats, setTabStats] = useState<DoctorExaminationStats>({
    totalCount: 0,
    waitingCount: 0,
    examiningCount: 0,
    completedCount: 0,
    followUpCount: 0,
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: filters.limit,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const fetchExaminations = useCallback(async (currentFilters: DoctorExaminationFilters) => {
    await Promise.resolve()

    try {
      setIsLoading(true)
      setIsError(false)

      const res = await doctorExaminationsApi.getDoctorExaminations(currentFilters)

      setData(res.data)
      setStats(res.stats)
      setTabStats(res.tabStats)
      setPagination({
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        currentPage: res.pagination.page,
        limit: res.pagination.limit,
      })
    } catch (error) {
      console.error("Failed to fetch doctor examinations:", error)
      setIsError(true)
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }, [])

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    const currentFilters = JSON.parse(filtersKey) as DoctorExaminationFilters
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchExaminations(currentFilters)
  }, [filtersKey, fetchExaminations])

  const refetch = useCallback(() => {
    void fetchExaminations(filters)
  }, [fetchExaminations, filters])

  return {
    data,
    stats,
    tabStats,
    pagination,
    isLoading,
    isInitialLoading,
    isError,
    refetch,
  }
}
