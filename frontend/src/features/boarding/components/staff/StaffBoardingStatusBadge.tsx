import React from "react";
import { StaffBoardingStatus } from "../../types/boarding.types";
import { staffBoardingStatusLabel } from "../../constants/boarding.constants";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Props {
  status: StaffBoardingStatus;
  className?: string;
}

export function StaffBoardingStatusBadge({ status, className = "" }: Props) {
  const label = staffBoardingStatusLabel[status];
  
  const baseClass = "px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit";
  let colorClass = "";
  let icon = null;

  switch (status) {
    case "PENDING_PAYMENT":
      colorClass = "bg-[#FFF3D8] text-[#B45309]"; // vàng nhạt, text cam
      icon = <Clock className="w-3.5 h-3.5" />;
      break;
    case "PENDING":
      colorClass = "bg-[#FFF3D8] text-[#B45309]"; // vàng nhạt, text cam
      icon = <Clock className="w-3.5 h-3.5" />;
      break;
    case "CONFIRMED":
      colorClass = "bg-[#E0F2FE] text-[#0284C7]"; // xanh dương nhạt
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      break;
    case "STAYING":
      colorClass = "bg-[#D1FAE5] text-[#065F46]"; // xanh nhạt
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      break;
    case "CHECKED_OUT":
      colorClass = "bg-[#D1FAE5] text-[#065F46]"; // xanh nhạt
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      break;
    case "REJECTED":
    case "CANCELLED":
      colorClass = "bg-[#FEE2E2] text-[#B91C1C]"; // đỏ nhạt
      icon = <XCircle className="w-3.5 h-3.5" />;
      break;
    default:
      colorClass = "bg-surface-variant text-on-surface-variant";
      icon = <AlertCircle className="w-3.5 h-3.5" />;
      break;
  }

  return (
    <div className={`${baseClass} ${colorClass} ${className}`}>
      {icon}
      {label}
    </div>
  );
}
