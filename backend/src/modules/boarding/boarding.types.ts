import type { QueryResultRow } from "pg";

export type BoardingRecordStatus = "pending" | "confirmed" | "staying" | "checked_out";
export type BoardingCreateStatus = "pending_payment" | "pending";
export type BoardingPaymentOption = "online" | "counter";
export type BoardingInvoiceStatus = "pending_payment" | "paid" | "cancelled" | "refunded";
export type BoardingAlertLevel = "normal" | "attention" | "urgent";
export type BoardingPetSpecies = "Dog" | "Cat" | "Other";

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

// Staff Boarding Types
export type StaffBoardingStatusDto =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "STAYING"
  | "CHECKED_OUT"
  | "REJECTED"
  | "CANCELLED";

export type StaffBoardingRoomTypeDto = string;
export type StaffBoardingPaymentStatusDto = "UNPAID" | "PAID";
export type StaffBoardingPaymentMethodDto = "AT_COUNTER" | "ONLINE";
export type StaffBoardingUpdateAlertLevelDto = "NORMAL" | "NEED_ATTENTION" | "WARNING";
export type StaffBoardingUpdateVisibilityDto = "DRAFT" | "PUBLISHED";

export type StaffBoardingTimelineTypeDto =
  | "CREATED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CARE_UPDATE"
  | "CHECKED_OUT"
  | "REJECTED"
  | "CANCELLED";

export type StaffBoardingTimelineLabelToneDto =
  | "neutral"
  | "warning"
  | "success"
  | "info"
  | "danger";

export type StaffBoardingTimelineType = StaffBoardingTimelineTypeDto;
export type StaffBoardingTimelineLabelTone = StaffBoardingTimelineLabelToneDto;
export type StaffBoardingUpdateAlertLevel = StaffBoardingUpdateAlertLevelDto;
export type StaffBoardingUpdateVisibilityStatus = StaffBoardingUpdateVisibilityDto;
export type StaffBoardingStatus = StaffBoardingStatusDto;

export interface StaffBoardingListItemDto {
  id: string;
  boardingCode: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    ageText: string | null;
    imageUrl: string | null;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    email: string | null;
  };
  room: {
    id: string;
    code: string;
    name: string;
    roomType: StaffBoardingRoomTypeDto;
  };
  requestedRoomType: StaffBoardingRoomTypeDto;
  checkInDate: string;
  checkOutDate: string;
  totalDays: number;
  status: StaffBoardingStatusDto;
  paymentStatus: StaffBoardingPaymentStatusDto;
  estimatedAmount: number;
  finalAmount: number | null;
  currency: "VND";
  specialRequest: string | null;
  latestUpdateAt: string | null;
}

export interface StaffBoardingStatsDto {
  allCount: number;
  pendingCount: number;
  confirmedCount: number;
  stayingCount: number;
  checkedOutCount: number;
  rejectedCount: number;
  cancelledCount: number;
}

export interface StaffBoardingPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StaffBoardingListResponseDto {
  data: StaffBoardingListItemDto[];
  stats: StaffBoardingStatsDto;
  pagination: StaffBoardingPaginationDto;
}

export interface StaffBoardingTimelineItemDto {
  id: string;
  type: StaffBoardingTimelineType;
  title: string;
  label: string;
  labelTone: StaffBoardingTimelineLabelTone;
  description?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    fullName: string;
  } | null;
  source?: "SYSTEM" | "BOARDING_UPDATE";
  alertLevel?: StaffBoardingUpdateAlertLevel | null;
  attachmentUrls?: string[];
}

export interface StaffBoardingCareUpdateDto {
  id: string;
  title: string;
  description: string;
  alertLevel: StaffBoardingUpdateAlertLevel;
  visibilityStatus: StaffBoardingUpdateVisibilityStatus;
  attachmentUrl: string | null;
  attachmentUrls?: string[];
  updatedAt: string;
  createdBy: {
    id: string;
    fullName: string;
  } | null;
}

export interface StaffBoardingDraftUpdateDto {
  id: string;
  boardingId: string;
  description: string;
  alertLevel: StaffBoardingUpdateAlertLevel;
  visibilityStatus: "DRAFT";
  attachmentUrl: string | null;
  attachmentUrls?: string[];
  updatedAt: string;
}

export interface StaffBoardingDetailDto {
  id: string;
  boardingCode: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    ageText: string | null;
    imageUrl: string | null;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    email: string | null;
  };
  room: {
    id: string;
    code: string;
    name: string;
    roomType: StaffBoardingRoomTypeDto;
  };
  requestedRoomType: StaffBoardingRoomTypeDto;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  currentDayLabel: string | null;
  totalDays: number;
  status: StaffBoardingStatus;
  paymentStatus: StaffBoardingPaymentStatusDto;
  estimatedAmount: number;
  finalAmount: number | null;
  currency: string;
  specialRequests: string[];
  note: string | null;
  rejectionReason: string | null;
  payment: {
    paymentMethod: StaffBoardingPaymentMethodDto;
    paymentStatus: StaffBoardingPaymentStatusDto;
    amount: number;
    currency: string;
  };
  careUpdates: StaffBoardingCareUpdateDto[];
  careLogs: StaffBoardingCareUpdateDto[];
  timeline: StaffBoardingTimelineItemDto[];
}

