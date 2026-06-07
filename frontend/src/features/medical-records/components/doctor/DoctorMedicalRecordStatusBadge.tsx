import React from "react";
import { DoctorMedicalRecordExamStatus } from "../../types/medical-record.types";

interface Props {
  status: DoctorMedicalRecordExamStatus;
}

export function DoctorMedicalRecordStatusBadge({ status }: Props) {
  let label = "";
  let className = "";

  switch (status) {
    case "result_recorded":
      label = "Đã ghi nhận kết quả";
      className = "bg-green-100 text-green-700 border-green-200";
      break;
    case "prescribed":
      label = "Đã kê đơn";
      className = "bg-blue-100 text-blue-700 border-blue-200";
      break;
    case "follow_up_required":
      label = "Cần tái khám";
      className = "bg-orange-100 text-orange-700 border-orange-200";
      break;
    default:
      label = status;
      className = "bg-gray-100 text-gray-700 border-gray-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}
