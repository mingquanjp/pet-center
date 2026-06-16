import { LayoutDashboard, Calendar, PawPrint, Sparkles, Home, Receipt } from "lucide-react";

export const staffSidebarConfig = [
  {
    title: "Tổng quan",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Khám bệnh",
    href: "/staff/appointments",
    icon: Calendar,
  },
  {
    title: "Thú cưng",
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
];
