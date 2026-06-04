import {
  DoctorMedicalRecordAlertFilter,
  DoctorMedicalRecordAlertLevel,
  DoctorMedicalRecordTypeFilter,
} from "../types/medical-record.types";

export const DOCTOR_MEDICAL_RECORD_PAGE_LIMIT = 5;

export const doctorMedicalRecordTypeFilterOptions: Array<{
  value: DoctorMedicalRecordTypeFilter;
  label: string;
}> = [
  { value: "ALL", label: "Tất cả" },
  { value: "GENERAL_CHECKUP", label: "Khám tổng quát" },
  { value: "VACCINATION", label: "Tiêm phòng" },
  { value: "LAB_TEST", label: "Xét nghiệm" },
  { value: "RECHECK", label: "Tái khám" },
  { value: "OTHER", label: "Khác" },
];

export const doctorMedicalRecordAlertFilterOptions: Array<{
  value: DoctorMedicalRecordAlertFilter;
  label: string;
}> = [
  { value: "ALL", label: "Tất cả" },
  { value: "NONE", label: "Không có" },
  { value: "MILD_ALLERGY", label: "Dị ứng nhẹ" },
  { value: "MONITORING", label: "Theo dõi" },
  { value: "HIGH_RISK", label: "Nguy cơ cao" },
];

export const doctorMedicalRecordAlertLabel: Record<DoctorMedicalRecordAlertLevel, string> = {
  NONE: "Không có",
  MILD_ALLERGY: "Dị ứng nhẹ",
  MONITORING: "Theo dõi",
  HIGH_RISK: "Nguy cơ cao",
};

export const doctorMedicalRecordTypeKeywords: Record<
  Exclude<DoctorMedicalRecordTypeFilter, "ALL">,
  string[]
> = {
  GENERAL_CHECKUP: ["khám định kỳ", "khám tổng quát", "tổng quát"],
  VACCINATION: ["tiêm phòng", "vaccine", "vaccination"],
  LAB_TEST: ["xét nghiệm", "siêu âm", "máu", "lab"],
  RECHECK: ["tái khám"],
  OTHER: [],
};
