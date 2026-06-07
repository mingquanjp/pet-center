import { apiRequest } from "@/lib/api";
import { DoctorMedicalRecordFilters, DoctorMedicalRecordListResponse } from "../types/medical-record.types";

export const doctorMedicalRecordsApi = {
  getMedicalRecords: async (
    filters: DoctorMedicalRecordFilters
  ): Promise<DoctorMedicalRecordListResponse> => {
    const params = new URLSearchParams();

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.species !== "ALL") params.append("species", filters.species);
    if (filters.examStatus !== "ALL") params.append("examStatus", filters.examStatus);
    params.append("page", String(filters.page));
    params.append("limit", String(filters.limit));

    const res = await apiRequest<DoctorMedicalRecordListResponse>(
      `/doctor/medical-records?${params.toString()}`
    );
    
    return res.data;
  },
};
