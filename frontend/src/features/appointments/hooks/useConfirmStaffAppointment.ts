import { useState } from "react";
import { appointmentsApi } from "../api/appointments.api";

export function useConfirmStaffAppointment() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = async (
    { appointmentId, doctorUserId, internalNote }: { appointmentId: string; doctorUserId?: string; internalNote?: string },
    options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
  ) => {
    try {
      setIsPending(true);
      setIsError(false);
      setError(null);
      await appointmentsApi.confirmStaffAppointment(appointmentId, { doctorUserId, internalNote });
      options?.onSuccess?.();
    } catch (err) {
      console.error("Lỗi xác nhận lịch hẹn:", err);
      setIsError(true);
      setError(err);
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, isError, error };
}
