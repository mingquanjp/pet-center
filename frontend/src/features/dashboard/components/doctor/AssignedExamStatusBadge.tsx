import { Clock3, Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";

import type { DoctorExamStatus } from "../../types/doctor-dashboard.types";

interface AssignedExamStatusBadgeProps {
  status: DoctorExamStatus;
}

const statusConfig: Record<
  DoctorExamStatus,
  {
    className: string;
    icon: typeof Clock3;
    label: string;
  }
> = {
  WAITING: {
    label: "Chờ khám",
    icon: Clock3,
    className: "bg-petcenter-warning-bg text-petcenter-warning-text",
  },
  EXAMINING: {
    label: "Đang khám",
    icon: Stethoscope,
    className: "bg-petcenter-info-bg text-petcenter-info-text",
  },
};

export function AssignedExamStatusBadge({ status }: AssignedExamStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-4 pb-2 pt-[7px] text-[13px] font-semibold leading-[13px]",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
