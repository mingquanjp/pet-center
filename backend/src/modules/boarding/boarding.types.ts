import type { QueryResultRow } from "pg";

export type BoardingRecordStatus = "pending" | "confirmed" | "staying" | "checked_out";
export type BoardingPaymentOption = "online" | "counter";
export type BoardingInvoiceStatus = "pending_payment" | "paid" | "cancelled" | "refunded";
export type BoardingAlertLevel = "normal" | "attention" | "urgent";

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
