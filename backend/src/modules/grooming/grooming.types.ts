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

export type StaffCounterGroomingPetDto = GroomingBookingPetDto & {
  breed: string | null;
  ownerUserId: string;
  ownerName: string;
  ownerPhoneNumber: string | null;
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

export type StaffCounterGroomingOptionsDto = {
  pets: StaffCounterGroomingPetDto[];
  selectedPet: StaffCounterGroomingPetDto | null;
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
export type StaffGroomingTicketStatusFilter = GroomingTicketStatus | "all";
export type StaffGroomingTicketStatusTone = "payment" | "pending" | "accepted" | "completed" | "cancelled";

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

export type StaffGroomingTicketDto = {
  groomingTicketId: string;
  bookingCode: string;
  petName: string;
  petDescription: string;
  ownerName: string;
  serviceName: string;
  serviceCount: number;
  scheduledAt: string;
  sourceType: "online" | "counter";
  sourceLabel: string;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  paymentStatusTone: "pending" | "paid";
  specialRequest: string | null;
  totalAmount: number;
  totalAmountText: string;
  status: GroomingTicketStatus;
  statusLabel: string;
  statusTone: StaffGroomingTicketStatusTone;
  canAccept: boolean;
  canComplete: boolean;
  canCancel: boolean;
};

export type StaffGroomingTicketSummaryDto = {
  total: number;
  waitingAccept: number;
  accepted: number;
  completed: number;
  cancelled: number;
};

export type StaffGroomingTicketListDto = {
  summary: StaffGroomingTicketSummaryDto;
  tickets: StaffGroomingTicketDto[];
};
