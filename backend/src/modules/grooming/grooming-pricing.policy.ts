
import type { GroomingBookingServicePriceBaseDto } from "./grooming.types.js";
import type { GroomingBookingServiceDto } from "./grooming.types.js";

export function applyWeightBasedPrice(service: GroomingBookingServicePriceBaseDto, weightKg: number): GroomingBookingServiceDto {
  const appliedPrice = calculateGroomingPrice(service.basePrice, weightKg);

  return {
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    description: service.description,
    estimatedDurationMinutes: service.estimatedDurationMinutes,
    durationText: service.durationText,
    appliedPrice,
    appliedPricingConditionLabel: getAppliedPricingConditionLabel(weightKg),
    priceText: `${formatMoney(appliedPrice)} VND`
  };
}

export function calculateGroomingPrice(basePrice: number, weightKg: number): number {
  if (weightKg < largePetThresholdKg) {
    return basePrice;
  }

  const surchargeSteps = getSurchargeSteps(weightKg);

  return basePrice + surchargeSteps * largePetSurchargeAmount;
}

export function getAppliedPricingConditionLabel(weightKg: number): string {
  if (weightKg < largePetThresholdKg) {
    return "Dưới 5 kg";
  }

  const surchargeSteps = getSurchargeSteps(weightKg);

  return `Phụ thu theo cân nặng hiện tại: +${formatMoney(surchargeSteps * largePetSurchargeAmount)} VND`;
}

function getSurchargeSteps(weightKg: number): number {
  return Math.floor((weightKg - largePetThresholdKg) / largePetSurchargeStepKg) + 1;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

const largePetThresholdKg = 5;
const largePetSurchargeStepKg = 3;
const largePetSurchargeAmount = 50000;
