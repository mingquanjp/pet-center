import {
  InvoicePaymentOption,
  InvoicePaymentStatus,
  InvoiceServiceType,
  OwnerInvoiceServiceFilter,
  OwnerInvoiceStatusFilter,
} from "../types/invoice.types";

export const invoicePaymentStatusLabel: Record<InvoicePaymentStatus, string> = {
  PAID: "Đã thanh toán",
  PENDING_PAYMENT: "Chờ thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
  DRAFT: "Nháp",
};

export const invoiceServiceTypeLabel: Record<InvoiceServiceType, string> = {
  MEDICAL: "Khám bệnh",
  GROOMING: "Spa",
  BOARDING: "Lưu trú",
  PRESCRIPTION: "Đơn thuốc",
  OTHER: "Khác",
};

export const invoicePaymentOptionLabel: Record<InvoicePaymentOption, string> = {
  ONLINE: "Online",
  AT_COUNTER: "Tại quầy",
};

export const staffInvoiceStatusFilterOptions = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ thanh toán", value: "PENDING_PAYMENT" },
  { label: "Đã thanh toán", value: "PAID" },
  { label: "Quá hạn", value: "OVERDUE" },
] as const;

export const staffInvoiceServiceFilterOptions = [
  { label: "Tất cả", value: "ALL" },
  { label: "Khám bệnh", value: "MEDICAL" },
  { label: "Spa", value: "GROOMING" },
  { label: "Lưu trú", value: "BOARDING" },
  { label: "Đơn thuốc", value: "PRESCRIPTION" },
] as const;

export const staffInvoiceTimeFilterOptions = [
  { label: "Hôm nay", value: "TODAY" },
  { label: "Tuần này", value: "THIS_WEEK" },
  { label: "Tháng này", value: "THIS_MONTH" },
  { label: "Tất cả", value: "ALL" },
] as const;

export const ownerInvoiceStatusFilterOptions: ReadonlyArray<{
  label: string;
  value: OwnerInvoiceStatusFilter;
}> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chưa thanh toán", value: "PENDING_PAYMENT" },
  { label: "Đã thanh toán", value: "PAID" },
  { label: "Quá hạn", value: "OVERDUE" },
];

export const ownerInvoiceServiceFilterOptions: ReadonlyArray<{
  label: string;
  value: OwnerInvoiceServiceFilter;
}> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Khám bệnh", value: "MEDICAL" },
  { label: "Spa", value: "GROOMING" },
  { label: "Lưu trú", value: "BOARDING" },
  { label: "Đơn thuốc", value: "PRESCRIPTION" },
];
