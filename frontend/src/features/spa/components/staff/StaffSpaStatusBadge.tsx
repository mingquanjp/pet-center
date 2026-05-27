import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { staffSpaStatusClassName } from "../../constants/spa.constants"
import type { StaffGroomingTicketStatusTone } from "../../types/spa.types"

type StaffSpaStatusBadgeProps = {
  label: string
  tone: StaffGroomingTicketStatusTone
}

export function StaffSpaStatusBadge({ label, tone }: StaffSpaStatusBadgeProps) {
  const dotClassName = {
    payment: "bg-petcenter-danger-text",
    pending: "bg-petcenter-warning-text",
    accepted: "bg-petcenter-primary",
    completed: "bg-petcenter-success-text",
    cancelled: "bg-petcenter-danger-text",
  }[tone]

  return (
    <Badge
      className={cn(
        "h-[22px] gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-[14px] tracking-[0.22px] shadow-none",
        staffSpaStatusClassName[tone]
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClassName)} />
      {label}
    </Badge>
  )
}
