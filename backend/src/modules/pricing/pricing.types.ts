export type PricingStatus = "active" | "inactive";
export type PricingStatusFilter = "ALL" | PricingStatus;
export type PricingServiceCategory = "medical" | "grooming" | "boarding" | "medicine" | "other";
export type PricingServiceCategoryFilter = "ALL" | PricingServiceCategory;

export interface AdminPricingQueryDto {
  search?: string;
  category?: PricingServiceCategoryFilter;
  status?: PricingStatusFilter;
  serviceId?: string;
  page?: number;
  limit?: number;
}

export interface AdminPriceRuleDto {
  id: string;
  code: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: PricingServiceCategory;
  pricingCondition: string;
  priceAmount: number;
  effectiveFrom: string;
  status: PricingStatus;
}

export interface AdminPricingStatsDto {
  totalRules: number;
  activeRules: number;
  inactiveRules: number;
  averagePrice: number;
  serviceCount: number;
}

export interface AdminPricingServiceOptionDto {
  id: string;
  name: string;
  category: PricingServiceCategory;
  basePrice: number;
}

export interface AdminPricingListResultDto {
  items: AdminPriceRuleDto[];
  stats: AdminPricingStatsDto;
  serviceOptions: AdminPricingServiceOptionDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAdminPriceRuleBody {
  serviceId: string;
  pricingCondition: string;
  priceAmount: number;
  effectiveFrom: string;
  status?: PricingStatus;
}

export interface UpdateAdminPriceRuleBody {
  serviceId?: string;
  pricingCondition?: string;
  priceAmount?: number;
  effectiveFrom?: string;
  status?: PricingStatus;
}
