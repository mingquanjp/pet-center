import {
  CalendarDays,
  FileText,
  Home,
  LayoutDashboard,
  PawPrint,
  Receipt,
  Sparkles,
} from "lucide-react";

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
    icon: Home,
  },
  {
    title: "Hóa đơn",
    href: "/staff/invoices",
    icon: Receipt,
  },
] as const;

export const staffSupportAction = {
  title: "Hỗ trợ kỹ thuật",
  href: "/staff/support",
  icon: FileText,
} as const;
