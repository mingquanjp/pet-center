import { 
  AdminReportTab, 
  ReportTimeRange, 
  ReportCompareMode, 
  ReportGroupBy, 
  ReportPaymentMethodGroup 
} from "../types/report.types";

export const adminReportTabOptions: { value: AdminReportTab; label: string }[] = [
  { value: "REVENUE", label: "Doanh thu" },
  { value: "SERVICES", label: "Dịch vụ" },
  { value: "BOARDING", label: "Lưu trú" },
  { value: "MEDICAL", label: "Khám bệnh" },
  { value: "CUSTOMERS", label: "Người dùng & thú cưng" },
];

export const reportTimeRangeOptions: { value: ReportTimeRange; label: string }[] = [
  { value: "TODAY", label: "Hôm nay" },
  { value: "LAST_7_DAYS", label: "7 ngày qua" },
  { value: "LAST_30_DAYS", label: "30 ngày qua" },
  { value: "THIS_MONTH", label: "Tháng này" },
  { value: "THIS_QUARTER", label: "Quý này" },
  { value: "THIS_YEAR", label: "Năm nay" },
  { value: "CUSTOM", label: "Tùy chọn" },
];

export const reportCompareModeOptions: { value: ReportCompareMode; label: string }[] = [
  { value: "NONE", label: "Không so sánh" },
  { value: "PREVIOUS_PERIOD", label: "Kỳ trước" },
  { value: "SAME_PERIOD_LAST_MONTH", label: "Cùng kỳ tháng trước" },
];

export const reportGroupByOptions: { value: ReportGroupBy; label: string }[] = [
  { value: "DAY", label: "Ngày" },
  { value: "WEEK", label: "Tuần" },
  { value: "MONTH", label: "Tháng" },
];

export const reportPaymentMethodGroupOptions: { value: ReportPaymentMethodGroup; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "ONLINE", label: "Thanh toán online" },
  { value: "COUNTER", label: "Thanh toán tại quầy" },
];

export const revenueSourceLabel: Record<string, string> = {
  medical_exam: "Khám bệnh",
  grooming: "Spa",
  boarding: "Lưu trú",
  prescription: "Đơn thuốc"
};

export const appointmentStatusLabel: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  rejected: "Từ chối",
  cancelled: "Đã hủy"
};

export const groomingStatusLabel: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  pending: "Chờ tiếp nhận",
  waiting: "Chờ xử lý",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy"
};

export const boardingStatusLabel: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  pending: "Chờ xác nhận",
  confirmed: "Chờ check-in",
  staying: "Đang lưu trú",
  checked_out: "Đã trả thú cưng",
  rejected: "Từ chối",
  cancelled: "Đã hủy"
};

export const userRoleLabel: Record<string, string> = {
  Owner: "Khách hàng",
  Staff: "Nhân viên",
  Doctor: "Bác sĩ",
  Admin: "Quản trị viên"
};

export const petSpeciesLabel: Record<string, string> = {
  Dog: "Chó",
  Cat: "Mèo",
  Other: "Khác"
};
