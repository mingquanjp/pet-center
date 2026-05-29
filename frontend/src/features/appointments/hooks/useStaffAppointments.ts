import { useState, useEffect, useCallback } from "react";
import { StaffAppointment, StaffAppointmentFilters } from "../types/appointment.types";
import { appointmentsApi } from "../api/appointments.api";


interface StaffAppointmentStats {
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  todayTotalCount: number;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export function useStaffAppointments(filters: StaffAppointmentFilters) {
  const [data, setData] = useState<StaffAppointment[]>([]);
  const [stats, setStats] = useState<StaffAppointmentStats>({
    pendingCount: 0,
    confirmedCount: 0,
    rejectedCount: 0,
    cancelledCount: 0,
    todayTotalCount: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchAppointments = useCallback(async (currentFilters: StaffAppointmentFilters) => {
    // Delay state updates to avoid synchronous setState in effect warning
    await Promise.resolve();
    
    try {
      setIsLoading(true);
      setIsError(false);

      const res = await appointmentsApi.getStaffAppointments(currentFilters);

      setData(res.data);
      setStats(res.stats);
      setPagination({
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        currentPage: res.pagination.page,
        limit: res.pagination.limit,
      });
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Serialize filters to a stable string so useEffect detects changes
  // even when Next.js router cache restores the same object reference
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    const currentFilters = JSON.parse(filtersKey) as StaffAppointmentFilters;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAppointments(currentFilters);
  }, [filtersKey, fetchAppointments]);

  const refetch = useCallback(() => {
    void fetchAppointments(filters);
  }, [fetchAppointments, filters]);

  return {
    data,
    stats,
    pagination,
    isLoading,
    isError,
    refetch,
  };
}
