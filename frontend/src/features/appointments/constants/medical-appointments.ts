export const medicalAppointmentStatusLabels: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
};

export const medicalAppointmentStatusTone: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  pending: "bg-petcenter-warning-bg text-petcenter-warning-text",
  confirmed: "bg-petcenter-success-bg text-petcenter-success-text",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-petcenter-text-secondary",
};

export const medicalAppointmentExamTypes = [
  { value: "general_checkup", label: "Khám tổng quát" },
  { value: "vaccination", label: "Tiêm phòng" },
  { value: "lab_test", label: "Xét nghiệm" },
  { value: "recheck", label: "Tái khám" },
  { value: "emergency", label: "Cấp cứu" },
];

export const medicalAppointmentStatusOrder = [
  "pending_payment",
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
];

export function getMedicalAppointmentStatusLabel(status: string): string {
  return medicalAppointmentStatusLabels[status] ?? status;
}

export function getMedicalAppointmentStatusTone(status: string): string {
  return medicalAppointmentStatusTone[status] ?? "bg-gray-100 text-petcenter-text-secondary";
}