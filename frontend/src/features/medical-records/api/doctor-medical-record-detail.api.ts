import { apiRequest } from "@/lib/api";
import { DoctorMedicalRecordDetail } from "../types/medical-record.types";

export const doctorMedicalRecordDetailApi = {
  getMedicalRecordDetail: async (petId: string): Promise<DoctorMedicalRecordDetail> => {
    const response = await apiRequest<DoctorMedicalRecordDetail>(
      `/doctor/medical-records/${encodeURIComponent(petId)}`
    );

    return response.data;
  },
};
