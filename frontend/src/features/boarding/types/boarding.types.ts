export type BoardingRecordStatus = "pending" | "confirmed" | "staying" | "checked_out"
export type BoardingPaymentOption = "online" | "counter"
export type BoardingPaymentStatus = "paid" | "unpaid" | "refunded" | "cancelled"
export type BoardingHealthStatus = "normal" | "attention" | "urgent" | "unknown"
export type BoardingTimeRange = "all" | "upcoming" | "current" | "past"

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
