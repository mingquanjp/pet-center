import { 
  StaffAppointmentStatus, 
  StaffAppointmentServiceType, 
  StaffAppointmentTab, 
  StaffAppointmentStatusFilter, 
  StaffAppointmentServiceFilter 
} from "../types/appointment.types";

export const staffAppointmentStatusLabel: Record<StaffAppointmentStatus, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy"
};

export const staffAppointmentServiceTypeLabel: Record<StaffAppointmentServiceType, string> = {
  GENERAL_CHECKUP: "Khám tổng quát",
  VACCINATION: "Tiêm phòng",
  LAB_TEST: "Xét nghiệm",
  RECHECK: "Tái khám"
};

export const staffAppointmentTabOptions: Array<{ value: StaffAppointmentTab, label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" }
];

export const staffAppointmentStatusFilterOptions: Array<{ value: StaffAppointmentStatusFilter, label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" }
];

export const staffAppointmentServiceFilterOptions: Array<{ value: StaffAppointmentServiceFilter, label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "GENERAL_CHECKUP", label: "Khám tổng quát" },
  { value: "VACCINATION", label: "Tiêm phòng" },
  { value: "LAB_TEST", label: "Xét nghiệm" },
  { value: "RECHECK", label: "Tái khám" }
];
