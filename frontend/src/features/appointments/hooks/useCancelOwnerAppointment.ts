import { useState } from "react";

import { ownerAppointmentsApi } from "../api/owner-appointments.api";

interface CancelOwnerAppointmentPayload {
  appointmentId: string;
  reason?: string;
}

export function useCancelOwnerAppointment() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  async function cancelAppointment(payload: CancelOwnerAppointmentPayload) {
    try {
      setIsPending(true);
      setIsError(false);
      return await ownerAppointmentsApi.cancel(payload.appointmentId, {
        reason: payload.reason,
      });
    } catch (error) {
      console.error("Failed to cancel owner appointment:", error);
      setIsError(true);
      throw error;
    } finally {
      setIsPending(false);
    }
  }

  return {
    cancelAppointment,
    isPending,
    isError,
  };
}
