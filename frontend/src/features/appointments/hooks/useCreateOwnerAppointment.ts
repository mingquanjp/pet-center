import { useState } from "react";

import { ownerAppointmentsApi } from "../api/owner-appointments.api";
import {
  CreateOwnerAppointmentPayload,
  CreateOwnerAppointmentResult,
} from "../types/appointment.types";

export function useCreateOwnerAppointment() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  async function createAppointment(
    payload: CreateOwnerAppointmentPayload
  ): Promise<CreateOwnerAppointmentResult> {
    try {
      setIsPending(true);
      setIsError(false);
      return await ownerAppointmentsApi.create(payload);
    } catch (error) {
      console.error("Failed to create owner appointment:", error);
      setIsError(true);
      throw error;
    } finally {
      setIsPending(false);
    }
  }

  return {
    createAppointment,
    isPending,
    isError,
  };
}
