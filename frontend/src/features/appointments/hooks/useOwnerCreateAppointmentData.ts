import { useCallback, useEffect, useState } from "react";

import { ownerAppointmentsApi } from "../api/owner-appointments.api";
import {
  OwnerAppointmentPetOption,
  OwnerAppointmentTimeSlot,
  OwnerExamTypeOption,
} from "../types/appointment.types";

export function useOwnerCreateAppointmentData(date?: string, examTypeId?: string) {
  const [pets, setPets] = useState<OwnerAppointmentPetOption[]>([]);
  const [examTypes, setExamTypes] = useState<OwnerExamTypeOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<OwnerAppointmentTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchOptions = useCallback(async () => {
    await Promise.resolve();

    try {
      setIsLoading(true);
      setIsError(false);
      const options = await ownerAppointmentsApi.getCreateOptions();
      setPets(options.pets);
      setExamTypes(options.examTypes);
      if (!date) {
        setTimeSlots(options.timeSlots);
      }
    } catch (error) {
      console.error("Failed to fetch owner appointment create options:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const fetchSlots = useCallback(async () => {
    if (!date) {
      return;
    }

    await Promise.resolve();

    try {
      setIsError(false);
      const slots = await ownerAppointmentsApi.getAvailableSlots({ date, examTypeId });
      setTimeSlots(slots);
    } catch (error) {
      console.error("Failed to fetch owner appointment slots:", error);
      setIsError(true);
    }
  }, [date, examTypeId]);

  useEffect(() => {
    void Promise.resolve().then(fetchOptions);
  }, [fetchOptions]);

  useEffect(() => {
    void Promise.resolve().then(fetchSlots);
  }, [fetchSlots]);

  return {
    pets,
    examTypes,
    timeSlots,
    isLoading,
    isError,
    refetch: fetchOptions,
  };
}
