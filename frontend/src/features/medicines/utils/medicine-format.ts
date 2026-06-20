import {
  AdminMedicine,
  AdminMedicineFilters,
  AdminMedicineStats,
  MedicineStatus,
  MedicineUnit,
} from "../types/medicine.types"
import {
  medicineStatusLabel,
  medicineUnitLabel,
} from "../constants/medicine.constants"

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function getMedicineUnitLabel(unit: MedicineUnit): string {
  return (medicineUnitLabel as Record<string, string>)[unit] || unit
}

export function getMedicineStatusLabel(status: MedicineStatus): string {
  return medicineStatusLabel[status] || "Không xác định"
}

export function filterAdminMedicines(
  medicines: AdminMedicine[],
  filters: AdminMedicineFilters
): AdminMedicine[] {
  return medicines.filter((med) => {
    // Search
    if (filters.search) {
      const query = filters.search.toLowerCase()
      const matchSearch =
        med.code.toLowerCase().includes(query) ||
        med.medicineName.toLowerCase().includes(query) ||
        (med.description?.toLowerCase().includes(query) ?? false) ||
        (med.usageNote?.toLowerCase().includes(query) ?? false)

      if (!matchSearch) return false
    }

    // Unit
    if (filters.unit !== "ALL" && med.unit !== filters.unit) {
      return false
    }

    // Status
    if (filters.status !== "ALL" && med.medicineStatus !== filters.status) {
      return false
    }

    return true
  })
}

export function paginateAdminMedicines(
  medicines: AdminMedicine[],
  page: number,
  limit: number
): AdminMedicine[] {
  const startIndex = (page - 1) * limit
  return medicines.slice(startIndex, startIndex + limit)
}

export function calculateAdminMedicineStats(
  medicines: AdminMedicine[]
): AdminMedicineStats {
  return {
    totalMedicines: medicines.length,
    activeMedicines: medicines.filter((m) => m.medicineStatus === "active").length,
    inactiveMedicines: medicines.filter((m) => m.medicineStatus === "inactive")
      .length,
  }
}

export function generateMedicineCode(nextNumber: number): string {
  return `MED-${nextNumber.toString().padStart(3, "0")}`
}
