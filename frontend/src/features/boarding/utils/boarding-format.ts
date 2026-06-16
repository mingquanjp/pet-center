import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { StaffBoardingListItem, StaffBoardingDetail, StaffBoardingPaymentMethod, StaffBoardingPaymentStatus, StaffBoardingRoomType } from "../types/boarding.types";
import { staffBoardingPaymentMethodLabel, staffBoardingPaymentStatusLabel, staffBoardingRoomTypeLabel } from "../constants/boarding.constants";

export function formatBoardingDate(dateString: string) {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  } catch {
    return dateString;
  }
}

export function formatBoardingDateTime(dateString: string) {
  try {
    return format(new Date(dateString), "dd/MM/yyyy - HH:mm", { locale: vi });
  } catch {
    return dateString;
  }
}

export function formatBoardingDateRange(start: string, end: string) {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const d1 = format(startDate, "dd/MM", { locale: vi });
    const d2 = format(endDate, "dd/MM", { locale: vi });
    const t1 = format(startDate, "HH:mm", { locale: vi });
    const t2 = format(endDate, "HH:mm", { locale: vi });

    return `${d1} - ${d2}\n${t1} - ${t2}`;
  } catch {
    return `${start} - ${end}`;
  }
}

export function formatBoardingMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function formatBoardingLastUpdate(dateString?: string) {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "dd/MM/yyyy • HH:mm", { locale: vi });
  } catch {
    return dateString;
  }
}

export function getBoardingTotalDays(start: string, end: string) {
  try {
    return differenceInDays(new Date(end), new Date(start));
  } catch {
    return 0;
  }
}

export function getBoardingAmountLabel(record: StaffBoardingListItem | StaffBoardingDetail) {
  if (record.status === "PENDING" || record.status === "PENDING_PAYMENT" || record.status === "CONFIRMED" || record.status === "REJECTED") {
    return `Tạm tính: ${formatBoardingMoney(record.estimatedAmount)}`;
  }
  if (record.status === "STAYING") {
    return `Tổng: ${formatBoardingMoney(record.estimatedAmount)}`;
  }
  if (record.status === "CHECKED_OUT" || record.status === "CANCELLED") {
    return `Tổng tiền: ${formatBoardingMoney(record.finalAmount || record.estimatedAmount)}`;
  }
  return `${formatBoardingMoney(record.estimatedAmount)}`;
}

export function getBoardingPaymentMethodLabel(method: StaffBoardingPaymentMethod) {
  return staffBoardingPaymentMethodLabel[method] || method;
}

export function getBoardingPaymentStatusLabel(status: StaffBoardingPaymentStatus) {
  return staffBoardingPaymentStatusLabel[status] || status;
}

export function getBoardingRoomTypeLabel(roomType: StaffBoardingRoomType) {
  return staffBoardingRoomTypeLabel[roomType] || roomType;
}
