"use client"

import { useCallback, useEffect, useState } from "react"
import { adminPricingApi } from "../api/pricing.api"
import {
  AdminPriceRule,
  AdminPricingPagination,
  AdminPricingServiceOption,
  AdminPricingStats,
  CreateAdminPriceRulePayload,
  PricingFilters,
  UpdateAdminPriceRulePayload,
} from "../types/pricing.types"

const emptyStats: AdminPricingStats = {
  totalRules: 0,
  activeRules: 0,
  inactiveRules: 0,
  averagePrice: 0,
  serviceCount: 0,
}

const emptyPagination: AdminPricingPagination = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
}

export function useAdminPricing(filters: PricingFilters, page: number, limit: number) {
  const [rules, setRules] = useState<AdminPriceRule[]>([])
  const [stats, setStats] = useState<AdminPricingStats>(emptyStats)
  const [serviceOptions, setServiceOptions] = useState<AdminPricingServiceOption[]>([])
  const [pagination, setPagination] = useState<AdminPricingPagination>({ ...emptyPagination, limit })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPricing = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await adminPricingApi.getPricing({ filters, page, limit })
      setRules(data.items)
      setStats(data.stats)
      setServiceOptions(data.serviceOptions)
      setPagination(data.pagination)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Không thể tải bảng giá.")
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPricing()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchPricing])

  const createPriceRule = async (payload: CreateAdminPriceRulePayload) => {
    await adminPricingApi.createPriceRule(payload)
    await fetchPricing()
  }

  const updatePriceRule = async (payload: UpdateAdminPriceRulePayload) => {
    await adminPricingApi.updatePriceRule(payload)
    await fetchPricing()
  }

  const deletePriceRule = async (id: string) => {
    const result = await adminPricingApi.deletePriceRule(id)
    await fetchPricing()
    return result
  }

  return {
    rules,
    stats,
    serviceOptions,
    pagination,
    isLoading,
    error,
    refetch: fetchPricing,
    createPriceRule,
    updatePriceRule,
    deletePriceRule,
  }
}
