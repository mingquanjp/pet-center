import {
  StaffBoardingStatus,
  StaffBoardingTab,
  StaffBoardingRoomFilter,
  StaffBoardingTimeFilter,
  StaffBoardingPaymentStatus,
  StaffBoardingRoomType,
  StaffBoardingPaymentMethod,
  StaffBoardingUpdateAlertLevel,
  StaffBoardingUpdateVisibilityStatus,
} from "../types/boarding.types";

export const staffBoardingStatusLabel: Record<StaffBoardingStatus, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Chờ check-in",
  STAYING: "Đang lưu trú",
  CHECKED_OUT: "Đã trả thú cưng",
  REJECTED: "Đã từ chối",
  CANCELLED: "Đã hủy",
};

export const staffBoardingPaymentStatusLabel: Record<StaffBoardingPaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
};

export const staffBoardingPaymentMethodLabel: Record<StaffBoardingPaymentMethod, string> = {
  AT_COUNTER: "Tại trung tâm",
  ONLINE: "Online",
};

export const staffBoardingRoomTypeLabel: Record<StaffBoardingRoomType, string> = {
  STANDARD: "Tiêu chuẩn",
  VIP: "VIP",
  UNKNOWN: "Chuồng riêng",
};

export const staffBoardingTabOptions: { label: string; value: StaffBoardingTab }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Chờ check-in", value: "CONFIRMED" },
  { label: "Đang lưu trú", value: "STAYING" },
  { label: "Đã trả thú cưng", value: "CHECKED_OUT" },
  { label: "Từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export const staffBoardingUpdateAlertLevelLabel: Record<StaffBoardingUpdateAlertLevel, string> = {
  NORMAL: "Bình thường",
  NEED_ATTENTION: "Cần theo dõi",
  WARNING: "Bất thường",
};

export const staffBoardingUpdateAlertLevelDescription: Record<StaffBoardingUpdateAlertLevel, string> = {
  NORMAL: "Thú cưng ăn uống, vận động và sinh hoạt ổn định.",
  NEED_ATTENTION: "Có dấu hiệu cần theo dõi thêm trong quá trình lưu trú.",
  WARNING: "Có dấu hiệu bất thường cần xử lý hoặc báo bác sĩ.",
};

export const staffBoardingUpdateAlertLevelOptions = [
  {
    value: "NORMAL",
    label: "Bình thường",
    description: "Ăn uống, vận động và sinh hoạt ổn định.",
  },
  {
    value: "NEED_ATTENTION",
    label: "Cần theo dõi",
    description: "Có dấu hiệu cần theo dõi thêm.",
  },
  {
    value: "WARNING",
    label: "Bất thường",
    description: "Có dấu hiệu bất thường cần xử lý.",
  },
] as const;

export const staffBoardingUpdateVisibilityOptions: {
  value: StaffBoardingUpdateVisibilityStatus;
  label: string;
  description: string;
}[] = [
    {
      value: "PUBLISHED",
      label: "Hiển thị",
      description: "Lưu và hiển thị trong nhật ký chăm sóc.",
    },
    {
      value: "DRAFT",
      label: "Nháp",
      description: "Lưu nháp nội bộ, chưa công khai.",
    },
  ];

export const staffBoardingStatusFilterOptions: { label: string; value: StaffBoardingStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ thanh toán", value: "PENDING_PAYMENT" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Chờ check-in", value: "CONFIRMED" },
  { label: "Đang lưu trú", value: "STAYING" },
  { label: "Đã trả thú cưng", value: "CHECKED_OUT" },
  { label: "Từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export const staffBoardingRoomFilterOptions: { label: string; value: StaffBoardingRoomFilter }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Tiêu chuẩn", value: "STANDARD" },
  { label: "VIP", value: "VIP" },
  { label: "Chuồng riêng", value: "UNASSIGNED" },
];

export const staffBoardingTimeFilterOptions: { label: string; value: StaffBoardingTimeFilter }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Hôm nay", value: "TODAY" },
  { label: "Tuần này", value: "THIS_WEEK" },
  { label: "Tháng này", value: "THIS_MONTH" },
];
