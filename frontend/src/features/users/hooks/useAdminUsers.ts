import * as React from "react";
import { adminUsersApi } from "../api/admin-users.api";
import type { AdminUser, AdminUserFilters, AdminUserPagination, AdminUserStats } from "../types/admin-user.types";

const defaultStats: AdminUserStats = {
  totalCount: 0,
  activeCount: 0,
  lockedCount: 0,
  ownerCount: 0,
  staffCount: 0,
  doctorCount: 0,
  needsAttentionCount: 0,
};

const defaultPagination: AdminUserPagination = {
  total: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 10,
};

export function useAdminUsers(filters: AdminUserFilters) {
  const [data, setData] = React.useState<AdminUser[]>([]);
  const [stats, setStats] = React.useState<AdminUserStats>(defaultStats);
  const [pagination, setPagination] = React.useState<AdminUserPagination>(defaultPagination);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const fetchUsers = React.useCallback(async (currentFilters: AdminUserFilters) => {
    await Promise.resolve();

    try {
      setIsLoading(true);
      setIsError(false);

      const response = await adminUsersApi.list(currentFilters);

      setData(response.data);
      setStats(response.stats);
      setPagination({
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
        limit: response.pagination.limit,
      });
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  const filtersKey = JSON.stringify(filters);

  React.useEffect(() => {
    const currentFilters = JSON.parse(filtersKey) as AdminUserFilters;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUsers(currentFilters);
  }, [fetchUsers, filtersKey]);

  const refetch = React.useCallback(() => {
    void fetchUsers(filters);
  }, [fetchUsers, filters]);

  return {
    data,
    stats,
    pagination,
    isLoading,
    isInitialLoading,
    isError,
    refetch,
  };
}
