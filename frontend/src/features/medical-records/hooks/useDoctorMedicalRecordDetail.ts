import { useState, useEffect, useCallback } from "react";
import { doctorMedicalRecordDetailApi } from "../api/doctor-medical-record-detail.api";
import { DoctorMedicalRecordDetail } from "../types/medical-record.types";

export function useDoctorMedicalRecordDetail(petId: string) {
  const [data, setData] = useState<DoctorMedicalRecordDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await doctorMedicalRecordDetailApi.getMedicalRecordDetail(petId);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDetail,
  };
}
