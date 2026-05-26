export type GroomingServicePriceRuleDto = {
  priceRuleId: string;
  pricingCondition: string;
  pricingConditionLabel: string;
  priceAmount: number;
  effectiveFrom: string;
};

export type GroomingServiceDto = {
  serviceId: string;
  serviceName: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  durationText: string;
  basePrice: number;
  priceMin: number;
  priceMax: number;
  priceText: string;
  priceRules: GroomingServicePriceRuleDto[];
};
