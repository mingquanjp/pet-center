import {
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  PawPrint,
  ReceiptText,
  Sparkles,
} from "lucide-react"

export const staffSidebarConfig = [
  {
    title: "Tổng quan",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Lịch hẹn",
    href: "/staff/appointments",
    icon: CalendarDays,
  },
  {
    title: "Hồ sơ thú cưng",
    href: "/staff/pets",
    icon: PawPrint,
  },
  {
    title: "Dịch vụ spa",
    href: "/staff/spa",
    icon: Sparkles,
  },
  {
    title: "Lưu trú",
    href: "/staff/boarding",
    icon: BedDouble,
  },
  {
    title: "Hóa đơn",
    href: "/staff/invoices",
    icon: ReceiptText,
  },
]
