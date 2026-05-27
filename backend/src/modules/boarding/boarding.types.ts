import type { QueryResultRow } from "pg";

export type BoardingRecordStatus = "pending" | "confirmed" | "staying" | "checked_out";
export type BoardingCreateStatus = "pending_payment" | "pending";
export type BoardingPaymentOption = "online" | "counter";
export type BoardingInvoiceStatus = "pending_payment" | "paid" | "cancelled" | "refunded";
export type BoardingAlertLevel = "normal" | "attention" | "urgent";
export type BoardingPetSpecies = "Dog" | "Cat" | "Other";
export type BoardingCareLogType = "booking_created" | "check_in" | "daily_update" | "check_out";

export type BoardingRecordListFilters = {
  ownerUserId: string;
  search?: string;
  status: "all" | BoardingRecordStatus;
  roomTypeId?: string;
  timeRange: "all" | "upcoming" | "current" | "past";
  limit: number;
  offset: number;
};

export type BoardingRecordListRow = QueryResultRow & {
  boarding_record_id: string;
  pet_id: string;
  pet_name: string;
  profile_image_url: string | null;
  room_type_id: string;
  room_type_name: string;
  planned_check_in_at: string | Date;
  planned_check_out_at: string | Date;
  planned_check_in_date: string;
  planned_check_out_date: string;
  planned_date_range_text: string;
  stay_days: number;
  boarding_status: BoardingRecordStatus;
  estimated_total: string | number;
  invoice_id: string | null;
  payment_option: BoardingPaymentOption | null;
  invoice_status: BoardingInvoiceStatus | null;
  has_success_payment: boolean;
  last_update_at: string | null;
  alert_level: BoardingAlertLevel | null;
};

export type BoardingRecordDetailRow = BoardingRecordListRow & {
  species: BoardingPetSpecies;
  weight_kg: string | number | null;
  room_description: string | null;
  actual_check_in_at: string | Date | null;
  actual_check_out_at: string | Date | null;
  care_request: string | null;
  receipt_code: string | null;
  receipt_url: string | null;
};

export type BoardingUpdateRow = QueryResultRow & {
  boarding_update_id: string;
  updated_at: string | Date;
  update_note: string;
  attachment_url: string | null;
  alert_level: BoardingAlertLevel;
};

export type CountRow = QueryResultRow & {
  total: string;
};

export type BoardingBookingPetRow = QueryResultRow & {
  pet_id: string;
  pet_name: string;
  species: BoardingPetSpecies;
  weight_kg: string | number | null;
  profile_image_url: string | null;
};

export type BoardingRoomTypeAvailabilityRow = QueryResultRow & {
  room_type_id: string;
  room_type_name: string;
  capacity: number;
  boarding_unit_price: string | number;
  description: string | null;
  booked_units: string | number;
};

export type CreateBoardingRecordInput = {
  ownerUserId: string;
  pet: BoardingBookingPetDto;
  roomType: BoardingRoomTypeBookingDto;
  plannedCheckInAt: Date;
  plannedCheckOutAt: Date;
  stayDays: number;
  careRequest?: string | null;
  paymentOption: BoardingPaymentOption;
};

export type BoardingRecordListItemDto = {
  boardingRecordId: string;
  boardingCode: string;
  pet: {
    petId: string;
    petName: string;
    profileImageUrl: string | null;
  };
  room: {
    roomTypeId: string;
    roomTypeName: string;
  };
  plannedCheckInAt: string;
  plannedCheckOutAt: string;
  plannedCheckInDate: string;
  plannedCheckOutDate: string;
  plannedDateRangeText: string;
  stayDays: number;
  status: BoardingRecordStatus;
  statusLabel: string;
  payment: {
    paymentOption: BoardingPaymentOption | null;
    paymentMethodLabel: string;
    paymentStatus: "paid" | "unpaid" | "refunded" | "cancelled";
    paymentStatusLabel: string;
  };
  estimatedTotal: number;
  activeCare?: {
    healthStatus: BoardingAlertLevel | "unknown";
    healthStatusLabel: string;
    lastUpdatedAt: string | null;
  };
};

export type BoardingRecordDetailDto = {
  boardingRecordId: string;
  boardingCode: string;
  status: BoardingRecordStatus;
  statusLabel: string;
  pet: {
    petId: string;
    petName: string;
    speciesLabel: string;
    weightKg: number | null;
    profileImageUrl: string | null;
  };
  room: {
    roomTypeId: string;
    roomTypeName: string;
    description: string | null;
  };
  stay: {
    plannedCheckInAt: string;
    plannedCheckOutAt: string;
    actualCheckInAt: string | null;
    actualCheckOutAt: string | null;
    stayDays: number;
  };
  payment: {
    invoiceId: string | null;
    paymentOption: BoardingPaymentOption | null;
    paymentMethodLabel: string;
    paymentStatus: "paid" | "unpaid" | "refunded" | "cancelled";
    paymentStatusLabel: string;
    receiptCode: string | null;
    receiptUrl: string | null;
  };
  estimatedTotal: number;
  careRequest: string | null;
  careLogs: BoardingCareLogDto[];
};

export type BoardingCareLogDto = {
  logId: string;
  logType: BoardingCareLogType;
  title: string;
  occurredAt: string;
  note: string;
  alertLevel: BoardingAlertLevel | "info";
  alertLabel: string;
  attachments: Array<{
    url: string;
    type: "image" | "video" | "file";
  }>;
};

export type BoardingBookingPetDto = {
  petId: string;
  petName: string;
  species: BoardingPetSpecies;
  speciesLabel: string;
  weightKg: number | null;
  profileImageUrl: string | null;
};

export type BoardingRoomTypeBookingDto = {
  roomTypeId: string;
  roomTypeName: string;
  description: string | null;
  capacity: number;
  unitPrice: number;
  priceText: string;
  bookedUnits: number;
  availableUnits: number;
  available: boolean;
  nights: number;
  estimatedTotal: number;
  estimatedTotalText: string;
};

export type BoardingBookingOptionsDto = {
  pets: BoardingBookingPetDto[];
  selectedPet: BoardingBookingPetDto | null;
  roomTypes: BoardingRoomTypeBookingDto[];
};

export type BoardingRecordCreatedDto = {
  boardingRecordId: string;
  boardingCode: string;
  invoiceId: string;
  paymentOption: BoardingPaymentOption;
  boardingStatus: BoardingCreateStatus;
  invoiceStatus: "pending_payment";
  totalAmount: number;
  paymentUrl: string | null;
  petName: string;
  roomTypeName: string;
  plannedCheckInAt: string;
  plannedCheckOutAt: string;
  stayDays: number;
};
