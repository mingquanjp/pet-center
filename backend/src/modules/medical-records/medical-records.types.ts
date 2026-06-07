export type DoctorMedicalRecordSpeciesFilter =
  | "ALL"
  | "Dog"
  | "Cat"
  | "Other";

export type DoctorMedicalRecordExamStatus =
  | "result_recorded"
  | "prescribed"
  | "follow_up_required";

export interface DoctorMedicalRecordsQueryDto {
  keyword: string;
  species: DoctorMedicalRecordSpeciesFilter;
  examStatus: "ALL" | DoctorMedicalRecordExamStatus;
  page: number;
  limit: number;
}

export interface DoctorMedicalRecordListItemDto {
  petId: string;
  petCode: string;
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  avatarUrl: string | null;
  ownerId: string;
  ownerName: string;
  ownerPhone: string | null;
  latestExamId: string;
  latestExamDate: string;
  latestDiagnosis: string;
  latestExamTypeCode: string | null;
  latestExamTypeName: string | null;
  examStatus: DoctorMedicalRecordExamStatus;
}

export interface DoctorMedicalRecordListResponseDto {
  items: DoctorMedicalRecordListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
