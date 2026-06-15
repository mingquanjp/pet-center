import { useCallback, useEffect, useRef, useState } from "react";

import { ownerAppointmentsApi } from "../api/owner-appointments.api";
import {
  OwnerAppointment,
  OwnerAppointmentFilters,
  OwnerAppointmentPetFilter,
} from "../types/appointment.types";

const OWNER_APPOINTMENTS_PAGE_SIZE = 6;

export function mapOwnerAppointmentFiltersToQuery(filters: OwnerAppointmentFilters) {
  return {
    search: filters.search || undefined,
    petId: filters.petId === "ALL" ? undefined : filters.petId,
    status: filters.status === "ALL" ? undefined : filters.status,
    date: filters.date || undefined,
  };
}

export function useOwnerAppointments(filters: OwnerAppointmentFilters, page: number) {
  const [data, setData] = useState<OwnerAppointment[]>([]);
  const [petOptions, setPetOptions] = useState<
    Array<{ label: string; value: OwnerAppointmentPetFilter }>
  >([{ label: "Tất cả", value: "ALL" }]);
  const [pagination, setPagination] = useState({
    page,
    pageSize: OWNER_APPOINTMENTS_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const latestRequestId = useRef(0);

  const fetchAppointments = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    await Promise.resolve();

    try {
      setIsLoading(true);
      setIsError(false);

      const response = await ownerAppointmentsApi.list({
        filters,
        page,
        limit: OWNER_APPOINTMENTS_PAGE_SIZE,
      });

      if (requestId !== latestRequestId.current) return;

      setData(response.data);
      setPagination({
        page: response.pagination.page,
        pageSize: response.pagination.limit,
        totalItems: response.pagination.total,
        totalPages: Math.max(1, response.pagination.totalPages),
      });
    } catch (error) {
      if (requestId !== latestRequestId.current) return;

      console.error("Failed to fetch owner appointments:", error);
      setData([]);
      setIsError(true);
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [filters, page]);

  const fetchPetOptions = useCallback(async () => {
    await Promise.resolve();

    try {
      const options = await ownerAppointmentsApi.getCreateOptions();
      setPetOptions([
        { label: "Tất cả", value: "ALL" },
        ...options.pets.map((pet) => ({
          label: pet.name,
          value: pet.id,
        })),
      ]);
    } catch (error) {
      console.error("Failed to fetch owner appointment pet filters:", error);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchAppointments);
  }, [fetchAppointments]);

  useEffect(() => {
    void Promise.resolve().then(fetchPetOptions);
  }, [fetchPetOptions]);

  return {
    data,
    petOptions,
    pagination,
    isLoading,
    isError,
    refetch: fetchAppointments,
  };
}
