import {
  CalendarClock,
  ClipboardList,
  ClipboardPlus,
  FolderHeart,
  LayoutDashboard,
} from "lucide-react"

export const doctorSidebarConfig = [
  {
    title: "T\u1ed5ng quan",
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Phi\u1ebfu kh\u00e1m",
    href: "/doctor/examinations",
    icon: ClipboardPlus,
  },
  {
    title: "B\u1ec7nh \u00e1n",
    href: "/doctor/medical-records",
    icon: FolderHeart,
  },
  {
    title: "\u0110\u01a1n thu\u1ed1c",
    href: "/doctor/prescriptions",
    icon: ClipboardList,
  },
  {
    title: "T\u00e1i kh\u00e1m",
    href: "/doctor/follow-ups",
    icon: CalendarClock,
  },
]
