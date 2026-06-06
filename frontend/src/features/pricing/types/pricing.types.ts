export type PricingStatus = "active" | "inactive"
export type PricingServiceCategory = "medical" | "grooming" | "boarding" | "medicine" | "other"

export type PricingFilters = {
  search: string
  category: PricingServiceCategory | "ALL"
  status: PricingStatus | "ALL"
  serviceId: string
}

export type AdminPriceRule = {
  id: string
  code: string
  serviceId: string
  serviceName: string
  serviceCategory: PricingServiceCategory
  pricingCondition: string
  priceAmount: number
  effectiveFrom: string
  status: PricingStatus
}

export type AdminPricingStats = {
  totalRules: number
  activeRules: number
  inactiveRules: number
  averagePrice: number
  serviceCount: number
}

export type AdminPricingServiceOption = {
  id: string
  name: string
  category: PricingServiceCategory
  basePrice: number
}

export type AdminPricingPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PriceRuleFormValues = {
  serviceId: string
  pricingCondition: string
  priceAmount: number
  effectiveFrom: string
  status: PricingStatus
}

export type CreateAdminPriceRulePayload = PriceRuleFormValues

export type UpdateAdminPriceRulePayload = Partial<PriceRuleFormValues> & {
  id: string
}
