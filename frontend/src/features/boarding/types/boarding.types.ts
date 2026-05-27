export type BoardingRecordStatus = "pending" | "confirmed" | "staying" | "checked_out"
export type BoardingCreateStatus = "pending_payment" | "pending"
export type BoardingPaymentOption = "online" | "counter"
export type BoardingPaymentStatus = "paid" | "unpaid" | "refunded" | "cancelled"
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
