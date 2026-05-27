import { useState } from "react";
import { appointmentsApi } from "../api/appointments.api";

export function useRejectStaffAppointment() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = async (
    { appointmentId, rejectionReason, internalNote }: { appointmentId: string; rejectionReason: string; internalNote?: string },
    options?: { onSuccess?: () => void }
  ) => {
    try {
      setIsPending(true);
      setIsError(false);
      setError(null);
      await appointmentsApi.rejectStaffAppointment(appointmentId, { rejectionReason, internalNote });
      options?.onSuccess?.();
    } catch (err) {
      console.error("Lỗi từ chối lịch hẹn:", err);
      setIsError(true);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, isError, error };
}
