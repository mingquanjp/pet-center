import { MedicineStatus, MedicineUnit } from "../types/medicine.types"

export const medicineUnitLabel: Record<MedicineUnit, string> = {
  tablet: "Viên",
  blister: "Vỉ",
  bottle: "Chai",
  packet: "Gói",
  tube: "Tuýp",
}

export const medicineStatusLabel: Record<MedicineStatus, string> = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
}

export const medicineUnitOptions = [
  { value: "tablet", label: "Viên" },
  { value: "blister", label: "Vỉ" },
  { value: "bottle", label: "Chai" },
  { value: "packet", label: "Gói" },
  { value: "tube", label: "Tuýp" },
]

export const medicineStatusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
]

export const medicineUnitFilterOptions = [
  { value: "ALL", label: "Tất cả đơn vị" },
  ...medicineUnitOptions,
]

export const medicineStatusFilterOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  ...medicineStatusOptions,
]
