export type ServiceCategoryKind = "medical" | "grooming" | "boarding" | "medicine"

export type ServiceCategoryStatus = "active" | "inactive"

export type ServiceCategoryFilters = {
  search: string
  category: ServiceCategoryKind | "ALL"
  status: ServiceCategoryStatus | "ALL"
}

export type AdminServiceCategory = {
  id: string
  code: string
  serviceName: string
  category: ServiceCategoryKind
  durationMinutes: number | null
  basePrice: number
  status: ServiceCategoryStatus
  updatedAt: string | null
  description: string | null
  usageCount: number
}

export type ServiceCategoryFormValues = {
  serviceName: string
  category: ServiceCategoryKind
  durationMinutes: number | null
  basePrice: number
  status: ServiceCategoryStatus
  description: string | null
}

export type AdminServiceCategoryStats = {
  totalServices: number
  activeServices: number
  inactiveServices: number
  medicalServices: number
  averagePrice: number
}

export type AdminServiceCategoryPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type CreateAdminServiceCategoryPayload = ServiceCategoryFormValues

export type UpdateAdminServiceCategoryPayload = Partial<ServiceCategoryFormValues> & {
  id: string
}
