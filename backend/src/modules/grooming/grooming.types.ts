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
  label: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
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
export type InvoiceStatus = "draft" | "pending_payment" | "paid" | "cancelled";
export type GroomingPaymentOption = "counter" | "online";
export type StaffGroomingTicketStatusFilter = GroomingTicketStatus | "all";
export type StaffGroomingTicketStatusTone = "payment" | "pending" | "accepted" | "inProgress" | "completed" | "cancelled";

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
  canStart: boolean;
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  tickets: StaffGroomingTicketDto[];
};
