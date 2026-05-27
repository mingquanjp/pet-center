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

export type GroomingBookingServicePriceBaseDto = {
  serviceId: string;
  serviceName: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  durationText: string;
  basePrice: number;
  basePricingCondition: string;
  basePricingConditionLabel: string;
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

export type BookedGroomingTicketStatus = Extract<GroomingTicketStatus, "pending" | "waiting" | "in_progress">;
export type GroomingTicketHistoryStatus = Extract<GroomingTicketStatus, "completed" | "cancelled">;

export type GroomingTicketListFilters = {
  ownerUserId: string;
  search?: string;
  petId?: string;
  status?: "all" | BookedGroomingTicketStatus;
  timeRange?: "all" | "today" | "upcoming" | "past";
  limit: number;
  offset: number;
};

export type GroomingTicketHistoryFilters = {
  ownerUserId: string;
  search?: string;
  petId?: string;
  status?: "all" | GroomingTicketHistoryStatus;
  timeRange?: "all" | "today" | "upcoming" | "past";
  limit: number;
  offset: number;
};

export type GroomingTicketListItemDto = {
  groomingTicketId: string;
  bookingCode: string;
  serviceName: string;
  petName: string;
  scheduledAt: string;
  scheduledDate: string;
  scheduledTime: string;
  ticketStatus: GroomingTicketStatus;
  ticketStatusLabel: string;
  paymentOption: GroomingPaymentOption;
  paymentMethodLabel: string;
  invoiceStatus: InvoiceStatus | null;
  paymentStatusLabel: string;
  totalAmount: number;
  specialRequest: string | null;
  canCancel: boolean;
};

export type GroomingTicketDetailDto = GroomingTicketListItemDto & {
  pet: {
    petId: string;
    petName: string;
    species: string;
    speciesLabel: string;
    weightKg: number | null;
    profileImageUrl: string | null;
  };
  services: {
    serviceId: string;
    serviceName: string;
    quantity: number;
    appliedUnitPrice: number;
    lineAmount: number;
  }[];
  invoice: {
    invoiceId: string;
    invoiceStatus: InvoiceStatus;
    paymentOption: GroomingPaymentOption;
    totalAmount: number;
  } | null;
  payment: {
    paymentId: string;
    paymentMethod: string;
    paymentProvider: string | null;
    transactionCode: string | null;
    paidAmount: number;
    paidAt: string | null;
    paymentStatus: string;
    receiptCode: string | null;
    receiptUrl: string | null;
  } | null;
};

export type GroomingTicketCancelledDto = {
  groomingTicketId: string;
  bookingCode: string;
  ticketStatus: "cancelled";
  ticketStatusLabel: string;
  invoiceStatus: InvoiceStatus | null;
};

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
