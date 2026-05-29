import { ownerAppointmentStatusLabel } from "../../constants/appointment.constants";
import { OwnerAppointmentStatus } from "../../types/appointment.types";
import { cn } from "@/lib/utils";

interface AppointmentStatusBadgeProps {
  status: OwnerAppointmentStatus;
  className?: string;
}

const ownerStatusClassName: Record<OwnerAppointmentStatus, string> = {
  PENDING_PAYMENT: "bg-petcenter-warning-bg text-petcenter-warning-text",
  PENDING: "bg-petcenter-warning-bg text-petcenter-warning-text",
  CONFIRMED: "bg-petcenter-success-bg text-petcenter-primary",
  REJECTED: "bg-petcenter-danger-bg text-petcenter-danger-text",
  CANCELLED: "bg-petcenter-danger-bg text-petcenter-danger-text",
  COMPLETED: "bg-petcenter-success-bg text-petcenter-success-text",
};

export function AppointmentStatusBadge({ className, status }: AppointmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 label-md whitespace-nowrap font-medium",
        ownerStatusClassName[status],
        className
      )}
    >
      {ownerAppointmentStatusLabel[status]}
    </span>
  );
}
