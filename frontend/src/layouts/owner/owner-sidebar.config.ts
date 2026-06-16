import { LayoutDashboard, PawPrint, Calendar, Sparkles, Home, Receipt } from "lucide-react";

export const ownerSidebarConfig = [
  {
    title: "Tổng quan",
    href: "/owner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Thú cưng",
    href: "/owner/pets",
    icon: PawPrint,
  },
  {
    title: "Khám bệnh",
    href: "/owner/appointments",
    icon: Calendar,
  },
  {
    title: "Dịch vụ spa",
    href: "/owner/spa",
    icon: Sparkles,
  },
  {
    title: "Lưu trú",
    href: "/owner/boarding",
    icon: Home,
  },
  {
    title: "Hóa đơn",
    href: "/owner/invoices",
    icon: Receipt,
  },
];
