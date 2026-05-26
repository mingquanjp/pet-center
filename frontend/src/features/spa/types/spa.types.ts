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

export type GroomingTicketStatus =
  | "pending_payment"
  | "pending"
  | "waiting"
  | "in_progress"
  | "completed"
  | "cancelled"

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
