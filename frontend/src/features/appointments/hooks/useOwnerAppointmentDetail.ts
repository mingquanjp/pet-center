import { useCallback, useEffect, useState } from "react";

import { ownerAppointmentsApi } from "../api/owner-appointments.api";
import { OwnerAppointmentDetail } from "../types/appointment.types";

export function useOwnerAppointmentDetail(appointmentId: string) {
  const [data, setData] = useState<OwnerAppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchDetail = useCallback(async () => {
    await Promise.resolve();

    try {
      setIsLoading(true);
      setIsError(false);
      const detail = await ownerAppointmentsApi.getDetail(appointmentId);
      setData(detail);
    } catch (error) {
      console.error("Failed to fetch owner appointment detail:", error);
      setData(null);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    void Promise.resolve().then(fetchDetail);
  }, [fetchDetail]);

  return {
    data,
    isLoading,
    isError,
    refetch: fetchDetail,
  };
}
