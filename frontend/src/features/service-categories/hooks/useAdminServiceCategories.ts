"use client"

import { useCallback, useEffect, useState } from "react"

import { adminServiceCategoriesApi } from "../api/service-categories.api"
import {
  AdminServiceCategory,
  AdminServiceCategoryPagination,
  AdminServiceCategoryStats,
  CreateAdminServiceCategoryPayload,
  ServiceCategoryFilters,
  UpdateAdminServiceCategoryPayload,
} from "../types/service-category.types"

const emptyStats: AdminServiceCategoryStats = {
  totalServices: 0,
  activeServices: 0,
  inactiveServices: 0,
  medicalServices: 0,
  averagePrice: 0,
}

const emptyPagination: AdminServiceCategoryPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}

export function useAdminServiceCategories(filters: ServiceCategoryFilters, page: number, limit: number) {
  const [services, setServices] = useState<AdminServiceCategory[]>([])
  const [stats, setStats] = useState<AdminServiceCategoryStats>(emptyStats)
  const [pagination, setPagination] = useState<AdminServiceCategoryPagination>({ ...emptyPagination, limit })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServiceCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await adminServiceCategoriesApi.getServiceCategories({ filters, page, limit })
      setServices(data.items)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Không thể tải danh sách dịch vụ.")
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchServiceCategories()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchServiceCategories])

  const createServiceCategory = async (payload: CreateAdminServiceCategoryPayload) => {
    await adminServiceCategoriesApi.createServiceCategory(payload)
    await fetchServiceCategories()
  }

  const updateServiceCategory = async (payload: UpdateAdminServiceCategoryPayload) => {
    await adminServiceCategoriesApi.updateServiceCategory(payload)
    await fetchServiceCategories()
  }

  const deleteServiceCategory = async (id: string) => {
    const result = await adminServiceCategoriesApi.deleteServiceCategory(id)
    await fetchServiceCategories()
    return result
  }

  return {
    services,
    stats,
    pagination,
    isLoading,
    error,
    refetch: fetchServiceCategories,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
  }
}
