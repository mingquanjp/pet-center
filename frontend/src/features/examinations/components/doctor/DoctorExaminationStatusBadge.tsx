import { Circle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { doctorExaminationStatusLabel } from "../../constants/doctor-examinations.constants"
import { DoctorExaminationStatus } from "../../types/examination.types"

interface Props {
  status: DoctorExaminationStatus
}

const statusClasses: Record<DoctorExaminationStatus, string> = {
  WAITING: "bg-petcenter-warning-bg text-petcenter-warning-text",
  EXAMINING: "bg-petcenter-info-bg text-petcenter-info-text",
  COMPLETED: "bg-petcenter-success-bg text-petcenter-success-text",
  FOLLOW_UP: "bg-petcenter-danger-bg text-petcenter-danger-text",
}

export function DoctorExaminationStatusBadge({ status }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn("h-7 border-transparent px-3 font-semibold", statusClasses[status])}
    >
      <Circle className={cn("h-2 w-2 fill-current", status === "EXAMINING" && "animate-pulse")} />
      {doctorExaminationStatusLabel[status]}
    </Badge>
  )
}
