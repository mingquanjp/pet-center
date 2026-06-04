import { useMemo } from "react";

import { MOCK_DOCTOR_MEDICAL_RECORD_DETAILS } from "../constants/doctor-medical-record-detail.mock";

export function useDoctorMedicalRecordDetail(recordId: string | null) {
  return useMemo(
    () => ({
      data: recordId
        ? MOCK_DOCTOR_MEDICAL_RECORD_DETAILS.find((record) => record.id === recordId) ?? null
        : null,
      isLoading: false,
      isError: false,
      refetch: () => {},
    }),
    [recordId]
  );
}
