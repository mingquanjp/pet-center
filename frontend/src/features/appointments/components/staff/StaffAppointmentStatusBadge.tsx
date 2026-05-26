import { StaffAppointmentStatus } from "../../types/appointment.types";
import { staffAppointmentStatusLabel } from "../../constants/appointment.constants";

interface Props {
  status: StaffAppointmentStatus;
}

export function StaffAppointmentStatusBadge({ status }: Props) {
  let bgClass = "";
  let textClass = "";

  switch (status) {
    case "PENDING_PAYMENT":
      bgClass = "bg-blue-100";
      textClass = "text-blue-600";
      break;
    case "PENDING":
      bgClass = "bg-orange-100";
      textClass = "text-orange-600";
      break;
    case "CONFIRMED":
      bgClass = "bg-petcenter-success-bg";
      textClass = "text-petcenter-success-text";
      break;
    case "REJECTED":
    case "CANCELLED":
      bgClass = "bg-petcenter-danger-bg";
      textClass = "text-petcenter-danger-text";
      break;
    default:
      bgClass = "bg-gray-100";
      textClass = "text-gray-600";
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgClass} ${textClass}`}>
      {staffAppointmentStatusLabel[status]}
    </span>
  );
}
