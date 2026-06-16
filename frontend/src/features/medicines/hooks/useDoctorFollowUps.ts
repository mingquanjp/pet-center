import { useCallback, useEffect, useState } from "react"

import { doctorFollowUpsApi } from "../api/doctor-follow-ups.api"
import type {
  DoctorFollowUpFilters,
  DoctorFollowUpListItem,
  DoctorFollowUpPagination,
  DoctorFollowUpStats,
} from "../types/follow-up.types"

const emptyStats: DoctorFollowUpStats = {
  upcomingCount: 0,
  overdueCount: 0,
  completedCount: 0,
}

const emptyPagination: DoctorFollowUpPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function useDoctorFollowUps(filters: DoctorFollowUpFilters) {
  const [data, setData] = useState<DoctorFollowUpListItem[]>([])
  const [stats, setStats] = useState<DoctorFollowUpStats>(emptyStats)
  const [pagination, setPagination] = useState<DoctorFollowUpPagination>({
    ...emptyPagination,
    limit: filters.limit,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const fetchFollowUps = useCallback(async (currentFilters: DoctorFollowUpFilters) => {
    await Promise.resolve()

    try {
      setIsLoading(true)
      setIsError(false)

      const res = await doctorFollowUpsApi.getDoctorFollowUps(currentFilters)

      setData(res.data)
      setStats(res.stats)
      setPagination(res.pagination)
    } catch (error) {
      console.error("Failed to fetch doctor follow-ups:", error)
      setIsError(true)
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }, [])

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    const currentFilters = JSON.parse(filtersKey) as DoctorFollowUpFilters
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchFollowUps(currentFilters)
  }, [fetchFollowUps, filtersKey])

  const refetch = useCallback(() => {
    void fetchFollowUps(filters)
  }, [fetchFollowUps, filters])

  return {
    data,
    stats,
    pagination,
    isLoading,
    isInitialLoading,
    isError,
    refetch,
  }
}
