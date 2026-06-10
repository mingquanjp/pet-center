export type ServiceCategoryKind = "medical" | "grooming" | "boarding" | "medicine";
export type ServiceCategoryStatus = "active" | "inactive";

export type ServiceCategoryKindFilter = "ALL" | ServiceCategoryKind;
export type ServiceCategoryStatusFilter = "ALL" | ServiceCategoryStatus;

export interface AdminServiceCategoriesQueryDto {
  search?: string;
  category?: ServiceCategoryKindFilter;
  status?: ServiceCategoryStatusFilter;
  page?: number;
  limit?: number;
}

export interface AdminServiceCategoryDto {
  id: string;
  code: string;
  serviceName: string;
  category: ServiceCategoryKind;
  durationMinutes: number | null;
  basePrice: number;
  status: ServiceCategoryStatus;
  updatedAt: string | null;
  description: string | null;
  usageCount: number;
}

export interface AdminServiceCategoryStatsDto {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  medicalServices: number;
  averagePrice: number;
}

export interface AdminServiceCategoriesListResultDto {
  items: AdminServiceCategoryDto[];
  stats: AdminServiceCategoryStatsDto;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdminServiceCategoryBody {
  serviceName: string;
  category: ServiceCategoryKind;
  description?: string | null;
  durationMinutes?: number | null;
  basePrice: number;
  status?: ServiceCategoryStatus;
}

export interface UpdateAdminServiceCategoryBody {
  serviceName?: string;
  category?: ServiceCategoryKind;
  description?: string | null;
  durationMinutes?: number | null;
  basePrice?: number;
  status?: ServiceCategoryStatus;
}
