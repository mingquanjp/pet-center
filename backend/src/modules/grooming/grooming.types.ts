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

export type GroomingBookingPetDto = {
  petId: string;
  petName: string;
  species: string;
  speciesLabel: string;
  weightKg: number | null;
  profileImageUrl: string | null;
};

export type GroomingBookingServiceDto = {
  serviceId: string;
  serviceName: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  durationText: string;
  appliedPrice: number;
  appliedPricingCondition: string;
  appliedPricingConditionLabel: string;
  priceText: string;
};

export type GroomingBookingOptionsDto = {
  pets: GroomingBookingPetDto[];
  selectedPet: GroomingBookingPetDto | null;
  services: GroomingBookingServiceDto[];
};

export type GroomingAvailabilitySlotDto = {
  time: string;
  capacity: number;
  bookedUnits: number;
  availableUnits: number;
  available: boolean;
};

export type GroomingAvailabilityDto = {
  date: string;
  slots: GroomingAvailabilitySlotDto[];
};

export type GroomingTicketStatus = "pending_payment" | "pending" | "waiting" | "in_progress" | "completed" | "cancelled";
export type InvoiceStatus = "draft" | "pending_payment" | "paid" | "cancelled" | "refunded";
export type GroomingPaymentOption = "counter" | "online";

export type GroomingTicketCreatedDto = {
  groomingTicketId: string;
  bookingCode: string;
  invoiceId: string;
  paymentOption: GroomingPaymentOption;
  ticketStatus: GroomingTicketStatus;
  invoiceStatus: InvoiceStatus;
  totalAmount: number;
  paymentUrl: string | null;
  petName: string;
  serviceName: string;
  scheduledAt: string;
};
