import {
  BarChart3,
  BedDouble,
  LayoutDashboard,
  Pill,
  Tags,
  Users,
} from "lucide-react"

export const adminSidebarConfig = [
  {
    title: "T\u1ed5ng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ng\u01b0\u1eddi d\u00f9ng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Danh m\u1ee5c d\u1ecbch v\u1ee5",
    href: "/admin/service-categories",
    icon: Tags,
  },
  {
    title: "Danh m\u1ee5c thu\u1ed1c",
    href: "/admin/medicines",
    icon: Pill,
  },
  {
    title: "Ph\u00f2ng l\u01b0u tr\u00fa",
    href: "/admin/boarding-rooms",
    icon: BedDouble,
  },
  {
    title: "B\u00e1o c\u00e1o & th\u1ed1ng k\u00ea",
    href: "/admin/reports",
    icon: BarChart3,
  },
]
