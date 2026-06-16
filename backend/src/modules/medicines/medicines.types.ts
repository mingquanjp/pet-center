export type MedicineUnit =
  | "tablet"
  | "blister"
  | "bottle"
  | "packet"
  | "tube";

export type MedicineStatus = "active" | "inactive";

export type MedicineUnitFilter = "ALL" | MedicineUnit;
export type MedicineStatusFilter = "ALL" | MedicineStatus;

export interface AdminMedicinesQueryDto {
  search?: string;
  unit?: MedicineUnitFilter;
  status?: MedicineStatusFilter;
  page?: number;
  limit?: number;
}

export interface AdminMedicineDto {
  id: string;
  code: string;
  medicineName: string;
  unit: MedicineUnit;
  description: string | null;
  usageNote: string | null;
  unitPrice: number;
  medicineStatus: MedicineStatus;
  prescriptionUsageCount: number;
}

export interface AdminMedicineStatsDto {
  totalMedicines: number;
  activeMedicines: number;
  inactiveMedicines: number;
}

export interface AdminMedicinesListResultDto {
  items: AdminMedicineDto[];
  stats: AdminMedicineStatsDto;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdminMedicineBody {
  medicineName: string;
  unit: MedicineUnit;
  description?: string | null;
  usageNote?: string | null;
  unitPrice: number;
  medicineStatus?: MedicineStatus;
}

export interface UpdateAdminMedicineBody {
  medicineName?: string;
  unit?: MedicineUnit;
  description?: string | null;
  usageNote?: string | null;
  unitPrice?: number;
  medicineStatus?: MedicineStatus;
}

export interface UpdateAdminMedicineStatusBody {
  medicineStatus: MedicineStatus;
}
