import type { LucideIcon } from "lucide-react"

export type OwnerSpaTab = "available" | "booked" | "history"

export type SpaBookingStatus =
  | "WAITING_ACCEPT"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "WAITING_COUNTER_PAYMENT"
  | "COMPLETED"
  | "CANCELLED"

export interface SpaService {
  id: string
  title: string
  description: string
  priceText: string
  durationText: string
  icon: LucideIcon
  featured?: boolean
}

export interface GroomingServicePriceRule {
  priceRuleId: string
  pricingCondition: string
  pricingConditionLabel: string
  priceAmount: number
  effectiveFrom: string
}

export interface GroomingService {
  serviceId: string
  serviceName: string
  description: string | null
  estimatedDurationMinutes: number | null
  durationText: string
  basePrice: number
  priceMin: number
  priceMax: number
  priceText: string
  priceRules: GroomingServicePriceRule[]
}

export interface GroomingBookingPet {
  petId: string
  petName: string
  species: string
  speciesLabel: string
  weightKg: number | null
  profileImageUrl: string | null
}

export interface StaffCounterGroomingPet extends GroomingBookingPet {
  breed: string | null
  ownerUserId: string
  ownerName: string
  ownerPhoneNumber: string | null
}

export interface GroomingBookingService {
  serviceId: string
  serviceName: string
  description: string | null
  estimatedDurationMinutes: number | null
  durationText: string
  appliedPrice: number
  appliedPricingCondition: string
  appliedPricingConditionLabel: string
  priceText: string
}

export interface GroomingBookingOptions {
  pets: GroomingBookingPet[]
  selectedPet: GroomingBookingPet | null
  services: GroomingBookingService[]
}

export interface StaffCounterGroomingOptions {
  pets: StaffCounterGroomingPet[]
  selectedPet: StaffCounterGroomingPet | null
  services: GroomingBookingService[]
}

export interface GroomingAvailabilitySlot {
  time: string
  capacity: number
  bookedUnits: number
  availableUnits: number
  available: boolean
}

export interface GroomingAvailability {
  date: string
  slots: GroomingAvailabilitySlot[]
}

export interface CreateGroomingTicketPayload {
  petId: string
  serviceId: string
  scheduledAt: string
  specialRequest?: string | null
  paymentOption: SpaPaymentMethod
}

export interface CreateStaffCounterGroomingTicketPayload {
  petId: string
  serviceId: string
  scheduledAt: string
  specialRequest?: string | null
}

export type GroomingTicketStatus =
  | "pending_payment"
  | "pending"
  | "waiting"
  | "in_progress"
  | "completed"
  | "cancelled"

export type StaffGroomingTicketStatusFilter = GroomingTicketStatus | "all"
export type StaffGroomingTicketStatusTone = "payment" | "pending" | "accepted" | "inProgress" | "completed" | "cancelled"
export type StaffGroomingTicketSpeciesFilter = "all" | "Dog" | "Cat" | "Other"
export type StaffGroomingTicketTimeRangeFilter = "all" | "today" | "upcoming" | "past"

export type InvoiceStatus = "draft" | "pending_payment" | "paid" | "cancelled" | "refunded"

export interface GroomingTicketCreated {
  groomingTicketId: string
  bookingCode: string
  invoiceId: string
  paymentOption: SpaPaymentMethod
  ticketStatus: GroomingTicketStatus
  invoiceStatus: InvoiceStatus
  totalAmount: number
  paymentUrl: string | null
  petName: string
  serviceName: string
  scheduledAt: string
}

export interface GroomingTicketCancelled {
  groomingTicketId: string
  bookingCode: string
  ticketStatus: "cancelled"
  ticketStatusLabel: string
  invoiceStatus: InvoiceStatus | null
}

export interface StaffGroomingTicket {
  groomingTicketId: string
  bookingCode: string
  petName: string
  petDescription: string
  ownerName: string
  serviceName: string
  serviceCount: number
  scheduledAt: string
  sourceType: "online" | "counter"
  sourceLabel: string
  paymentMethodLabel: string
  paymentStatusLabel: string
  paymentStatusTone: "pending" | "paid"
  specialRequest: string | null
  totalAmount: number
  totalAmountText: string
  status: GroomingTicketStatus
  statusLabel: string
  statusTone: StaffGroomingTicketStatusTone
  canAccept: boolean
  canStart: boolean
  canComplete: boolean
  canCancel: boolean
}

export interface StaffGroomingTicketSummary {
  total: number
  waitingAccept: number
  accepted: number
  completed: number
  cancelled: number
}

export interface StaffGroomingTicketList {
  summary: StaffGroomingTicketSummary
  pagination: Pagination
  tickets: StaffGroomingTicket[]
}

export interface StaffGroomingTicketQuery {
  status?: StaffGroomingTicketStatusFilter
  serviceId?: string
  species?: StaffGroomingTicketSpeciesFilter
  timeRange?: StaffGroomingTicketTimeRangeFilter
  search?: string
  page?: number
  limit?: number
}

export type BookedGroomingTicketStatus = "pending" | "waiting" | "in_progress"
export type GroomingTicketHistoryStatus = "completed" | "cancelled"

export interface GroomingTicketListItem {
  groomingTicketId: string
  bookingCode: string
  serviceName: string
  petName: string
  scheduledAt: string
  scheduledDate: string
  scheduledTime: string
  ticketStatus: GroomingTicketStatus
  ticketStatusLabel: string
  paymentOption: SpaPaymentMethod
  paymentMethodLabel: string
  invoiceStatus: InvoiceStatus | null
  paymentStatusLabel: string
  totalAmount: number
  specialRequest: string | null
  canCancel: boolean
}

export interface GroomingTicketListParams {
  search?: string
  petId?: string
  status?: "all" | BookedGroomingTicketStatus
  timeRange?: "all" | "today" | "upcoming" | "past"
  page?: number
  limit?: number
}

export interface GroomingTicketHistoryParams {
  search?: string
  petId?: string
  status?: "all" | GroomingTicketHistoryStatus
  timeRange?: "all" | "today" | "upcoming" | "past"
  page?: number
  limit?: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface OwnerSpaRequest {
  id: string
  bookingCode: string
  serviceName: string
  petName: string
  scheduledAt: string
  status: SpaBookingStatus
  totalAmount: string
  paymentMethodLabel: string
  paymentStatusLabel: string
  paymentStatusTone: "pending" | "paid"
  icon: LucideIcon
  specialRequest?: string
  paymentNotice?: string
  canCancel?: boolean
}

export interface OwnerSpaPet {
  id: string
  name: string
  species: string
  weightKg: number
  avatarUrl?: string
  fallbackInitial?: string
}

export interface SpaBookingServiceOption {
  id: string
  name: string
  price: number
  popular?: boolean
}

export type SpaPaymentMethod = "counter" | "online"
