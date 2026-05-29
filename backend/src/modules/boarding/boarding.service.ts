import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
import type {
  BoardingBookingOptionsQuery,
  BoardingRecordParams,
  CreateBoardingRecordPayload,
  ListBoardingRecordsQuery
} from "./boarding.schema.js";
import * as boardingRepository from "./boarding.repository.js";
import type {
  BoardingAlertLevel,
  BoardingBookingPetDto,
  BoardingBookingPetRow,
  BoardingBookingOptionsDto,
  BoardingCareLogDto,
  BoardingInvoiceStatus,
  BoardingPaymentOption,
  BoardingRecordCreatedDto,
  BoardingRecordDetailDto,
  BoardingRecordDetailRow,
  BoardingRecordListItemDto,
  BoardingRecordListRow,
  BoardingRecordStatus,
  BoardingRoomTypeAvailabilityRow,
  BoardingRoomTypeBookingDto,
  BoardingUpdateRow
} from "./boarding.types.js";

const minimumStayDays = 1;

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

function getCareAlertLabel(alertLevel: BoardingCareLogDto["alertLevel"]): string {
  if (alertLevel === "info") return "Thông tin";

  return getHealthStatusLabel(alertLevel);
}

function normalizeTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  return new Date(String(value)).toISOString();
}

function requireTimestamp(value: unknown): string {
  const normalized = normalizeTimestamp(value);

  if (!normalized) {
    throw new AppError("Dữ liệu thời gian lưu trú không hợp lệ", "INVALID_BOARDING_TIME", httpStatus.INTERNAL_SERVER_ERROR);
  }

  return normalized;
}

function optionalTimestamp(value: unknown): string | null {
  return normalizeTimestamp(value);
}

function getSpeciesLabel(species: BoardingBookingPetRow["species"]): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác"
  } as const;

  return labels[species];
}

function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`;
}

function calculateStayDays(plannedCheckInAt: Date, plannedCheckOutAt: Date): number {
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

function assertValidBoardingTime(plannedCheckInAt: Date, plannedCheckOutAt: Date): void {
  if (plannedCheckInAt.getTime() <= Date.now()) {
    throw new AppError("Thời gian nhận phòng phải ở tương lai", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }

  if (plannedCheckOutAt.getTime() <= plannedCheckInAt.getTime()) {
    throw new AppError("Thời gian trả phòng phải sau thời gian nhận phòng", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }
}

function mapBookingPet(row: BoardingBookingPetRow): BoardingBookingPetDto {
  return {
    petId: row.pet_id,
    petName: row.pet_name,
    species: row.species,
    speciesLabel: getSpeciesLabel(row.species),
    weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
    profileImageUrl: row.profile_image_url
  };
}

function mapRoomType(
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

function getAttachmentType(url: string): BoardingCareLogDto["attachments"][number]["type"] {
  const normalizedUrl = url.toLowerCase();

  if (/\.(mp4|mov|webm|m4v)(\?|$)/.test(normalizedUrl)) return "video";
  if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/.test(normalizedUrl)) return "image";

  return "file";
}

function mapBoardingUpdateToCareLog(row: BoardingUpdateRow): BoardingCareLogDto {
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

function createSystemCareLogs(row: BoardingRecordDetailRow): BoardingCareLogDto[] {
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

function mapBoardingRecordDetail(row: BoardingRecordDetailRow, updates: BoardingUpdateRow[]): BoardingRecordDetailDto {
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

export async function getBookingOptions(
  authUser: AuthUser,
  query: BoardingBookingOptionsQuery
): Promise<BoardingBookingOptionsDto> {
  assertOwner(authUser);

  if ((query.plannedCheckInAt && !query.plannedCheckOutAt) || (!query.plannedCheckInAt && query.plannedCheckOutAt)) {
    throw new AppError("Cần chọn cả thời gian nhận phòng và trả phòng", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }

  if (query.plannedCheckInAt && query.plannedCheckOutAt) {
    assertValidBoardingTime(query.plannedCheckInAt, query.plannedCheckOutAt);
  }

  const pets = (await boardingRepository.findOwnerBookingPets(authUser.userId)).map(mapBookingPet);
  const selectedPet = query.petId
    ? mapBookingPetOrNull(await boardingRepository.findOwnerBookingPet(authUser.userId, query.petId))
    : pets[0] ?? null;

  if (query.petId && !selectedPet) {
    throw new AppError("Không tìm thấy thú cưng phù hợp để đặt phòng lưu trú", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const roomTypes = (await boardingRepository.findActiveRoomTypesWithAvailability(
    query.plannedCheckInAt,
    query.plannedCheckOutAt
  )).map((roomType) => mapRoomType(roomType, query.plannedCheckInAt, query.plannedCheckOutAt));

  return {
    pets,
    selectedPet,
    roomTypes
  };
}

function mapBookingPetOrNull(row: BoardingBookingPetRow | null): BoardingBookingPetDto | null {
  return row ? mapBookingPet(row) : null;
}

export async function createBoardingRecord(
  authUser: AuthUser,
  payload: CreateBoardingRecordPayload
): Promise<BoardingRecordCreatedDto> {
  assertOwner(authUser);
  assertValidBoardingTime(payload.plannedCheckInAt, payload.plannedCheckOutAt);

  const petRow = await boardingRepository.findOwnerBookingPet(authUser.userId, payload.petId);

  if (!petRow) {
    throw new AppError("Không tìm thấy thú cưng phù hợp để đặt phòng lưu trú", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const roomTypes = (await boardingRepository.findActiveRoomTypesWithAvailability(
    payload.plannedCheckInAt,
    payload.plannedCheckOutAt
  )).map((roomType) => mapRoomType(roomType, payload.plannedCheckInAt, payload.plannedCheckOutAt));
  const selectedRoomType = roomTypes.find((roomType) => roomType.roomTypeId === payload.roomTypeId);

  if (!selectedRoomType) {
    throw new AppError("Không tìm thấy loại phòng lưu trú phù hợp", "BOARDING_ROOM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (!selectedRoomType.available) {
    throw new AppError("Loại phòng này đã hết chỗ trong khoảng thời gian đã chọn", "BOARDING_ROOM_FULL", httpStatus.CONFLICT);
  }

  try {
    return await boardingRepository.createBoardingRecord({
      ownerUserId: authUser.userId,
      pet: mapBookingPet(petRow),
      roomType: selectedRoomType,
      plannedCheckInAt: payload.plannedCheckInAt,
      plannedCheckOutAt: payload.plannedCheckOutAt,
      stayDays: selectedRoomType.nights,
      careRequest: payload.careRequest,
      paymentOption: payload.paymentOption
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BOARDING_ROOM_FULL") {
      throw new AppError("Loại phòng này đã hết chỗ trong khoảng thời gian đã chọn", "BOARDING_ROOM_FULL", httpStatus.CONFLICT);
    }

    throw error;
  }
}

export async function getOwnerBoardingRecordDetail(
  authUser: AuthUser,
  params: BoardingRecordParams
): Promise<BoardingRecordDetailDto> {
  assertOwner(authUser);

  const record = await boardingRepository.findOwnerBoardingRecordDetail(
    authUser.userId,
    params.boardingRecordId
  );

  if (!record) {
    throw new AppError("Không tìm thấy lịch lưu trú phù hợp", "BOARDING_RECORD_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const updates = await boardingRepository.findPublishedBoardingUpdates(record.boarding_record_id);

  return mapBoardingRecordDetail(record, updates);
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

import type {
  CheckInStaffBoardingPayload,
  CheckOutStaffBoardingPayload,
  ConfirmStaffBoardingPayload,
  ListStaffBoardingRecordsQuery,
  RejectStaffBoardingPayload,
  UpdateStaffBoardingLogPayload
} from "./boarding.schema.js";

import type {
  StaffBoardingCareUpdateDto,
  StaffBoardingDetailDto,
  StaffBoardingDraftUpdateDto,
  StaffBoardingListItemDto,
  StaffBoardingListResponseDto,
  StaffBoardingPaymentStatusDto,
  StaffBoardingTimelineItemDto,
  StaffBoardingTimelineLabelToneDto,
  StaffBoardingUpdateAlertLevelDto,
  StaffBoardingUpdateVisibilityDto
} from "./boarding.types.js";

function assertStaff(authUser: AuthUser): void {
  if (authUser.role !== "STAFF" && authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền thực hiện hành động này", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function mapDbAlertLevelToDto(level: string | null): StaffBoardingUpdateAlertLevelDto {
  if (level === "attention") return "NEED_ATTENTION";
  if (level === "urgent") return "WARNING";
  return "NORMAL";
}

function mapDbVisibilityStatusToDto(status: string | null): StaffBoardingUpdateVisibilityDto {
  if (status === "draft") return "DRAFT";
  return "PUBLISHED";
}

function mapDtoAlertLevelToDb(level: string | undefined): "normal" | "attention" | "urgent" {
  if (level === "NEED_ATTENTION") return "attention";
  if (level === "WARNING") return "urgent";
  return "normal";
}

function mapDtoVisibilityStatusToDb(status: string | undefined): "draft" | "published" {
  if (status === "DRAFT") return "draft";
  return "published";
}

function getRoomTypeName(record: { room_type_name?: string | null }): string {
  return record.room_type_name || "Chưa phân phòng";
}

function mapPaymentStatus(record: any): StaffBoardingPaymentStatusDto {
  return record.invoice_status === "paid" || record.has_success_payment ? "PAID" : "UNPAID";
}

function normalizeAttachmentUrls(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((url): url is string => typeof url === "string" && url.length > 0);
  if (typeof value === "string") return [value];
  return [];
}

function getPayloadAttachmentUrls(payload: { attachmentUrl?: string | null; attachmentUrls?: string[] }): string[] | null {
  if (payload.attachmentUrls) return payload.attachmentUrls;
  return payload.attachmentUrl ? [payload.attachmentUrl] : null;
}

function toApiDate(value: unknown): string {
  return requireTimestamp(value).slice(0, 10);
}

function buildCurrentDayLabel(record: any): string | null {
  if (record.boarding_status === "checked_out") return "Đã hoàn tất";
  if (record.boarding_status !== "staying" || !record.actual_check_in_at) return null;
  const checkedInAt = new Date(record.actual_check_in_at).getTime();
  const day = Math.floor((Date.now() - checkedInAt) / (24 * 60 * 60 * 1000)) + 1;
  return `Ngày thứ ${Math.max(1, day)}`;
}

function buildUpdateTitleFromAlertLevel(level: string | null): string {
  if (level === "attention") return "Cần theo dõi";
  if (level === "urgent") return "Cảnh báo chăm sóc";
  return "Cập nhật hằng ngày";
}

function getCareUpdateLabel(level: string | null): string {
  if (level === "attention") return "Cần theo dõi";
  if (level === "urgent") return "Bất thường";
  return "Bình thường";
}

function getCareUpdateLabelTone(level: string | null): StaffBoardingTimelineLabelToneDto {
  if (level === "attention") return "warning";
  if (level === "urgent") return "danger";
  return "success";
}

function mapDbBoardingStatusToDto(status: string): any {
  return status.toUpperCase();
}

function buildStaffBoardingTimeline(record: any, careUpdates: any[]): StaffBoardingTimelineItemDto[] {
  const timeline: StaffBoardingTimelineItemDto[] = [];
  
  let fallbackStaff = record.handled_by_staff_id ? { id: record.handled_by_staff_id, fullName: record.handled_by_staff_name || "Nhân viên" } : null;
  let confirmedBy = fallbackStaff;
  let checkedInBy = fallbackStaff;
  let checkedOutBy = fallbackStaff;
  let rejectedBy = fallbackStaff;

  const actualCareUpdates = [];
  for (const update of careUpdates) {
    if (update.update_note?.startsWith("[SYSTEM_CONFIRM]")) {
      confirmedBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else if (update.update_note?.startsWith("[SYSTEM_CHECKIN]")) {
      checkedInBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else if (update.update_note?.startsWith("[SYSTEM_CHECKOUT]")) {
      checkedOutBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else if (update.update_note?.startsWith("[SYSTEM_REJECT]")) {
      rejectedBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else {
      actualCareUpdates.push(update);
    }
  }

  if (record.boarding_status === "rejected") {
    timeline.push({
      id: `${record.boarding_record_id}_rejected`,
      type: "REJECTED",
      title: "Từ chối lưu trú",
      label: "Đã từ chối",
      labelTone: "danger",
      description: record.rejection_reason ? `Lý do từ chối: ${record.rejection_reason}` : "Nhân viên đã từ chối yêu cầu lưu trú này.",
      createdAt: normalizeTimestamp(record.updated_at) || new Date().toISOString(),
      createdBy: rejectedBy,
      source: "SYSTEM"
    });
  }

  if (record.boarding_status === "checked_out") {
    timeline.push({
      id: `${record.boarding_record_id}_checked_out`,
      type: "CHECKED_OUT",
      title: "Trả thú cưng",
      label: "Đã trả thú cưng",
      labelTone: "success",
      description: "Thú cưng đã được trả cho chủ nuôi.",
      createdAt: normalizeTimestamp(record.actual_check_out_at) || new Date().toISOString(),
      createdBy: checkedOutBy,
      source: "SYSTEM"
    });
  }

  if (record.boarding_status === "staying" || record.boarding_status === "checked_out") {
    for (const update of actualCareUpdates) {
      timeline.push({
        id: update.boarding_update_id,
        type: "CARE_UPDATE",
        title: buildUpdateTitleFromAlertLevel(update.alert_level),
        label: getCareUpdateLabel(update.alert_level),
        labelTone: getCareUpdateLabelTone(update.alert_level),
        description: update.update_note,
        createdAt: normalizeTimestamp(update.updated_at) || new Date().toISOString(),
        createdBy: update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null,
        source: "BOARDING_UPDATE",
        alertLevel: mapDbAlertLevelToDto(update.alert_level),
        attachmentUrls: normalizeAttachmentUrls(update.attachment_url)
      });
    }

    timeline.push({
      id: `${record.boarding_record_id}_check_in`,
      type: "CHECKED_IN",
      title: "Nhận thú cưng",
      label: record.boarding_status === "checked_out" ? "Đã hoàn tất lưu trú" : "Đang lưu trú",
      labelTone: "success",
      description: "Thú cưng đã được nhận tại trung tâm và bắt đầu thời gian lưu trú.",
      createdAt: normalizeTimestamp(record.actual_check_in_at) || normalizeTimestamp(record.planned_check_in_at) || new Date().toISOString(),
      createdBy: checkedInBy,
      source: "SYSTEM"
    });
  }

  if (record.boarding_status === "confirmed" || record.boarding_status === "staying" || record.boarding_status === "checked_out") {
    timeline.push({
      id: `${record.boarding_record_id}_confirmed`,
      type: "CONFIRMED",
      title: "Xác nhận lưu trú",
      label: record.boarding_status === "confirmed" ? "Chờ check-in" : "Đã check-in",
      labelTone: record.boarding_status === "confirmed" ? "info" : "success",
      description: "Nhân viên đã xác nhận yêu cầu lưu trú.",
      createdAt: normalizeTimestamp(record.created_at) || new Date().toISOString(),
      createdBy: confirmedBy,
      source: "SYSTEM"
    });
  }

  timeline.push({
    id: `${record.boarding_record_id}_created`,
    type: "CREATED",
    title: "Yêu cầu lưu trú được tạo",
    label: record.boarding_status === "pending" ? "Chờ xác nhận" : "Đã xác nhận",
    labelTone: record.boarding_status === "pending" ? "warning" : "success",
    description: "Chủ nuôi đã gửi yêu cầu lưu trú.",
    createdAt: normalizeTimestamp(record.created_at) || new Date().toISOString(),
    source: "SYSTEM"
  });

  return timeline;
}

function mapStaffBoardingListItem(record: any): StaffBoardingListItemDto {
  const roomTypeName = getRoomTypeName(record);

  return {
    id: record.boarding_record_id,
    boardingCode: record.boarding_record_id,
    pet: {
      id: record.pet_id,
      name: record.pet_name,
      species: record.species,
      breed: record.breed,
      ageText: record.age_text,
      imageUrl: record.profile_image_url
    },
    owner: {
      id: record.owner_id,
      fullName: record.owner_name,
      phoneNumber: record.owner_phone,
      email: record.owner_email
    },
    room: {
      id: record.room_type_id || "unknown",
      code: roomTypeName,
      name: roomTypeName,
      roomType: roomTypeName
    },
    requestedRoomType: roomTypeName,
    checkInDate: toApiDate(record.planned_check_in_at),
    checkOutDate: toApiDate(record.planned_check_out_at),
    totalDays: calculateStayDays(new Date(record.planned_check_in_at), new Date(record.planned_check_out_at)),
    status: mapDbBoardingStatusToDto(record.boarding_status),
    paymentStatus: mapPaymentStatus(record),
    estimatedAmount: Number(record.estimated_total),
    finalAmount: record.boarding_status === "checked_out" ? Number(record.final_amount ?? record.estimated_total) : null,
    currency: "VND",
    specialRequest: record.care_request ?? null,
    latestUpdateAt: normalizeTimestamp(record.latest_update_at)
  };
}

function mapStaffBoardingDetail(record: any, careUpdates: any[]): StaffBoardingDetailDto {
  const roomTypeName = getRoomTypeName(record);
  const mappedCareUpdates: StaffBoardingCareUpdateDto[] = careUpdates.map((update) => ({
    id: update.boarding_update_id,
    title: buildUpdateTitleFromAlertLevel(update.alert_level),
    description: update.update_note,
    alertLevel: mapDbAlertLevelToDto(update.alert_level),
    visibilityStatus: mapDbVisibilityStatusToDto(update.visibility_status),
    attachmentUrl: normalizeAttachmentUrls(update.attachment_url)[0] ?? null,
    attachmentUrls: normalizeAttachmentUrls(update.attachment_url),
    updatedAt: normalizeTimestamp(update.updated_at) || new Date().toISOString(),
    createdBy: update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null
  }));
  const paymentStatus = mapPaymentStatus(record);

  return {
    id: record.boarding_record_id,
    boardingCode: record.boarding_record_id,
    pet: {
      id: record.pet_id,
      name: record.pet_name,
      species: record.species,
      breed: record.breed,
      ageText: record.age_text,
      imageUrl: record.profile_image_url
    },
    owner: {
      id: record.owner_id,
      fullName: record.owner_name,
      phoneNumber: record.owner_phone,
      email: record.owner_email
    },
    room: {
      id: record.room_type_id || "unknown",
      code: roomTypeName,
      name: roomTypeName,
      roomType: roomTypeName
    },
    requestedRoomType: roomTypeName,
    checkInDate: toApiDate(record.planned_check_in_at),
    checkOutDate: toApiDate(record.planned_check_out_at),
    actualCheckInAt: normalizeTimestamp(record.actual_check_in_at),
    actualCheckOutAt: normalizeTimestamp(record.actual_check_out_at),
    currentDayLabel: buildCurrentDayLabel(record),
    totalDays: calculateStayDays(new Date(record.planned_check_in_at), new Date(record.planned_check_out_at)),
    status: mapDbBoardingStatusToDto(record.boarding_status),
    paymentStatus,
    estimatedAmount: Number(record.estimated_total),
    finalAmount: record.boarding_status === "checked_out" ? Number(record.final_amount ?? record.estimated_total) : null,
    currency: "VND",
    specialRequests: record.care_request ? [record.care_request] : [],
    note: null,
    rejectionReason: record.rejection_reason,
    payment: {
      paymentMethod: record.payment_option === "online" ? "ONLINE" : "AT_COUNTER",
      paymentStatus,
      amount: Number(record.final_amount ?? record.estimated_total),
      currency: "VND"
    },
    careUpdates: mappedCareUpdates,
    careLogs: mappedCareUpdates,
    timeline: buildStaffBoardingTimeline(record, careUpdates)
  };
}

export async function listStaffBoardingRecords(authUser: AuthUser, query: ListStaffBoardingRecordsQuery): Promise<StaffBoardingListResponseDto> {
  assertStaff(authUser);
  const paginationInput = normalizePagination(query.page, query.limit);
  const filters = {
    search: query.search,
    status: query.status === "ALL" ? undefined : query.status,
    tab: query.tab === "ALL" ? undefined : query.tab,
    roomType: query.roomType === "ALL" ? undefined : query.roomType,
    timeRange: query.timeRange,
    limit: paginationInput.limit,
    offset: paginationInput.offset
  };

  const [records, total, statsData] = await Promise.all([
    boardingRepository.findStaffBoardingList(filters),
    boardingRepository.countStaffBoardingList(filters),
    boardingRepository.countStaffBoardingStats({
      search: query.search,
      roomType: query.roomType === "ALL" ? undefined : query.roomType,
      timeRange: query.timeRange
    })
  ]);

  return {
    data: records.map(mapStaffBoardingListItem),
    stats: {
      allCount: Number(statsData?.allCount ?? 0),
      pendingCount: Number(statsData?.pendingCount ?? 0),
      confirmedCount: Number(statsData?.confirmedCount ?? 0),
      stayingCount: Number(statsData?.stayingCount ?? 0),
      checkedOutCount: Number(statsData?.checkedOutCount ?? 0),
      rejectedCount: Number(statsData?.rejectedCount ?? 0),
      cancelledCount: Number(statsData?.cancelledCount ?? 0)
    },
    pagination: createPagination(paginationInput.page, paginationInput.limit, total)
  };
}

export async function getStaffBoardingDetail(authUser: AuthUser, boardingId: string): Promise<StaffBoardingDetailDto> {
  assertStaff(authUser);
  const record = await boardingRepository.findStaffBoardingDetailById(boardingId);
  if (!record) throw new AppError("Không tìm thấy phiếu lưu trú", "BOARDING_NOT_FOUND", httpStatus.NOT_FOUND);
  const careUpdates = await boardingRepository.findBoardingUpdatesByBoardingRecordId(boardingId, { visibilityStatus: "published" });
  return mapStaffBoardingDetail(record, careUpdates);
}

export async function getStaffBoardingDraftUpdate(authUser: AuthUser, boardingId: string): Promise<StaffBoardingDraftUpdateDto | null> {
  assertStaff(authUser);
  const record = await boardingRepository.findStaffBoardingDetailById(boardingId);
  if (!record) throw new AppError("Không tìm thấy phiếu lưu trú", "BOARDING_NOT_FOUND", httpStatus.NOT_FOUND);
  if (record.boarding_status !== "staying") return null;

  const draft = await boardingRepository.findLatestDraftUpdateByBoardingIdAndUserId(boardingId, authUser.userId);
  if (!draft) return null;

  return {
    id: draft.boarding_update_id,
    boardingId: draft.boarding_record_id,
    description: draft.update_note,
    alertLevel: mapDbAlertLevelToDto(draft.alert_level),
    visibilityStatus: "DRAFT",
    attachmentUrl: normalizeAttachmentUrls(draft.attachment_url)[0] ?? null,
    attachmentUrls: normalizeAttachmentUrls(draft.attachment_url),
    updatedAt: normalizeTimestamp(draft.updated_at) || new Date().toISOString()
  };
}

export async function updateStaffBoardingLog(authUser: AuthUser, boardingId: string, payload: UpdateStaffBoardingLogPayload): Promise<StaffBoardingDetailDto> {
  assertStaff(authUser);
  const record = await boardingRepository.findStaffBoardingDetailById(boardingId);
  if (!record) throw new AppError("Không tìm thấy phiếu lưu trú", "BOARDING_NOT_FOUND", httpStatus.NOT_FOUND);
  if (record.boarding_status !== "staying") throw new AppError("Trạng thái phiếu lưu trú không hợp lệ", "INVALID_BOARDING_STATUS", httpStatus.BAD_REQUEST);

  const visibilityStatus = mapDtoVisibilityStatusToDb(payload.visibilityStatus);
  const existingDraft = await boardingRepository.findLatestDraftUpdateByBoardingIdAndUserId(boardingId, authUser.userId);

  if (existingDraft) {
    await boardingRepository.updateBoardingUpdate({
      boardingUpdateId: existingDraft.boarding_update_id,
      description: payload.description,
      alertLevel: mapDtoAlertLevelToDb(payload.alertLevel),
      visibilityStatus,
      attachmentUrls: getPayloadAttachmentUrls(payload)
    });
  } else if (visibilityStatus === "published") {
    await boardingRepository.insertBoardingUpdateIfNotDuplicate({
      boardingRecordId: boardingId,
      createdByUserId: authUser.userId,
      description: payload.description,
      alertLevel: mapDtoAlertLevelToDb(payload.alertLevel),
      visibilityStatus,
      attachmentUrls: getPayloadAttachmentUrls(payload)
    });
  } else {
    await boardingRepository.insertBoardingUpdate({
      boardingRecordId: boardingId,
      createdByUserId: authUser.userId,
      description: payload.description,
      alertLevel: mapDtoAlertLevelToDb(payload.alertLevel),
      visibilityStatus,
      attachmentUrls: getPayloadAttachmentUrls(payload)
    });
  }

  return getStaffBoardingDetail(authUser, boardingId);
}

export async function deleteStaffBoardingDraftUpdate(authUser: AuthUser, boardingId: string): Promise<void> {
  assertStaff(authUser);
  await boardingRepository.deleteDraftBoardingUpdate(boardingId, authUser.userId);
}

export async function confirmStaffBoarding(authUser: AuthUser, boardingId: string, _payload: ConfirmStaffBoardingPayload): Promise<StaffBoardingDetailDto> {
  assertStaff(authUser);
  const record = await boardingRepository.findStaffBoardingDetailById(boardingId);
  if (!record) throw new AppError("Không tìm thấy phiếu lưu trú", "BOARDING_NOT_FOUND", httpStatus.NOT_FOUND);
  if (record.boarding_status !== "pending") throw new AppError("Trạng thái phiếu lưu trú không hợp lệ", "INVALID_BOARDING_STATUS", httpStatus.BAD_REQUEST);
  await boardingRepository.updateBoardingToConfirmed({ boardingRecordId: boardingId, handledByStaffId: authUser.userId });
  await boardingRepository.insertBoardingUpdate({
    boardingRecordId: boardingId,
    createdByUserId: authUser.userId,
    description: "[SYSTEM_CONFIRM] Nhân viên đã xác nhận yêu cầu lưu trú.",
    alertLevel: "normal",
    visibilityStatus: "published",
    attachmentUrls: null
  });
  return getStaffBoardingDetail(authUser, boardingId);
}

export async function rejectStaffBoarding(authUser: AuthUser, boardingId: string, payload: RejectStaffBoardingPayload): Promise<StaffBoardingDetailDto> {
  assertStaff(authUser);
  const record = await boardingRepository.findStaffBoardingDetailById(boardingId);
  if (!record) throw new AppError("Không tìm thấy phiếu lưu trú", "BOARDING_NOT_FOUND", httpStatus.NOT_FOUND);
  if (record.boarding_status !== "pending") throw new AppError("Trạng thái phiếu lưu trú không hợp lệ", "INVALID_BOARDING_STATUS", httpStatus.BAD_REQUEST);
  await boardingRepository.updateBoardingToRejected({ boardingRecordId: boardingId, rejectionReason: payload.rejectionReason, handledByStaffId: authUser.userId });
  await boardingRepository.insertBoardingUpdate({
    boardingRecordId: boardingId,
    createdByUserId: authUser.userId,
    description: "[SYSTEM_REJECT] Nhân viên đã từ chối yêu cầu lưu trú này.",
    alertLevel: "normal",
    visibilityStatus: "published",
    attachmentUrls: null
  });
  return getStaffBoardingDetail(authUser, boardingId);
}

export async function checkInStaffBoarding(authUser: AuthUser, boardingId: string, payload: CheckInStaffBoardingPayload): Promise<StaffBoardingDetailDto> {
  assertStaff(authUser);
  const record = await boardingRepository.findStaffBoardingDetailById(boardingId);
  if (!record) throw new AppError("Không tìm thấy phiếu lưu trú", "BOARDING_NOT_FOUND", httpStatus.NOT_FOUND);
  if (record.boarding_status !== "confirmed") throw new AppError("Trạng thái phiếu lưu trú không hợp lệ", "INVALID_BOARDING_STATUS", httpStatus.BAD_REQUEST);
  await boardingRepository.updateBoardingToStaying({ boardingRecordId: boardingId, handledByStaffId: authUser.userId });
  
  await boardingRepository.insertBoardingUpdate({
    boardingRecordId: boardingId,
    createdByUserId: authUser.userId,
    description: "[SYSTEM_CHECKIN] Thú cưng đã được nhận tại trung tâm và bắt đầu thời gian lưu trú.",
    alertLevel: "normal",
    visibilityStatus: "published",
    attachmentUrls: null
  });
  
  if (payload.internalNote) {
    await boardingRepository.insertBoardingUpdate({
      boardingRecordId: boardingId,
      createdByUserId: authUser.userId,
      description: payload.internalNote,
      alertLevel: "normal",
      visibilityStatus: "published",
      attachmentUrls: null
    });
  }
  return getStaffBoardingDetail(authUser, boardingId);
}

export async function checkOutStaffBoarding(authUser: AuthUser, boardingId: string, payload: CheckOutStaffBoardingPayload): Promise<StaffBoardingDetailDto> {
  assertStaff(authUser);
  const record = await boardingRepository.findStaffBoardingDetailById(boardingId);
  if (!record) throw new AppError("Không tìm thấy phiếu lưu trú", "BOARDING_NOT_FOUND", httpStatus.NOT_FOUND);
  if (record.boarding_status === "checked_out") throw new AppError("Phiếu lưu trú đã được check-out.", "BOARDING_ALREADY_CHECKED_OUT", httpStatus.BAD_REQUEST);
  if (record.boarding_status !== "staying") throw new AppError("Trạng thái phiếu lưu trú không hợp lệ", "INVALID_BOARDING_STATUS", httpStatus.BAD_REQUEST);
  await boardingRepository.updateBoardingToCheckedOut({ boardingRecordId: boardingId, handledByStaffId: authUser.userId });
  
  await boardingRepository.insertBoardingUpdate({
    boardingRecordId: boardingId,
    createdByUserId: authUser.userId,
    description: "[SYSTEM_CHECKOUT] Thú cưng đã được trả cho chủ nuôi.",
    alertLevel: "normal",
    visibilityStatus: "published",
    attachmentUrls: null
  });

  if (payload.internalNote) {
    await boardingRepository.insertBoardingUpdate({
      boardingRecordId: boardingId,
      createdByUserId: authUser.userId,
      description: payload.internalNote,
      alertLevel: "normal",
      visibilityStatus: "published",
      attachmentUrls: null
    });
  }
  return getStaffBoardingDetail(authUser, boardingId);
}

export async function getRoomTypes() {
  const roomTypes = await boardingRepository.findActiveRoomTypesWithAvailability();
  return roomTypes.map((roomType) => ({
    id: roomType.room_type_id,
    name: roomType.room_type_name
  }));
}
