export type DoctorMedicalRecordExamStatus =
  | "result_recorded"
  | "prescribed"
  | "follow_up_required";

export interface DoctorMedicalRecordListItem {
  petId: string;
  petCode: string;
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed?: string;
  avatarUrl?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  latestExamId: string;
  latestExamDate: string;
  latestDiagnosis: string;
  examTypeCode:
    | "GENERAL_CHECKUP"
    | "VACCINATION"
    | "TESTING"
    | "FOLLOW_UP"
    | "PARASITE";
  examTypeName: string;
  examStatus: DoctorMedicalRecordExamStatus;
}

export interface DoctorMedicalRecordFilters {
  keyword: string;
  species: "ALL" | DoctorMedicalRecordListItem["species"];
  examStatus: "ALL" | DoctorMedicalRecordExamStatus;
  page: number;
  limit: number;
}

export interface DoctorMedicalRecordListResponse {
  items: DoctorMedicalRecordListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
