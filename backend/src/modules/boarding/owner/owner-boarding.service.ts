import { AppError } from "../../../shared/errors/app-error.js";
import { httpStatus } from "../../../shared/errors/http-status.js";
import type { AuthUser } from "../../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../../shared/utils/pagination.js";
import { boardingNotificationPublisher } from "../boarding-notification.publisher.js";
import { upsertPetActivityLog } from "../../pet-activity-logs/pet-activity-logs.repository.js";
import * as ownerBoardingRepository from "./owner-boarding.repository.js";
import * as boardingRoomRepository from "../boarding-room.repository.js";
import * as boardingUpdateRepository from "../boarding-update.repository.js";
import {
  mapBookingPet,
  mapBookingPetOrNull,
  mapRoomType,
  mapBoardingRecordDetail,
  mapBoardingRecord
} from "../boarding.mapper.js";
import type {
  BoardingBookingOptionsQuery,
  BoardingRecordParams,
  CreateBoardingRecordPayload,
  ListBoardingRecordsQuery
} from "../boarding.schema.js";
import type {
  BoardingBookingOptionsDto,
  BoardingRecordCreatedDto,
  BoardingRecordDetailDto
} from "../boarding.types.js";

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền xem danh sách lưu trú của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function assertValidBoardingTime(plannedCheckInAt: Date, plannedCheckOutAt: Date): void {
  if (plannedCheckInAt.getTime() <= Date.now()) {
    throw new AppError("Thời gian nhận phòng phải ở tương lai", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }

  if (plannedCheckOutAt.getTime() <= plannedCheckInAt.getTime()) {
    throw new AppError("Thời gian trả phòng phải sau thời gian nhận phòng", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }
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

  const pets = (await ownerBoardingRepository.findOwnerBookingPets(authUser.userId)).map(mapBookingPet);
  const selectedPet = query.petId
    ? mapBookingPetOrNull(await ownerBoardingRepository.findOwnerBookingPet(authUser.userId, query.petId))
    : pets[0] ?? null;

  if (query.petId && !selectedPet) {
    throw new AppError("Không tìm thấy thú cưng phù hợp để đặt phòng lưu trú", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const roomTypes = (await boardingRoomRepository.findActiveRoomTypesWithAvailability(
    query.plannedCheckInAt,
    query.plannedCheckOutAt
  )).map((roomType) => mapRoomType(roomType, query.plannedCheckInAt, query.plannedCheckOutAt));

  return {
    pets,
    selectedPet,
    roomTypes
  };
}

export async function createBoardingRecord(
  authUser: AuthUser,
  payload: CreateBoardingRecordPayload,
  clientIp: string
): Promise<BoardingRecordCreatedDto> {
  assertOwner(authUser);
  assertValidBoardingTime(payload.plannedCheckInAt, payload.plannedCheckOutAt);

  const petRow = await ownerBoardingRepository.findOwnerBookingPet(authUser.userId, payload.petId);

  if (!petRow) {
    throw new AppError("Không tìm thấy thú cưng phù hợp để đặt phòng lưu trú", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const roomTypes = (await boardingRoomRepository.findActiveRoomTypesWithAvailability(
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
    const record = await ownerBoardingRepository.createBoardingRecord({
      ownerUserId: authUser.userId,
      pet: mapBookingPet(petRow),
      roomType: selectedRoomType,
      plannedCheckInAt: payload.plannedCheckInAt,
      plannedCheckOutAt: payload.plannedCheckOutAt,
      stayDays: selectedRoomType.nights,
      careRequest: payload.careRequest,
      paymentOption: payload.paymentOption,
      clientIp
    });
    await upsertPetActivityLog({
      petId: petRow.pet_id,
      ownerUserId: authUser.userId,
      actorUserId: authUser.userId,
      activityCategory: "boarding",
      activityType: "boarding_booked",
      activityStatus: record.boardingStatus === "pending_payment" ? "pending" : "scheduled",
      title: "Đã đặt lịch lưu trú",
      summary: `${petRow.pet_name} có lịch lưu trú tại ${selectedRoomType.roomTypeName}.`,
      sourceType: "boarding_record",
      sourceId: record.boardingRecordId,
      metadata: {
        plannedCheckInAt: payload.plannedCheckInAt.toISOString(),
        plannedCheckOutAt: payload.plannedCheckOutAt.toISOString(),
        roomTypeId: payload.roomTypeId,
        roomTypeName: selectedRoomType.roomTypeName,
        paymentOption: payload.paymentOption,
        status: record.boardingStatus
      }
    });
    await upsertPetActivityLog({
      petId: petRow.pet_id,
      ownerUserId: authUser.userId,
      actorUserId: authUser.userId,
      activityCategory: "invoice",
      activityType: "invoice_issued",
      activityStatus: "pending",
      title: "Đã tạo hóa đơn lưu trú",
      summary: `Hóa đơn lưu trú của ${petRow.pet_name} đã được tạo.`,
      sourceType: "invoice",
      sourceId: record.invoiceId,
      metadata: {
        boardingRecordId: record.boardingRecordId,
        amount: record.totalAmount,
        paymentOption: payload.paymentOption
      }
    });
    boardingNotificationPublisher.boardingCreated(record.boardingRecordId).catch(console.error);
    return record;
  } catch (error) {
    if (error instanceof Error && error.message === "BOARDING_PET_TIME_CONFLICT") {
      throw new AppError("Thú cưng này đã có lịch lưu trú trùng thời gian đã chọn", "BOARDING_PET_TIME_CONFLICT", httpStatus.CONFLICT);
    }

    if (error instanceof Error && error.message === "BOARDING_ROOM_FULL") {
      throw new AppError("Loại phòng này đã hết chỗ trong khoảng thời gian đã chọn", "BOARDING_ROOM_FULL", httpStatus.CONFLICT);
    }

    if (error instanceof Error && error.message === "VNPAY_CONFIGURATION_MISSING") {
      throw new AppError("VNPay configuration is missing", "VNPAY_CONFIGURATION_MISSING", httpStatus.INTERNAL_SERVER_ERROR);
    }

    throw error;
  }
}

export async function getOwnerBoardingRecordDetail(
  authUser: AuthUser,
  params: BoardingRecordParams
): Promise<BoardingRecordDetailDto> {
  assertOwner(authUser);

  const record = await ownerBoardingRepository.findOwnerBoardingRecordDetail(
    authUser.userId,
    params.boardingRecordId
  );

  if (!record) {
    throw new AppError("Không tìm thấy lịch lưu trú phù hợp", "BOARDING_RECORD_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const updates = await boardingUpdateRepository.findPublishedBoardingUpdates(record.boarding_record_id);

  return mapBoardingRecordDetail(record, updates);
}

export async function cancelOwnerBoardingRecord(
  authUser: AuthUser,
  params: BoardingRecordParams
): Promise<void> {
  assertOwner(authUser);

  const record = await ownerBoardingRepository.findOwnerBoardingRecordDetail(
    authUser.userId,
    params.boardingRecordId
  );

  if (!record) {
    throw new AppError("Không tìm thấy lịch lưu trú phù hợp", "BOARDING_RECORD_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (record.boarding_status !== "pending") {
    throw new AppError("Chỉ có thể hủy lịch lưu trú đang chờ xác nhận", "INVALID_BOARDING_STATUS", httpStatus.BAD_REQUEST);
  }

  if (record.invoice_status === "paid") {
    throw new AppError("Lịch này đã được thanh toán. Vui lòng liên hệ nhân viên để được hỗ trợ hủy.", "INVALID_BOARDING_STATUS", httpStatus.BAD_REQUEST);
  }

  await ownerBoardingRepository.updateBoardingRecordStatus(params.boardingRecordId, "cancelled");
  await upsertPetActivityLog({
    petId: record.pet_id,
    ownerUserId: authUser.userId,
    actorUserId: authUser.userId,
    activityCategory: "boarding",
    activityType: "boarding_cancelled",
    activityStatus: "cancelled",
    title: "Đã hủy lịch lưu trú",
    summary: `${record.pet_name} đã được hủy lịch lưu trú.`,
    sourceType: "boarding_record",
    sourceId: params.boardingRecordId,
    metadata: {
      plannedCheckInAt: new Date(record.planned_check_in_at).toISOString(),
      plannedCheckOutAt: new Date(record.planned_check_out_at).toISOString()
    }
  });
  boardingNotificationPublisher.boardingCancelled(params.boardingRecordId).catch(console.error);
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
    ownerBoardingRepository.findOwnerBoardingRecords(filters),
    ownerBoardingRepository.countOwnerBoardingRecords(filters)
  ]);

  return {
    records: records.map(mapBoardingRecord),
    pagination: createPagination(paginationInput.page, paginationInput.limit, total)
  };
}
