import { useState, useEffect, useCallback } from "react";
import { boardingApi } from "../api/boarding.api";
import {
  StaffBoardingFilters,
  StaffBoardingListItem,
  StaffBoardingPagination,
  StaffBoardingStats,
  StaffBoardingListQuery
} from "../types/boarding.types";

const defaultStats: StaffBoardingStats = {
  allCount: 0,
  pendingCount: 0,
  confirmedCount: 0,
  stayingCount: 0,
  checkedOutCount: 0,
  rejectedCount: 0,
  cancelledCount: 0
};

const defaultPagination: StaffBoardingPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
};

export function useStaffBoarding(filters: StaffBoardingFilters, page: number, limit = 10) {
  const [data, setData] = useState<StaffBoardingListItem[]>([]);
  const [stats, setStats] = useState<StaffBoardingStats>(defaultStats);
  const [pagination, setPagination] = useState<StaffBoardingPagination>(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBoarding = useCallback(async (currentFilters: StaffBoardingFilters, currentPage: number, currentLimit: number) => {
    // Delay state updates to avoid synchronous setState in effect warning
    await Promise.resolve();

    setIsLoading(true);
    setError(null);
    try {
      const query: StaffBoardingListQuery = {
        page: currentPage,
        limit: currentLimit,
        search: currentFilters.search,
        tab: currentFilters.tab !== "ALL" ? currentFilters.tab : undefined,
        status: currentFilters.status !== "ALL" ? currentFilters.status : undefined,
        roomType: currentFilters.roomType !== "ALL" ? currentFilters.roomType : undefined,
        timeRange: currentFilters.timeRange,
      };

      const response = await boardingApi.getStaffBoarding(query);
      setData(response.data || []);
      if (response.stats) {
        setStats(response.stats);
      }
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch boarding records"));
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  const filtersKey = JSON.stringify({ filters, page, limit });

  useEffect(() => {
    const currentParams = JSON.parse(filtersKey) as { filters: StaffBoardingFilters; page: number; limit: number };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchBoarding(currentParams.filters, currentParams.page, currentParams.limit);
  }, [filtersKey, fetchBoarding]);

  const refetch = useCallback(() => {
    void fetchBoarding(filters, page, limit);
  }, [fetchBoarding, filters, page, limit]);

  return {
    data,
    stats,
    pagination,
    isLoading,
    isInitialLoading,
    isError: !!error,
    error,
    refetch
  };
}
