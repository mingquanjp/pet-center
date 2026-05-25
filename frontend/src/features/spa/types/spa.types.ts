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
