import {
  DoctorExaminationStatus,
  DoctorExaminationTab,
} from "../types/examination.types"

export const doctorExaminationStatusLabel: Record<DoctorExaminationStatus, string> = {
  WAITING: "Chờ khám",
  EXAMINING: "Đang khám",
  COMPLETED: "Hoàn tất",
  FOLLOW_UP: "Cần tái khám",
}

export const doctorExaminationTabs: Array<{ value: DoctorExaminationTab; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "WAITING", label: "Chờ khám" },
  { value: "EXAMINING", label: "Đang khám" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "FOLLOW_UP", label: "Tái khám" },
]

export const doctorExaminationTypeOptions = [
  { value: "ALL", label: "Tất cả loại khám" },
  { value: "GENERAL_CHECKUP", label: "Khám tổng quát" },
  { value: "VACCINATION", label: "Tiêm phòng" },
  { value: "LAB_TEST", label: "Xét nghiệm" },
  { value: "RECHECK", label: "Tái khám" },
] as const

