import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
import type { ListBoardingRecordsQuery } from "./boarding.schema.js";
import * as boardingRepository from "./boarding.repository.js";
import type {
  BoardingAlertLevel,
  BoardingInvoiceStatus,
  BoardingPaymentOption,
  BoardingRecordListItemDto,
  BoardingRecordListRow,
  BoardingRecordStatus
} from "./boarding.types.js";

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền xem danh sách lưu trú của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function getStatusLabel(status: BoardingRecordStatus): string {
  const labels: Record<BoardingRecordStatus, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Chờ check-in",
    staying: "Đang lưu trú",
    checked_out: "Hoàn tất"
  };

  return labels[status];
}

function getPaymentMethodLabel(paymentOption: BoardingPaymentOption | null): string {
  if (paymentOption === "online") return "Thanh toán online";
  if (paymentOption === "counter") return "Thanh toán tại quầy";

  return "Chưa cập nhật";
}

function getPaymentStatus(
  invoiceStatus: BoardingInvoiceStatus | null,
  hasSuccessPayment: boolean
): BoardingRecordListItemDto["payment"]["paymentStatus"] {
  if (invoiceStatus === "paid" || hasSuccessPayment) return "paid";
  if (invoiceStatus === "refunded") return "refunded";
  if (invoiceStatus === "cancelled") return "cancelled";

  return "unpaid";
}

function getPaymentStatusLabel(paymentStatus: BoardingRecordListItemDto["payment"]["paymentStatus"]): string {
  const labels: Record<BoardingRecordListItemDto["payment"]["paymentStatus"], string> = {
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    refunded: "Đã hoàn tiền",
    cancelled: "Đã hủy"
  };

  return labels[paymentStatus];
}

function getHealthStatusLabel(healthStatus: BoardingAlertLevel | "unknown"): string {
  const labels: Record<BoardingAlertLevel | "unknown", string> = {
    normal: "Bình thường",
    attention: "Cần chú ý",
    urgent: "Cần xử lý",
    unknown: "Chưa cập nhật"
  };

  return labels[healthStatus];
}

function normalizeTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  return new Date(String(value)).toISOString();
}

function mapBoardingRecord(row: BoardingRecordListRow): BoardingRecordListItemDto {
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

export async function listOwnerBoardingRecords(authUser: AuthUser, query: ListBoardingRecordsQuery) {
  assertOwner(authUser);

  const paginationInput = normalizePagination(query.page, query.limit);
  const filters = {
    ownerUserId: authUser.userId,
    search: query.search,
    status: query.status,
    roomTypeId: query.roomTypeId,
    timeRange: query.timeRange,
    limit: paginationInput.limit,
    offset: paginationInput.offset
  };
  const [records, total] = await Promise.all([
    boardingRepository.findOwnerBoardingRecords(filters),
    boardingRepository.countOwnerBoardingRecords(filters)
  ]);

  return {
    records: records.map(mapBoardingRecord),
    pagination: createPagination(paginationInput.page, paginationInput.limit, total)
  };
}
