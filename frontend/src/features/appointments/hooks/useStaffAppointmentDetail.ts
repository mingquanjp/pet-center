import { useState, useEffect, useCallback } from "react";
import { StaffAppointmentDetail } from "../types/appointment.types";
import { appointmentsApi } from "../api/appointments.api";

export function useStaffAppointmentDetail(appointmentId: string) {
  const [data, setData] = useState<StaffAppointmentDetail | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await appointmentsApi.getStaffAppointmentDetail(appointmentId);
      setData(res as unknown as StaffAppointmentDetail);
    } catch (error) {
      console.error("Failed to fetch appointment detail:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (appointmentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchDetail();
    }
  }, [appointmentId, fetchDetail]);

  return {
    data,
    isLoading,
    isError,
    refetch: fetchDetail,
  };
}
