import { hashPassword, generateTemporaryPassword } from '../../../shared/security/password.service.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { httpStatus } from '../../../shared/errors/http-status.js';
import type { AuthUser } from '../../../shared/types/auth.js';
import { createPagination, normalizePagination } from '../../../shared/utils/pagination.js';
import { createId } from '../../../shared/utils/id.js';
import { withTransaction } from '../../../db/transactions.js';
import * as mailService from '../../mail/mail.service.js';
import {
  notifyBoardingCreated,
  notifyBoardingConfirmed,
  notifyBoardingRejected,
  notifyBoardingCheckedIn,
  notifyBoardingUpdateCreated,
} from '../../notifications/notification-events.js';
import { boardingNotificationPublisher } from '../boarding-notification.publisher.js';
import { assertBoardingTransition } from '../boarding-status.policy.js';
import * as staffBoardingRepository from './staff-boarding.repository.js';
import * as boardingRoomRepository from '../boarding-room.repository.js';
import * as boardingUpdateRepository from '../boarding-update.repository.js';
import * as ownerBoardingRepository from '../owner/owner-boarding.repository.js';
import * as boardingInvoiceRepository from '../boarding-invoice.repository.js';
import * as boardingRepository from '../boarding.repository.js';
import type {
  CheckInStaffBoardingPayload,
  CheckOutStaffBoardingPayload,
  ConfirmStaffBoardingPayload,
  ListStaffBoardingRecordsQuery,
  RejectStaffBoardingPayload,
  UpdateStaffBoardingLogPayload,
  GetStaffBoardingCreateOptionsQuery,
  CreateStaffBoardingOwnerPayload,
  StaffBoardingOwnerParams,
  CreateStaffBoardingPetPayload,
  CreateStaffBoardingAtCounterPayload
} from '../boarding.schema.js';
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
} from '../boarding.types.js';

import {
  mapDbAlertLevelToDto,
  mapDbVisibilityStatusToDto,
  mapDtoAlertLevelToDb,
  mapDtoVisibilityStatusToDb,
  getRoomTypeName,
  mapPaymentStatus,
  normalizeAttachmentUrlsStaff,
  getPayloadAttachmentUrls,
  toApiDate,
  buildCurrentDayLabel,
  buildUpdateTitleFromAlertLevel,
  getCareUpdateLabel,
  getCareUpdateLabelTone,
  mapDbBoardingStatusToDto,
  buildStaffBoardingTimeline,
  mapStaffBoardingListItem,
  mapStaffBoardingDetail
} from "./staff-boarding.mapper.js";


const minimumStayDays = 1;

function normalizeOptionalText(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  return new Date(String(value)).toISOString();
}

function requireTimestamp(value: unknown): string {
  const normalized = normalizeTimestamp(value);

  if (!normalized) {
    throw new AppError('Dữ liệu thời gian lưu trú không hợp lệ', 'INVALID_BOARDING_TIME', httpStatus.INTERNAL_SERVER_ERROR);
  }

  return normalized;
}

function optionalTimestamp(value: unknown): string | null {
  return normalizeTimestamp(value);
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

function assertStaff(authUser: AuthUser): void {
  if (authUser.role !== 'STAFF' && authUser.role !== 'ADMIN') {
    throw new AppError('Bạn không có quyền thực hiện hành động này', 'FORBIDDEN', httpStatus.FORBIDDEN);
  }
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
    attachmentUrl: normalizeAttachmentUrlsStaff(draft.attachment_url)[0] ?? null,
    attachmentUrls: normalizeAttachmentUrlsStaff(draft.attachment_url),
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

  let updateId: string;

  if (existingDraft) {
    await boardingRepository.updateBoardingUpdate({
      boardingUpdateId: existingDraft.boarding_update_id,
      description: payload.description,
      alertLevel: mapDtoAlertLevelToDb(payload.alertLevel),
      visibilityStatus,
      attachmentUrls: getPayloadAttachmentUrls(payload)
    });
    updateId = existingDraft.boarding_update_id;
  } else if (visibilityStatus === "published") {
    const inserted = await boardingRepository.insertBoardingUpdateIfNotDuplicate({
      boardingRecordId: boardingId,
      createdByUserId: authUser.userId,
      description: payload.description,
      alertLevel: mapDtoAlertLevelToDb(payload.alertLevel),
      visibilityStatus,
      attachmentUrls: getPayloadAttachmentUrls(payload)
    });
    updateId = inserted.boarding_update_id;
  } else {
    const inserted = await boardingRepository.insertBoardingUpdate({
      boardingRecordId: boardingId,
      createdByUserId: authUser.userId,
      description: payload.description,
      alertLevel: mapDtoAlertLevelToDb(payload.alertLevel),
      visibilityStatus,
      attachmentUrls: getPayloadAttachmentUrls(payload)
    });
    updateId = inserted.boarding_update_id;
  }

  if (visibilityStatus === "published" && updateId) {
    notifyBoardingUpdateCreated(updateId).catch(console.error);
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
  notifyBoardingConfirmed(boardingId).catch(console.error);
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
  notifyBoardingRejected(boardingId).catch(console.error);
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
  notifyBoardingCheckedIn(boardingId).catch(console.error);
  return getStaffBoardingDetail(authUser, boardingId);
}

export async function checkOutStaffBoarding(authUser: AuthUser, boardingId: string, payload: CheckOutStaffBoardingPayload): Promise<StaffBoardingDetailDto> {
  assertStaff(authUser);
  try {
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
  } catch (error) {
    console.error("[checkOutStaffBoarding] ERROR:", error);
    throw error;
  }
}

export async function getRoomTypes() {
  const roomTypes = await boardingRepository.findActiveRoomTypesWithAvailability();
  return roomTypes.map((roomType) => ({
    id: roomType.room_type_id,
    name: roomType.room_type_name
  }));
}

export async function getStaffBoardingCreateOptions(
  authUser: AuthUser,
  query: GetStaffBoardingCreateOptionsQuery
) {
  assertStaff(authUser);

  const owners = await boardingRepository.findStaffBoardingCreateOwners({ searchOwner: query.searchOwner });

  let ownerIds = owners.map(o => o.id);
  if (ownerIds.length === 0) ownerIds = ["non_existent_id_just_for_empty"];

  const pets = await boardingRepository.findStaffBoardingCreatePets(ownerIds);

  let checkInAt: Date | undefined = undefined;
  let checkOutAt: Date | undefined = undefined;

  const parseDateWithDefaultTime = (val: string, defaultTime: string) => {
    if (val.includes('T')) return new Date(val);
    return new Date(`${val}T${defaultTime}+07:00`);
  };

  if (query.plannedCheckInAt) {
    checkInAt = new Date(query.plannedCheckInAt as string);
  } else if (query.plannedCheckInDate) {
    checkInAt = parseDateWithDefaultTime(query.plannedCheckInDate as string, "08:00:00");
  }

  if (query.plannedCheckOutAt) {
    checkOutAt = new Date(query.plannedCheckOutAt as string);
  } else if (query.plannedCheckOutDate) {
    checkOutAt = parseDateWithDefaultTime(query.plannedCheckOutDate as string, "18:00:00");
  }

  if (checkInAt && isNaN(checkInAt.getTime())) checkInAt = undefined;
  if (checkOutAt && isNaN(checkOutAt.getTime())) checkOutAt = undefined;

  const roomTypesRaw = await boardingRepository.findStaffBoardingCreateRoomTypes(
    (checkInAt && checkOutAt) ? checkInAt : undefined,
    (checkInAt && checkOutAt) ? checkOutAt : undefined
  );

  const roomTypes = roomTypesRaw.map((rt: any) => {
    const capacity = Number(rt.capacity);
    const bookedUnits = Number(rt.booked_units);
    const availableUnits = Math.max(capacity - bookedUnits, 0);
    const available = availableUnits > 0;

    let roomTypeTag = "STANDARD";
    if (rt.room_type_name.toLowerCase().includes("vip")) roomTypeTag = "VIP";

    return {
      id: rt.room_type_id,
      code: rt.room_type_id,
      name: rt.room_type_name,
      roomType: roomTypeTag,
      description: rt.description,
      pricePerDay: Number(rt.boarding_unit_price),
      capacity,
      bookedUnits,
      availableUnits,
      availableCount: availableUnits,
      available,
      capacityText: available ? `Còn ${availableUnits} phòng` : "Hết phòng",
      features: []
    };
  });

  return { owners, pets, roomTypes };
}

export async function createStaffBoardingOwner(
  authUser: AuthUser,
  payload: CreateStaffBoardingOwnerPayload
) {
  assertStaff(authUser);

  const fullName = payload.fullName.trim();
  const phoneNumber = payload.phoneNumber.trim();
  const email = payload.email.trim();
  const address = normalizeOptionalText(payload.address);

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const owner = await withTransaction(async (client) => {
    const existingPhoneOwner = await boardingRepository.findStaffOwnerByPhoneNumber(phoneNumber, client);
    if (existingPhoneOwner) {
      throw new AppError("Số điện thoại đã tồn tại trong hồ sơ chủ nuôi", "OWNER_PHONE_ALREADY_EXISTS", httpStatus.CONFLICT);
    }

    const existingEmailUser = await boardingRepository.findUserByEmail(email, client);
    if (existingEmailUser) {
      throw new AppError("Email này đã được sử dụng", "OWNER_EMAIL_ALREADY_EXISTS", httpStatus.CONFLICT);
    }

    const userId = await createId("own", client);

    return boardingRepository.createStaffBoardingOwner({
      userId,
      fullName,
      phoneNumber,
      email,
      passwordHash,
      address
    }, client);
  });

  try {
    await mailService.sendOwnerAccountCreatedEmail({
      to: email,
      ownerName: fullName,
      loginEmail: email,
      temporaryPassword
    });

    return { ...owner, emailSent: true };
  } catch (error) {
    console.error("Failed to send owner account email:", error);
    return { ...owner, emailSent: false };
  }
}

export async function createStaffBoardingPet(
  authUser: AuthUser,
  params: StaffBoardingOwnerParams,
  payload: CreateStaffBoardingPetPayload
) {
  assertStaff(authUser);

  return withTransaction(async (client) => {
    const ownerExists = await boardingRepository.verifyOwnerExists(params.ownerId, client);
    if (!ownerExists) {
      throw new AppError("Chủ nuôi không tồn tại", "OWNER_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    return boardingRepository.createStaffBoardingPet({
      petId: await createId("pet", client),
      ownerId: params.ownerId,
      petName: payload.petName.trim(),
      species: payload.species,
      breed: payload.breed.trim(),
      gender: payload.gender,
      birthDate: payload.birthDate ?? null,
      estimatedAge: payload.estimatedAge ?? null,
      furColor: normalizeOptionalText(payload.furColor),
      weightKg: payload.weightKg ?? null,
      profileImageUrl: normalizeOptionalText(payload.profileImageUrl),
      identifyingMarks: normalizeOptionalText(payload.identifyingMarks)
    }, client);
  });
}

export async function createStaffBoardingAtCounter(
  authUser: AuthUser,
  payload: CreateStaffBoardingAtCounterPayload
) {
  assertStaff(authUser);

  const normalizeStaffBoardingDateTime = (
    dateTimeValue: unknown,
    dateValue: string | undefined,
    timeValue: string | undefined,
    defaultTime: string
  ): string | undefined => {
    if (dateTimeValue instanceof Date) return dateTimeValue.toISOString();
    if (typeof dateTimeValue === "string" && dateTimeValue.trim()) return dateTimeValue;
    if (!dateValue) return undefined;

    return dateValue.includes("T")
      ? dateValue
      : `${dateValue}T${timeValue || defaultTime}:00`;
  };

  const plannedCheckInAtStr = normalizeStaffBoardingDateTime(
    payload.plannedCheckInAt,
    payload.plannedCheckInDate,
    payload.plannedCheckInTime,
    "08:00"
  );
  const plannedCheckOutAtStr = normalizeStaffBoardingDateTime(
    payload.plannedCheckOutAt,
    payload.plannedCheckOutDate,
    payload.plannedCheckOutTime,
    "18:00"
  );

  if (!plannedCheckInAtStr || !plannedCheckOutAtStr) {
    throw new AppError("Thiếu thời gian nhận phòng hoặc trả phòng", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }

  const plannedCheckInAt = new Date(plannedCheckInAtStr);
  const plannedCheckOutAt = new Date(plannedCheckOutAtStr);

  if (isNaN(plannedCheckInAt.getTime()) || isNaN(plannedCheckOutAt.getTime())) {
    throw new AppError("Thời gian không hợp lệ", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }

  if (plannedCheckOutAt <= plannedCheckInAt) {
    throw new AppError("Thời gian trả phòng phải sau thời gian nhận phòng", "INVALID_BOARDING_TIME", httpStatus.BAD_REQUEST);
  }

  const stayDays = calculateStayDays(plannedCheckInAt, plannedCheckOutAt);

  const result = await withTransaction(async (client) => {
    await boardingRepository.lockBoardingRecordsForAvailability(client);

    const ownerExists = await boardingRepository.verifyOwnerExists(payload.ownerId, client);
    if (!ownerExists) throw new AppError("Chủ nuôi không tồn tại", "OWNER_NOT_FOUND", httpStatus.NOT_FOUND);

    const petExists = await boardingRepository.verifyPetBelongsToOwner(payload.petId, payload.ownerId, client);
    if (!petExists) throw new AppError("Thú cưng không tồn tại hoặc không thuộc về chủ nuôi này", "PET_NOT_FOUND", httpStatus.NOT_FOUND);

    const overlappingPetRecords = await boardingRepository.countOverlappingBoardingRecordsByPet(
      payload.petId,
      plannedCheckInAt,
      plannedCheckOutAt,
      client
    );
    if (overlappingPetRecords > 0) {
      throw new AppError("Thú cưng này đã có lịch lưu trú trùng thời gian đã chọn", "BOARDING_PET_TIME_CONFLICT", httpStatus.CONFLICT);
    }

    const roomType = await boardingRepository.findRoomTypeById(payload.roomTypeId, client);
    if (!roomType || roomType.room_type_status !== "active") {
      throw new AppError("Loại phòng không tồn tại hoặc không còn hoạt động", "ROOM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    const bookedUnits = await boardingRepository.countBookedUnitsByRoomType(payload.roomTypeId, plannedCheckInAt, plannedCheckOutAt, client);
    if (bookedUnits >= roomType.capacity) {
      throw new AppError("Phòng đã hết chỗ trong thời gian này", "ROOM_TYPE_FULL", httpStatus.CONFLICT);
    }

    const boardingRecordId = await createId("brd", client);
    const invoiceId = await createId("inv", client);
    const paymentId = await createId("pay", client);
    const invoiceLineId = await createId("inl", client);
    const updateId = await createId("bup", client);

    const totalAmount = Number(roomType.pricePerDay) * stayDays;
    const careRequest = (payload.specialRequests?.length) ? payload.specialRequests.join(", ") : payload.careRequest || null;

    await boardingRepository.createBoardingRecordAtCounter({
      boardingRecordId,
      petId: payload.petId,
      ownerId: payload.ownerId,
      roomTypeId: payload.roomTypeId,
      plannedCheckInAt,
      plannedCheckOutAt,
      careRequest,
      estimatedTotal: totalAmount,
      handledByStaffId: authUser.userId
    }, client);

    await boardingRepository.createBoardingInvoice({
      invoiceId,
      ownerId: payload.ownerId,
      petId: payload.petId,
      totalAmount
    }, client);

    await boardingRepository.createBoardingInvoiceLine({
      invoiceLineId,
      invoiceId,
      boardingRecordId,
      description: `Lưu trú - ${stayDays} ngày`,
      quantity: stayDays,
      unitPrice: Number(roomType.pricePerDay),
      lineAmount: totalAmount
    }, client);

    await boardingRepository.createBoardingPayment({
      paymentId,
      invoiceId,
      paidAmount: totalAmount
    }, client);

    const note = payload.note ? `\nGhi chú thêm: ${payload.note}` : "";
    await boardingRepository.createInitialBoardingUpdate({
      boardingUpdateId: updateId,
      boardingRecordId,
      createdByUserId: authUser.userId,
      updateNote: `[SYSTEM_CHECKIN] Thú cưng đã được nhận tại quầy.${note}`
    }, client);

    return {
      boardingId: boardingRecordId,
      boardingRecordId,
      boardingCode: boardingRecordId,
      status: "STAYING",
      actualCheckInAt: new Date().toISOString(),
      invoice: {
        invoiceId,
        invoiceCode: invoiceId,
        subtotal: totalAmount,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount,
        currency: "VND",
        totalDays: stayDays,
        pricePerDay: Number(roomType.pricePerDay),
        paymentMethod: "AT_COUNTER",
        paymentStatus: "PAID"
      }
    };
  });

  notifyBoardingCreated(result.boardingId).catch(console.error);

  return result;
}

// ==================================================
