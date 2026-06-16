export type MedicineUnit =
  | "tablet"
  | "blister"
  | "bottle"
  | "packet"
  | "tube"

export type MedicineStatus = "active" | "inactive"

export type MedicineUnitFilter = "ALL" | MedicineUnit
export type MedicineStatusFilter = "ALL" | MedicineStatus

export interface AdminMedicine {
  id: string
  code: string
  medicineName: string
  unit: MedicineUnit
  description?: string | null
  usageNote?: string | null
  unitPrice: number
  medicineStatus: MedicineStatus
  prescriptionUsageCount?: number
}

export interface AdminMedicineStats {
  totalMedicines: number
  activeMedicines: number
  inactiveMedicines: number
}

export interface AdminMedicineFilters {
  search: string
  unit: MedicineUnitFilter
  status: MedicineStatusFilter
}

export interface AdminMedicinePagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CreateAdminMedicinePayload {
  medicineName: string
  unit: MedicineUnit
  description?: string | null
  usageNote?: string | null
  unitPrice: number
  medicineStatus: MedicineStatus
}

export interface UpdateAdminMedicinePayload extends CreateAdminMedicinePayload {
  id: string
}
