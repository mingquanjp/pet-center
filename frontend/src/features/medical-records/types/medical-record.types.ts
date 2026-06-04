export type DoctorMedicalRecordAlertLevel =
  | "NONE"
  | "MILD_ALLERGY"
  | "MONITORING"
  | "HIGH_RISK";

export type DoctorMedicalRecordTypeFilter =
  | "ALL"
  | "GENERAL_CHECKUP"
  | "VACCINATION"
  | "LAB_TEST"
  | "RECHECK"
  | "OTHER";

export type DoctorMedicalRecordAlertFilter =
  | "ALL"
  | "NONE"
  | "MILD_ALLERGY"
  | "MONITORING"
  | "HIGH_RISK";

export interface DoctorMedicalRecord {
  id: string;
  pet: {
    id: string;
    code: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    avatarUrl?: string;
  };
  owner: {
    id: string;
    fullName: string;
  };
  latestExam: {
    id: string;
    examinedAt: string;
    examTypeName: string;
    diagnosis: string;
  };
  alertLevel: DoctorMedicalRecordAlertLevel;
}

export interface DoctorMedicalRecordFilters {
  search: string;
  recordType: DoctorMedicalRecordTypeFilter;
  alertLevel: DoctorMedicalRecordAlertFilter;
}

export interface DoctorMedicalRecordPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DoctorMedicalRecordDetail {
  id: string;
  recordCode: string;
  alertLevel: DoctorMedicalRecordAlertLevel;
  pet: {
    id: string;
    code: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    ageText?: string;
    gender?: string;
    avatarUrl?: string;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  professionalAlert?: {
    title: string;
    description: string;
    riskHistory?: string;
  };
  latestExam: {
    id: string;
    examCode: string;
    examinedAt: string;
    veterinarianName: string;
    examTypeName: string;
    diagnosis: string;
    conclusion: string;
    note?: string;
  };
  latestClinicalResult: {
    temperature?: string;
    weight?: string;
    heartRate?: string;
    generalCondition?: string;
    skinCoat?: string;
    respiratory?: string;
    digestive?: string;
  };
  recentExamHistory: Array<{
    id: string;
    examCode: string;
    examinedAt: string;
    examTypeName: string;
    diagnosis: string;
  }>;
}
