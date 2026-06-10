import { AppError } from "../../../shared/errors/app-error.js";
import { httpStatus } from "../../../shared/errors/http-status.js";
import type { AuthUser } from "../../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../../shared/utils/pagination.js";
import { createId } from "../../../shared/utils/id.js";
import * as boardingRoomRepository from "../boarding-room.repository.js";
import {
  mapAdminBoardingRoomListRow,
  mapAdminBoardingRoomUsageHistoryRow,
  formatRoomTypeCode
} from "./admin-boarding-room.mapper.js";
import type {
  GetAdminBoardingRoomsQuery
} from "../boarding.schema.js";
import type {
  AdminBoardingRoomsResultDto,
  AdminBoardingRoomCapacityLevel,
  AdminBoardingRoomStatus,
  AdminBoardingRoomDetailDto,
  AdminBoardingRoomUsageHistoryQueryDto,
  CreateAdminBoardingRoomBody,
  UpdateAdminBoardingRoomBody,
  UpdateAdminBoardingRoomStatusBody
} from "../boarding.types.js";

export async function getAdminBoardingRooms(
  authUser: AuthUser,
  query: GetAdminBoardingRoomsQuery
): Promise<AdminBoardingRoomsResultDto> {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền truy cập", "FORBIDDEN", httpStatus.FORBIDDEN);
  }

  const paginationInput = normalizePagination(query.page, query.limit);

  const filters = {
    search: query.search,
    status: query.status,
    priceRange: query.priceRange,
  };

  const rows = await boardingRoomRepository.findAdminBoardingRoomsBase(filters);

  let items = rows.map((row: any, index: number) => mapAdminBoardingRoomListRow(row, index));

  if (query.capacityLevel && query.capacityLevel !== "ALL") {
    items = items.filter((item) => item.capacityLevel === query.capacityLevel);
  }

  const total = items.length;
  const paginatedItems = items.slice(paginationInput.offset, paginationInput.offset + paginationInput.limit);

  const statsRows = await boardingRoomRepository.findAdminBoardingRoomsStatsBase();
  
  let totalRoomTypes = statsRows.length;
  let activeRoomTypes = 0;
  let inactiveRoomTypes = 0;
  let stayingPets = 0;
  let totalCapacity = 0;

  for (const sr of statsRows) {
    if (sr.room_type_status === "active") activeRoomTypes++;
    else inactiveRoomTypes++;

    stayingPets += Number(sr.current_occupancy);
    totalCapacity += Number(sr.capacity);
  }

  const todayOccupancyRate = totalCapacity > 0 ? Math.round((stayingPets / totalCapacity) * 100) : 0;

  return {
    items: paginatedItems,
    stats: {
      totalRoomTypes,
      activeRoomTypes,
      inactiveRoomTypes,
      stayingPets,
      totalCapacity,
      todayOccupancyRate
    },
    pagination: createPagination(paginationInput.page, paginationInput.limit, total)
  };
}

export async function getAdminBoardingRoomDetail(
  authUser: AuthUser,
  roomTypeId: string
): Promise<AdminBoardingRoomDetailDto> {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền truy cập", "FORBIDDEN", httpStatus.FORBIDDEN);
  }

  const row = await boardingRoomRepository.findAdminBoardingRoomDetailRow(roomTypeId);
  if (!row) {
    throw new AppError("Không tìm thấy loại phòng lưu trú.", "ROOM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const usageStatsRow = await boardingRoomRepository.findAdminBoardingRoomUsageStats(roomTypeId);

  const capacity = Number(row.capacity);
  const currentOccupancy = Number(row.current_occupancy);
  const availableSlots = Math.max(capacity - currentOccupancy, 0);
  const occupancyRate = capacity > 0 ? Math.round((currentOccupancy / capacity) * 100) : 0;
  
  let capacityLevel: AdminBoardingRoomCapacityLevel = "AVAILABLE";
  if (occupancyRate >= 100) {
    capacityLevel = "FULL";
  } else if (occupancyRate >= 70) {
    capacityLevel = "NEAR_FULL";
  }

  const averageOccupancyRate = capacity > 0 ? Math.round((Number(usageStatsRow.currently_staying) / capacity) * 100) : 0;

  return {
    id: row.room_type_id,
    code: formatRoomTypeCode(roomTypeId),
    name: row.room_type_name,
    description: row.description,
    capacity,
    currentOccupancy,
    availableSlots,
    occupancyRate,
    capacityLevel,
    boardingUnitPrice: Number(row.boarding_unit_price),
    status: row.room_type_status as AdminBoardingRoomStatus,
    usageStats: {
      totalRecords: Number(usageStatsRow.total_records),
      currentlyStaying: Number(usageStatsRow.currently_staying),
      checkedOut: Number(usageStatsRow.checked_out),
      cancelledOrRejected: Number(usageStatsRow.cancelled_or_rejected),
      estimatedRevenue: Number(usageStatsRow.estimated_revenue),
      averageOccupancyRate
    }
  };
}

export async function getAdminBoardingRoomUsageHistory(
  authUser: AuthUser,
  roomTypeId: string,
  query: AdminBoardingRoomUsageHistoryQueryDto
) {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền truy cập", "FORBIDDEN", httpStatus.FORBIDDEN);
  }

  const room = await boardingRoomRepository.findRoomTypeById(roomTypeId);
  if (!room) {
    throw new AppError("Không tìm thấy loại phòng lưu trú.", "ROOM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const paginationInput = normalizePagination(query.page, query.limit);

  const filters = {
    search: query.search,
    boardingStatus: query.boardingStatus,
    paymentStatus: query.paymentStatus,
    timeRange: query.timeRange,
  };

  const rows = await boardingRoomRepository.findAdminBoardingRoomUsageHistoryRows(roomTypeId, filters, paginationInput.offset, paginationInput.limit);
  const total = await boardingRoomRepository.countAdminBoardingRoomUsageHistory(roomTypeId, filters);

  const items = rows.map(mapAdminBoardingRoomUsageHistoryRow);

  return {
    items,
    pagination: createPagination(paginationInput.page, paginationInput.limit, total)
  };
}

export async function createAdminBoardingRoom(
  authUser: AuthUser,
  body: CreateAdminBoardingRoomBody
) {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền truy cập", "FORBIDDEN", httpStatus.FORBIDDEN);
  }

  const exists = await boardingRoomRepository.checkRoomTypeNameExists(body.name);
  if (exists) {
    throw new AppError("Tên loại phòng đã tồn tại.", "ROOM_TYPE_NAME_EXISTS", httpStatus.BAD_REQUEST);
  }

  const roomTypeId = await createId("rt");
  const row = await boardingRoomRepository.createAdminBoardingRoom(roomTypeId, body);

  return {
    id: row.room_type_id,
    code: formatRoomTypeCode(roomTypeId),
    name: row.room_type_name,
    description: row.description,
    capacity: Number(row.capacity),
    currentOccupancy: 0,
    availableSlots: Number(row.capacity),
    occupancyRate: 0,
    capacityLevel: "AVAILABLE" as AdminBoardingRoomCapacityLevel,
    boardingUnitPrice: Number(row.boarding_unit_price),
    status: row.room_type_status as AdminBoardingRoomStatus
  };
}

export async function updateAdminBoardingRoom(
  authUser: AuthUser,
  roomTypeId: string,
  body: UpdateAdminBoardingRoomBody
) {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền truy cập", "FORBIDDEN", httpStatus.FORBIDDEN);
  }

  const room = await boardingRoomRepository.findRoomTypeById(roomTypeId);
  if (!room) {
    throw new AppError("Không tìm thấy loại phòng lưu trú.", "ROOM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (body.name && body.name !== room.room_type_name) {
    const exists = await boardingRoomRepository.checkRoomTypeNameExists(body.name, roomTypeId);
    if (exists) {
      throw new AppError("Tên loại phòng đã tồn tại.", "ROOM_TYPE_NAME_EXISTS", httpStatus.BAD_REQUEST);
    }
  }

  if (body.capacity !== undefined) {
    const currentOccupancy = await boardingRoomRepository.countStayingPetsByRoomType(roomTypeId);
    if (body.capacity < currentOccupancy) {
      throw new AppError("Sức chứa không được nhỏ hơn số thú cưng đang lưu trú.", "ROOM_TYPE_CAPACITY_TOO_SMALL", httpStatus.BAD_REQUEST);
    }
  }

  await boardingRoomRepository.updateAdminBoardingRoom(roomTypeId, body);

  return await getAdminBoardingRoomDetail(authUser, roomTypeId);
}

export async function updateAdminBoardingRoomStatus(
  authUser: AuthUser,
  roomTypeId: string,
  body: UpdateAdminBoardingRoomStatusBody
) {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền truy cập", "FORBIDDEN", httpStatus.FORBIDDEN);
  }

  const room = await boardingRoomRepository.findRoomTypeById(roomTypeId);
  if (!room) {
    throw new AppError("Không tìm thấy loại phòng lưu trú.", "ROOM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (room.room_type_status !== body.status) {
    await boardingRoomRepository.updateAdminBoardingRoomStatus(roomTypeId, body.status);
  }

  return await getAdminBoardingRoomDetail(authUser, roomTypeId);
}

export async function deleteAdminBoardingRoom(
  authUser: AuthUser,
  roomTypeId: string
) {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền truy cập", "FORBIDDEN", httpStatus.FORBIDDEN);
  }

  const room = await boardingRoomRepository.findRoomTypeById(roomTypeId);
  if (!room) {
    throw new AppError("Không tìm thấy loại phòng lưu trú.", "ROOM_TYPE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const currentOccupancy = await boardingRoomRepository.countStayingPetsByRoomType(roomTypeId);
  if (currentOccupancy > 0) {
    throw new AppError("Không thể xóa loại phòng đang có thú cưng lưu trú.", "ROOM_TYPE_HAS_STAYING_PETS", httpStatus.BAD_REQUEST);
  }

  const totalRecords = await boardingRoomRepository.countBoardingRecordsByRoomType(roomTypeId);
  
  if (totalRecords > 0) {
    await boardingRoomRepository.updateAdminBoardingRoomStatus(roomTypeId, "inactive");
    return {
      deleted: false,
      deactivated: true,
      id: roomTypeId,
      message: "Loại phòng đã có lịch sử sử dụng nên đã được tạm ngưng."
    };
  }

  await boardingRoomRepository.deleteAdminBoardingRoom(roomTypeId);
  return {
    deleted: true,
    deactivated: false,
    id: roomTypeId,
    message: "Xóa phòng lưu trú thành công."
  };
}
