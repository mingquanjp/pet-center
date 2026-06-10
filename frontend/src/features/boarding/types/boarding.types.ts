export type BoardingRecordStatus = "pending" | "confirmed" | "staying" | "checked_out" | "cancelled" | "rejected"
export type BoardingCreateStatus = "pending_payment" | "pending"
export type BoardingPaymentOption = "online" | "counter"
export type BoardingPaymentStatus = "paid" | "unpaid" | "cancelled"
export type BoardingHealthStatus = "normal" | "attention" | "urgent" | "unknown"
export type BoardingTimeRange = "all" | "upcoming" | "current" | "past"
export type BoardingCareLogType = "booking_created" | "check_in" | "daily_update" | "check_out"
export type BoardingCareLogAlertLevel = BoardingHealthStatus | "info"

export interface BoardingCareLogAttachment {
  url: string
  type: "image" | "video" | "file"
}

export interface BoardingCareLog {
  logId: string
  logType: BoardingCareLogType
  title: string
  occurredAt: string
  note: string
  alertLevel: BoardingCareLogAlertLevel
  alertLabel: string
  attachments: BoardingCareLogAttachment[]
}

export interface BoardingRecordListItem {
  boardingRecordId: string
  boardingCode: string
  pet: {
    petId: string
    petName: string
    profileImageUrl: string | null
  }
  room: {
    roomTypeId: string
    roomTypeName: string
  }
  plannedCheckInAt?: string
  plannedCheckOutAt?: string
  plannedCheckInDate: string
  plannedCheckOutDate: string
  plannedDateRangeText: string
  stayDays: number
  status: BoardingRecordStatus
  statusLabel: string
  payment: {
    paymentOption: BoardingPaymentOption | null
    paymentMethodLabel: string
    paymentStatus: BoardingPaymentStatus
    paymentStatusLabel: string
  }
  estimatedTotal: number
  activeCare?: {
    healthStatus: BoardingHealthStatus
    healthStatusLabel: string
    lastUpdatedAt: string | null
  }
}

export interface BoardingRecordDetail {
  boardingRecordId: string
  boardingCode: string
  status: BoardingRecordStatus
  statusLabel: string
  pet: {
    petId: string
    petName: string
    speciesLabel: string
    weightKg: number | null
    profileImageUrl: string | null
  }
  room: {
    roomTypeId: string
    roomTypeName: string
    description: string | null
  }
  stay: {
    plannedCheckInAt: string
    plannedCheckOutAt: string
    actualCheckInAt: string | null
    actualCheckOutAt: string | null
    stayDays: number
  }
  payment: {
    invoiceId: string | null
    paymentOption: BoardingPaymentOption | null
    paymentMethodLabel: string
    paymentStatus: BoardingPaymentStatus
    paymentStatusLabel: string
    receiptCode: string | null
    receiptUrl: string | null
  }
  estimatedTotal: number
  careRequest: string | null
  careLogs: BoardingCareLog[]
}

export interface BoardingRecordListParams {
  search?: string
  status?: "all" | BoardingRecordStatus
  roomTypeId?: string
  timeRange?: BoardingTimeRange
  page?: number
  limit?: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface BoardingBookingPet {
  petId: string
  petName: string
  species: "Dog" | "Cat" | "Other"
  speciesLabel: string
  weightKg: number | null
  profileImageUrl: string | null
}

export interface BoardingRoomTypeBooking {
  roomTypeId: string
  roomTypeName: string
  description: string | null
  capacity: number
  unitPrice: number
  priceText: string
  bookedUnits: number
  availableUnits: number
  available: boolean
  nights: number
  estimatedTotal: number
  estimatedTotalText: string
}

export interface BoardingBookingOptions {
  pets: BoardingBookingPet[]
  selectedPet: BoardingBookingPet | null
  roomTypes: BoardingRoomTypeBooking[]
}

export interface BoardingBookingOptionsParams {
  petId?: string
  plannedCheckInAt?: string
  plannedCheckOutAt?: string
}

export interface CreateBoardingRecordPayload {
  petId: string
  roomTypeId: string
  plannedCheckInAt: string
  plannedCheckOutAt: string
  careRequest?: string | null
  paymentOption: BoardingPaymentOption
}

export interface BoardingRecordCreated {
  boardingRecordId: string
  boardingCode: string
  invoiceId: string
  paymentOption: BoardingPaymentOption
  boardingStatus: BoardingCreateStatus
  invoiceStatus: "pending_payment"
  totalAmount: number
  paymentUrl: string | null
  petName: string
  roomTypeName: string
  plannedCheckInAt: string
  plannedCheckOutAt: string
  stayDays: number
}

export type StaffBoardingStatus =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "STAYING"
  | "CHECKED_OUT"
  | "REJECTED"
  | "CANCELLED";

export type StaffBoardingTab = "ALL" | StaffBoardingStatus;

export type StaffBoardingRoomFilter = "ALL" | "STANDARD" | "VIP" | "UNASSIGNED";

export type StaffBoardingTimeFilter = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";

export type StaffBoardingPaymentStatus = "UNPAID" | "PAID";

export type StaffBoardingRoomType = string;

export type StaffBoardingPaymentMethod = "AT_COUNTER" | "ONLINE";

export type StaffBoardingUpdateAlertLevel = "NORMAL" | "NEED_ATTENTION" | "WARNING";

export type StaffBoardingUpdateVisibilityStatus = "PUBLISHED" | "DRAFT";

export interface StaffBoardingListItem {
  id: string;
  boardingCode: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    ageText?: string;
    imageUrl?: string | null;
  };
  owner: {
    id: string;
    fullName: string;
  };
  room: {
    id: string;
    code: string;
    roomType: StaffBoardingRoomType;
    name?: string;
  } | null;
  requestedRoomType: StaffBoardingRoomType;
  checkInDate: string;
  checkOutDate: string;
  totalDays: number;
  status: StaffBoardingStatus;
  paymentStatus: StaffBoardingPaymentStatus;
  estimatedAmount: number;
  finalAmount?: number;
  currency: string;
  specialRequest?: string;
  latestUpdateAt?: string;
}

export type StaffBoardingTimelineType =
  | "CREATED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CARE_UPDATE"
  | "CHECKED_OUT"
  | "REJECTED"
  | "CANCELLED";

export type StaffBoardingTimelineLabelTone =
  | "neutral"
  | "warning"
  | "success"
  | "info"
  | "danger";

export interface StaffBoardingTimelineItem {
  id: string;
  type?: StaffBoardingTimelineType;
  title: string;
  status?: string;
  label?: string;
  labelTone?: StaffBoardingTimelineLabelTone;
  description?: string | null;
  createdAt: string;
  actorName?: string;
  createdBy?: {
    id: string;
    fullName: string;
  } | null;
  source?: "SYSTEM" | "BOARDING_UPDATE";
  alertLevel?: "NORMAL" | "NEED_ATTENTION" | "WARNING" | "normal" | "attention" | "urgent" | null;
  attachmentUrl?: string | null;
  attachmentUrls?: string[];
}

export interface StaffBoardingCareUpdate {
  id: string;
  title: string;
  description: string;
  alertLevel: StaffBoardingUpdateAlertLevel;
  visibilityStatus: StaffBoardingUpdateVisibilityStatus;
  attachmentUrl?: string | null;
  attachmentUrls?: string[];
  updatedAt: string;
  createdBy?: {
    id: string;
    fullName: string;
  } | null;
}

export interface StaffBoardingDetail {
  id: string;
  boardingCode: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    ageText?: string;
    imageUrl?: string | null;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  room: {
    id: string;
    code: string;
    name?: string;
    roomType: StaffBoardingRoomType;
  } | null;
  roomType?: StaffBoardingRoomType;
  requestedRoomType: StaffBoardingRoomType;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInAt?: string | null;
  actualCheckOutAt?: string | null;
  currentDayLabel?: string | null;
  totalDays: number;
  status: StaffBoardingStatus;
  paymentStatus: StaffBoardingPaymentStatus;
  estimatedAmount: number;
  finalAmount?: number;
  currency: string;
  rejectionReason?: string;
  cancellationReason?: string;
  specialRequests: string[];
  note?: string | null;
  payment: {
    paymentMethod: StaffBoardingPaymentMethod;
    paymentStatus: StaffBoardingPaymentStatus;
    amount: number;
    currency: string;
  };
  careUpdates?: StaffBoardingCareUpdate[];
  careLogs?: StaffBoardingCareUpdate[];
  timeline: StaffBoardingTimelineItem[];
}

export interface StaffBoardingFilters {
  search: string;
  status: "ALL" | StaffBoardingStatus;
  roomType: "ALL" | StaffBoardingRoomType | string;
  timeRange: "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";
  tab: "ALL" | StaffBoardingStatus;
}

export interface StaffBoardingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StaffBoardingStats {
  allCount: number;
  pendingCount: number;
  confirmedCount: number;
  stayingCount: number;
  checkedOutCount: number;
  rejectedCount: number;
  cancelledCount: number;
}

export interface StaffBoardingListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  roomType?: string;
  timeRange?: string;
  tab?: string;
}

export interface StaffBoardingDraftUpdate {
  id?: string;
  boardingId?: string;
  description: string;
  alertLevel: StaffBoardingUpdateAlertLevel;
  visibilityStatus: StaffBoardingUpdateVisibilityStatus;
  attachmentUrl?: string | null;
  attachmentUrls: string[];
  updatedAt?: string;
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url?: string;
  public_id?: string;
}

export type StaffBoardingCreatePaymentMethod = "AT_COUNTER";
export type StaffBoardingCreatePaymentStatus = "PAID";
export type StaffBoardingCreateStatus = "STAYING";

export interface StaffBoardingOwnerOption {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  emailSent?: boolean;
}

export interface CreateStaffBoardingOwnerPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  address?: string;
}

export interface StaffBoardingPetOption {
  id: string;
  ownerId: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed?: string | null;
  ageText?: string | null;
  weightText?: string | null;
  imageUrl?: string | null;
  healthNote?: string | null;
}

export interface CreateStaffBoardingPetPayload {
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed: string;
  gender: "male" | "female" | "unknown";
  birthDate?: string;
  estimatedAge?: number;
  furColor?: string;
  weightKg?: number;
  profileImageUrl?: string;
  identifyingMarks?: string;
}

export interface StaffBoardingRoomTypeOption {
  id: string;
  code: string;
  name: string;
  roomType: "STANDARD" | "VIP" | "UNKNOWN";
  description?: string | null;
  pricePerDay: number;
  availableCount: number;
  capacityText?: string | null;
  features: string[];
}

export interface StaffBoardingCreateOptions {
  owners: StaffBoardingOwnerOption[];
  pets: StaffBoardingPetOption[];
  roomTypes: StaffBoardingRoomTypeOption[];
}

export interface CreateStaffBoardingPayload {
  ownerId: string;
  petId: string;
  roomTypeId: string;
  plannedCheckInAt?: string;
  plannedCheckOutAt?: string;
  plannedCheckInDate: string;
  plannedCheckOutDate: string;
  careRequest?: string | null;
  specialRequests: string[];
  paymentMethod: StaffBoardingCreatePaymentMethod;
  paymentStatus: StaffBoardingCreatePaymentStatus;
  createMode: "CHECK_IN_NOW";
  note?: string | null;
}

export interface StaffBoardingCreateInvoicePreview {
  invoiceId?: string | null;
  invoiceCode?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: "VND";
  totalDays: number;
  pricePerDay: number;
  paymentMethod: StaffBoardingCreatePaymentMethod;
  paymentStatus: StaffBoardingCreatePaymentStatus;
}

export interface CreateStaffBoardingResult {
  boardingId: string;
  boardingCode: string;
  status: StaffBoardingCreateStatus;
  actualCheckInAt: string;
  invoice: StaffBoardingCreateInvoicePreview;
}
