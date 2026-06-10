import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type {
  BoardingAlertLevel,
  BoardingBookingPetDto,
  BoardingBookingPetRow,
  BoardingCareLogDto,
  BoardingInvoiceStatus,
  BoardingPaymentOption,
  BoardingRecordDetailDto,
  BoardingRecordDetailRow,
  BoardingRecordListItemDto,
  BoardingRecordListRow,
  BoardingRecordStatus,
  BoardingRoomTypeAvailabilityRow,
  BoardingRoomTypeBookingDto,
  BoardingUpdateRow
} from "./boarding.types.js";

export const minimumStayDays = 1;

export function getStatusLabel(status: BoardingRecordStatus): string {
  const labels: Record<BoardingRecordStatus, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Chờ check-in",
    staying: "Đang lưu trú",
    checked_out: "Hoàn tất",
    cancelled: "Đã hủy",
    rejected: "Từ chối"
  };

  return labels[status];
}

export function getPaymentMethodLabel(paymentOption: BoardingPaymentOption | null): string {
  if (paymentOption === "online") return "Thanh toán online";
  if (paymentOption === "counter") return "Thanh toán tại quầy";

  return "Chưa cập nhật";
}

export function getPaymentStatus(
  invoiceStatus: BoardingInvoiceStatus | null,
  hasSuccessPayment: boolean
): BoardingRecordListItemDto["payment"]["paymentStatus"] {
  if (invoiceStatus === "paid" || hasSuccessPayment) return "paid";
  if (invoiceStatus === "cancelled") return "cancelled";

  return "unpaid";
}

export function getPaymentStatusLabel(paymentStatus: BoardingRecordListItemDto["payment"]["paymentStatus"]): string {
  const labels: Record<BoardingRecordListItemDto["payment"]["paymentStatus"], string> = {
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    cancelled: "Đã hủy"
  };

  return labels[paymentStatus];
}

export function getHealthStatusLabel(healthStatus: BoardingAlertLevel | "unknown"): string {
  const labels: Record<BoardingAlertLevel | "unknown", string> = {
    normal: "Bình thường",
    attention: "Cần chú ý",
    urgent: "Cần xử lý",
    unknown: "Chưa cập nhật"
  };

  return labels[healthStatus];
}

export function getCareAlertLabel(alertLevel: BoardingCareLogDto["alertLevel"]): string {
  if (alertLevel === "info") return "Thông tin";

  return getHealthStatusLabel(alertLevel);
}

export function normalizeTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  return new Date(String(value)).toISOString();
}

export function requireTimestamp(value: unknown): string {
  const normalized = normalizeTimestamp(value);

  if (!normalized) {
    throw new AppError("Dữ liệu thời gian lưu trú không hợp lệ", "INVALID_BOARDING_TIME", httpStatus.INTERNAL_SERVER_ERROR);
  }

  return normalized;
}

export function optionalTimestamp(value: unknown): string | null {
  return normalizeTimestamp(value);
}

export function getSpeciesLabel(species: BoardingBookingPetRow["species"]): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác"
  } as const;

  return labels[species];
}

export function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`;
}

export function calculateStayDays(plannedCheckInAt: Date, plannedCheckOutAt: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const checkInDate = Date.UTC(
    plannedCheckInAt.getFullYear(),
    plannedCheckInAt.getMonth(),
    plannedCheckInAt.getDate()
  );
  const checkOutDate = Date.UTC(
    plannedCheckOutAt.getFullYear(),
    plannedCheckOutAt.getMonth(),
    plannedCheckOutAt.getDate()
  );

  return Math.max(Math.ceil((checkOutDate - checkInDate) / millisecondsPerDay), minimumStayDays);
}

export function mapBookingPet(row: BoardingBookingPetRow): BoardingBookingPetDto {
  return {
    petId: row.pet_id,
    petName: row.pet_name,
    species: row.species,
    speciesLabel: getSpeciesLabel(row.species),
    weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
    profileImageUrl: row.profile_image_url
  };
}

export function mapRoomType(
  row: BoardingRoomTypeAvailabilityRow,
  plannedCheckInAt?: Date,
  plannedCheckOutAt?: Date
): BoardingRoomTypeBookingDto {
  const unitPrice = Number(row.boarding_unit_price);
  const bookedUnits = Number(row.booked_units);
  const capacity = Number(row.capacity);
  const availableUnits = Math.max(capacity - bookedUnits, 0);
  const nights = plannedCheckInAt && plannedCheckOutAt ? calculateStayDays(plannedCheckInAt, plannedCheckOutAt) : minimumStayDays;
  const estimatedTotal = unitPrice * nights;

  return {
    roomTypeId: row.room_type_id,
    roomTypeName: row.room_type_name,
    description: row.description,
    capacity,
    unitPrice,
    priceText: formatMoney(unitPrice),
    bookedUnits,
    availableUnits,
    available: availableUnits > 0,
    nights,
    estimatedTotal,
    estimatedTotalText: formatMoney(estimatedTotal)
  };
}

export function mapBoardingRecord(row: BoardingRecordListRow): BoardingRecordListItemDto {
  const paymentStatus = getPaymentStatus(row.invoice_status, row.has_success_payment);
  const healthStatus: BoardingAlertLevel | "unknown" = row.alert_level ?? "unknown";
  const activeCare =
    row.boarding_status === "staying"
      ? {
        healthStatus,
        healthStatusLabel: getHealthStatusLabel(healthStatus),
        lastUpdatedAt: normalizeTimestamp(row.last_update_at)
      }
      : undefined;

  return {
    boardingRecordId: row.boarding_record_id,
    boardingCode: row.boarding_record_id,
    pet: {
      petId: row.pet_id,
      petName: row.pet_name,
      profileImageUrl: row.profile_image_url
    },
    room: {
      roomTypeId: row.room_type_id,
      roomTypeName: row.room_type_name
    },
    plannedCheckInAt: requireTimestamp(row.planned_check_in_at),
    plannedCheckOutAt: requireTimestamp(row.planned_check_out_at),
    plannedCheckInDate: row.planned_check_in_date,
    plannedCheckOutDate: row.planned_check_out_date,
    plannedDateRangeText: row.planned_date_range_text,
    stayDays: Number(row.stay_days),
    status: row.boarding_status,
    statusLabel: getStatusLabel(row.boarding_status),
    payment: {
      paymentOption: row.payment_option,
      paymentMethodLabel: getPaymentMethodLabel(row.payment_option),
      paymentStatus,
      paymentStatusLabel: getPaymentStatusLabel(paymentStatus)
    },
    estimatedTotal: Number(row.estimated_total),
    ...(activeCare ? { activeCare } : {})
  };
}

export function getAttachmentType(url: string): BoardingCareLogDto["attachments"][number]["type"] {
  const normalizedUrl = url.toLowerCase();

  if (/\.(mp4|mov|webm|m4v)(\?|$)/.test(normalizedUrl)) return "video";
  if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/.test(normalizedUrl)) return "image";

  return "file";
}

export function normalizeAttachmentUrls(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((url): url is string => typeof url === "string" && url.length > 0);
  if (typeof value === "string") return [value];
  return [];
}

export function mapBoardingUpdateToCareLog(row: BoardingUpdateRow): BoardingCareLogDto {
  return {
    logId: row.boarding_update_id,
    logType: "daily_update",
    title: "Cập nhật hàng ngày",
    occurredAt: requireTimestamp(row.updated_at),
    note: row.update_note,
    alertLevel: row.alert_level,
    alertLabel: getCareAlertLabel(row.alert_level),
    attachments: normalizeAttachmentUrls(row.attachment_url).map((url) => ({
      url,
      type: getAttachmentType(url)
    }))
  };
}

export function createSystemCareLogs(row: BoardingRecordDetailRow): BoardingCareLogDto[] {
  const logs: BoardingCareLogDto[] = [];
  const actualCheckOutAt = optionalTimestamp(row.actual_check_out_at);
  const actualCheckInAt = optionalTimestamp(row.actual_check_in_at);
  const plannedCheckInAt = requireTimestamp(row.planned_check_in_at);

  if (row.boarding_status === "checked_out") {
    logs.push({
      logId: `${row.boarding_record_id}:check_out`,
      logType: "check_out",
      title: "Trả thú cưng thành công",
      occurredAt: actualCheckOutAt ?? requireTimestamp(row.planned_check_out_at),
      note: `${row.pet_name} đã được trao trả cho chủ. Tình trạng lưu trú đã hoàn tất.`,
      alertLevel: "info",
      alertLabel: "Hoàn tất",
      attachments: []
    });
  }

  if (row.boarding_status === "staying" || row.boarding_status === "checked_out") {
    logs.push({
      logId: `${row.boarding_record_id}:check_in`,
      logType: "check_in",
      title: "Nhận phòng",
      occurredAt: actualCheckInAt ?? plannedCheckInAt,
      note: `${row.pet_name} đã được ghi nhận lịch lưu trú tại phòng ${row.room_type_name}.`,
      alertLevel: "info",
      alertLabel: "Bắt đầu",
      attachments: []
    });
  }

  if (row.boarding_status === "pending" || row.boarding_status === "confirmed") {
    logs.push({
      logId: `${row.boarding_record_id}:booking_created`,
      logType: "booking_created",
      title: "Tạo yêu cầu lưu trú",
      occurredAt: plannedCheckInAt,
      note: `${row.pet_name} đã được ghi nhận yêu cầu lưu trú tại phòng ${row.room_type_name}.`,
      alertLevel: "info",
      alertLabel: row.boarding_status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận",
      attachments: []
    });
  }

  return logs;
}

export function mapBoardingRecordDetail(row: BoardingRecordDetailRow, updates: BoardingUpdateRow[]): BoardingRecordDetailDto {
  const paymentStatus = getPaymentStatus(row.invoice_status, row.has_success_payment);
  const careLogs = [...createSystemCareLogs(row), ...updates.map(mapBoardingUpdateToCareLog)].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  );

  return {
    boardingRecordId: row.boarding_record_id,
    boardingCode: row.boarding_record_id,
    status: row.boarding_status,
    statusLabel: getStatusLabel(row.boarding_status),
    pet: {
      petId: row.pet_id,
      petName: row.pet_name,
      speciesLabel: getSpeciesLabel(row.species),
      weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
      profileImageUrl: row.profile_image_url
    },
    room: {
      roomTypeId: row.room_type_id,
      roomTypeName: row.room_type_name,
      description: row.room_description
    },
    stay: {
      plannedCheckInAt: requireTimestamp(row.planned_check_in_at),
      plannedCheckOutAt: requireTimestamp(row.planned_check_out_at),
      actualCheckInAt: optionalTimestamp(row.actual_check_in_at),
      actualCheckOutAt: optionalTimestamp(row.actual_check_out_at),
      stayDays: Number(row.stay_days)
    },
    payment: {
      invoiceId: row.invoice_id,
      paymentOption: row.payment_option,
      paymentMethodLabel: getPaymentMethodLabel(row.payment_option),
      paymentStatus,
      paymentStatusLabel: getPaymentStatusLabel(paymentStatus),
      receiptCode: row.receipt_code,
      receiptUrl: row.receipt_url
    },
    estimatedTotal: Number(row.estimated_total),
    careRequest: row.care_request,
    careLogs
  };
}

export function mapBookingPetOrNull(row: BoardingBookingPetRow | null): BoardingBookingPetDto | null {
  return row ? mapBookingPet(row) : null;
}
