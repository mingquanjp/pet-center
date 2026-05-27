import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
import type {
  BoardingBookingOptionsQuery,
  CreateBoardingRecordPayload,
  ListBoardingRecordsQuery
} from "./boarding.schema.js";
import * as boardingRepository from "./boarding.repository.js";
import type {
  BoardingAlertLevel,
  BoardingBookingPetDto,
  BoardingBookingPetRow,
  BoardingBookingOptionsDto,
  BoardingInvoiceStatus,
  BoardingPaymentOption,
  BoardingRecordCreatedDto,
  BoardingRecordListItemDto,
  BoardingRecordListRow,
  BoardingRecordStatus,
  BoardingRoomTypeAvailabilityRow,
  BoardingRoomTypeBookingDto
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
