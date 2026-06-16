import { useCallback, useEffect, useState } from "react"

import { doctorPrescriptionsApi } from "../api/doctor-prescriptions.api"
import type {
  DoctorPrescriptionFilters,
  DoctorPrescriptionListItem,
  DoctorPrescriptionPagination,
  DoctorPrescriptionStats,
} from "../types/prescription.types"

const emptyStats: DoctorPrescriptionStats = {
  totalCount: 0,
  todayCount: 0,
  followUpCount: 0,
}

const emptyPagination: DoctorPrescriptionPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function useDoctorPrescriptions(filters: DoctorPrescriptionFilters) {
  const [data, setData] = useState<DoctorPrescriptionListItem[]>([])
  const [stats, setStats] = useState<DoctorPrescriptionStats>(emptyStats)
  const [pagination, setPagination] = useState<DoctorPrescriptionPagination>({
    ...emptyPagination,
    limit: filters.limit,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const fetchPrescriptions = useCallback(async (currentFilters: DoctorPrescriptionFilters) => {
    await Promise.resolve()

    try {
      setIsLoading(true)
      setIsError(false)

      const res = await doctorPrescriptionsApi.getDoctorPrescriptions(currentFilters)

      setData(res.data)
      setStats(res.stats)
      setPagination(res.pagination)
    } catch (error) {
      console.error("Failed to fetch doctor prescriptions:", error)
      setIsError(true)
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }, [])

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    const currentFilters = JSON.parse(filtersKey) as DoctorPrescriptionFilters
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPrescriptions(currentFilters)
  }, [fetchPrescriptions, filtersKey])

  const refetch = useCallback(() => {
    void fetchPrescriptions(filters)
  }, [fetchPrescriptions, filters])

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
