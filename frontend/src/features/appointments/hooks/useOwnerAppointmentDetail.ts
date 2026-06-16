import { useCallback, useEffect, useState } from "react";

import { ownerAppointmentsApi } from "../api/owner-appointments.api";
import { OwnerAppointmentDetail } from "../types/appointment.types";

export function useOwnerAppointmentDetail(appointmentId: string) {
  const [data, setData] = useState<OwnerAppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setIsError(false);
      const detail = await ownerAppointmentsApi.getDetail(appointmentId, { signal });

      if (signal?.aborted) return;

      setData(detail);
    } catch (error) {
      if (signal?.aborted) return;

      console.error("Failed to fetch owner appointment detail:", error);
      setData(null);
      setIsError(true);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [appointmentId]);

  useEffect(() => {
    const abortController = new AbortController();

    void Promise.resolve().then(() => fetchDetail(abortController.signal));

    return () => {
      abortController.abort();
    };
  }, [fetchDetail]);

  return {
    data,
    isLoading,
    isError,
    refetch: () => fetchDetail(),
  };
}
