import { Droplets, Flower2, Scissors, Sparkles } from "lucide-react"
import type {
  OwnerSpaPet,
  OwnerSpaRequest,
  OwnerSpaTab,
  SpaBookingServiceOption,
  SpaBookingStatus,
  SpaService,
} from "../types/spa.types"

export const ownerSpaTabs: Array<{ value: OwnerSpaTab; label: string }> = [
  { value: "available", label: "Dịch vụ khả dụng" },
  { value: "booked", label: "Dịch vụ đã đặt" },
  { value: "history", label: "Lịch sử" },
]

export const spaStatusLabel: Record<SpaBookingStatus, string> = {
  WAITING_ACCEPT: "Chờ tiếp nhận",
  ACCEPTED: "Đã tiếp nhận",
  IN_PROGRESS: "Đang thực hiện",
  WAITING_COUNTER_PAYMENT: "Chờ thanh toán tại trung tâm",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
}

export const spaStatusClassName: Record<SpaBookingStatus, string> = {
  WAITING_ACCEPT: "bg-petcenter-warning-bg text-petcenter-warning-text",
  ACCEPTED: "bg-[#D8F3EE] text-petcenter-primary",
  IN_PROGRESS: "bg-[#E3F2FD] text-[#1565C0]",
  WAITING_COUNTER_PAYMENT: "bg-[#FFEBEE] text-[#C62828]",
  COMPLETED: "bg-petcenter-success-bg text-petcenter-success-text",
  CANCELLED: "bg-petcenter-danger-bg text-petcenter-danger-text",
}

export const ownerSpaServices: SpaService[] = [
  {
    id: "basic-bath",
    title: "Tắm gội cơ bản",
    description: "Làm sạch lông, khử mùi nhẹ và sấy khô cho thú cưng.",
    priceText: "100.000 - 150.000 VNĐ",
    durationText: "30 phút",
    icon: Droplets,
  },
  {
    id: "fur-trimming",
    title: "Cắt tỉa lông",
    description: "Cắt tỉa gọn gàng, tạo kiểu lông cơ bản theo nhu cầu chăm sóc.",
    priceText: "100.000 - 150.000 VNĐ",
    durationText: "30 phút",
    icon: Scissors,
  },
  {
    id: "spa-combo",
    title: "Spa & Cắt tỉa",
    description: "Gói chăm sóc kết hợp tắm gội, cắt tỉa và chăm sóc lông toàn diện.",
    priceText: "100.000 - 150.000 VNĐ",
    durationText: "60 phút",
    icon: Sparkles,
    featured: true,
  },
  {
    id: "nail-care",
    title: "Chăm sóc móng",
    description: "Cắt, mài móng an toàn và vệ sinh vùng đệm chân.",
    priceText: "100.000 - 150.000 VNĐ",
    durationText: "30 phút",
    icon: Scissors,
  },
  {
    id: "relaxing-massage",
    title: "Massage thư giãn",
    description: "Massage nhẹ giúp thú cưng thư giãn và giảm căng thẳng.",
    priceText: "100.000 - 150.000 VNĐ",
    durationText: "30 phút",
    icon: Flower2,
  },
]

export const ownerBookedSpaRequests: OwnerSpaRequest[] = [
  {
    id: "spa-req-001",
    bookingCode: "SPA-2024-001",
    serviceName: "Spa & Cắt tỉa",
    petName: "Lucky",
    scheduledAt: "15/11/2023 - 10:30",
    status: "WAITING_ACCEPT",
    totalAmount: "350.000 VNĐ",
    paymentMethodLabel: "Tại trung tâm",
    paymentStatusLabel: "Chưa thanh toán",
    paymentStatusTone: "pending",
    icon: Sparkles,
    specialRequest: "Không dùng sữa tắm có mùi mạnh.",
    canCancel: true,
  },
  {
    id: "spa-req-002",
    bookingCode: "SPA-2024-002",
    serviceName: "Tắm gội cơ bản",
    petName: "Milo",
    scheduledAt: "18/11/2023 - 14:00",
    status: "ACCEPTED",
    totalAmount: "150.000 VNĐ",
    paymentMethodLabel: "Thanh toán online",
    paymentStatusLabel: "Đã thanh toán",
    paymentStatusTone: "paid",
    icon: Droplets,
  },
  {
    id: "spa-req-003",
    bookingCode: "SPA-2024-003",
    serviceName: "Chăm sóc móng",
    petName: "Bé Bông",
    scheduledAt: "20/11/2023 - 09:00",
    status: "IN_PROGRESS",
    totalAmount: "50.000 VNĐ",
    paymentMethodLabel: "Tại trung tâm",
    paymentStatusLabel: "Chưa thanh toán",
    paymentStatusTone: "pending",
    icon: Scissors,
    specialRequest: "Cắt móng cẩn thận, bé hơi sợ tiếng máy.",
  },
  {
    id: "spa-req-004",
    bookingCode: "SPA-2024-004",
    serviceName: "Massage thư giãn",
    petName: "Lucky",
    scheduledAt: "22/11/2023 - 15:30",
    status: "WAITING_COUNTER_PAYMENT",
    totalAmount: "160.000 VNĐ",
    paymentMethodLabel: "Tại trung tâm",
    paymentStatusLabel: "Chưa thanh toán",
    paymentStatusTone: "pending",
    icon: Flower2,
    paymentNotice: "Vui lòng thanh toán tại trung tâm khi sử dụng dịch vụ.",
  },
]

export const ownerSpaHistory: OwnerSpaRequest[] = [
  {
    id: "spa-his-001",
    bookingCode: "SPA-2024-005",
    serviceName: "Chăm sóc móng",
    petName: "Milo",
    scheduledAt: "20/05/2026, 10:00",
    status: "COMPLETED",
    totalAmount: "100.000 VNĐ",
    paymentMethodLabel: "Thanh toán online",
    paymentStatusLabel: "Đã thanh toán",
    paymentStatusTone: "paid",
    icon: Scissors,
  },
  {
    id: "spa-his-002",
    bookingCode: "SPA-2024-006",
    serviceName: "Massage thư giãn",
    petName: "Bông",
    scheduledAt: "18/05/2026, 16:00",
    status: "CANCELLED",
    totalAmount: "120.000 VNĐ",
    paymentMethodLabel: "Tại trung tâm",
    paymentStatusLabel: "Chưa thanh toán",
    paymentStatusTone: "pending",
    icon: Flower2,
  },
]

export const ownerSpaPets: OwnerSpaPet[] = [
  {
    id: "lucky",
    name: "Lucky",
    species: "Chó",
    weightKg: 15,
    avatarUrl: "https://www.figma.com/api/mcp/asset/86b54359-179a-4d71-82a7-00ec4327e07c",
  },
  {
    id: "milo",
    name: "Milo",
    species: "Mèo",
    weightKg: 4,
    avatarUrl: "https://www.figma.com/api/mcp/asset/aec4bf50-4489-4e2f-b5f0-a1ab7f3e34da",
  },
  {
    id: "be-bong",
    name: "Bé Bông",
    species: "Chó",
    weightKg: 6,
    avatarUrl: "https://www.figma.com/api/mcp/asset/b048d334-80e4-4b92-8ef6-68643cb78353",
  },
  {
    id: "mimi",
    name: "Mimi",
    species: "Mèo",
    weightKg: 3,
    fallbackInitial: "M",
  },
  {
    id: "buddy",
    name: "Buddy",
    species: "Chó",
    weightKg: 12,
    fallbackInitial: "B",
  },
]

export const spaBookingServiceOptions: SpaBookingServiceOption[] = [
  { id: "basic-bath", name: "Tắm gội cơ bản", price: 150000 },
  { id: "fur-trimming", name: "Cắt tỉa lông", price: 250000 },
  { id: "spa-combo", name: "Spa & Cắt tỉa", price: 350000, popular: true },
  { id: "nail-care", name: "Chăm sóc móng", price: 50000 },
  { id: "relaxing-massage", name: "Massage thư giãn", price: 160000 },
]

export const spaBookingTimeSlots = buildTimeSlots("08:00", "17:30", 30)

function buildTimeSlots(start: string, end: string, stepMinutes: number) {
  const [startHour, startMinute] = start.split(":").map(Number)
  const [endHour, endMinute] = end.split(":").map(Number)
  const slots: string[] = []
  let current = startHour * 60 + startMinute
  const last = endHour * 60 + endMinute

  while (current <= last) {
    const hour = Math.floor(current / 60)
    const minute = current % 60
    slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    current += stepMinutes
  }

  return slots
}
