import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendPaginated, sendSuccess } from "../../shared/responses/api-response.js";
import type {
  BoardingBookingOptionsQuery,
  BoardingRecordParams,
  CreateBoardingRecordPayload,
  ListBoardingRecordsQuery
} from "./boarding.schema.js";
import * as boardingService from "./boarding.service.js";

export async function getBoardingBookingOptions(req: Request, res: Response): Promise<void> {
  const result = await boardingService.getBookingOptions(
    req.user!,
    req.query as unknown as BoardingBookingOptionsQuery
  );

  sendSuccess(res, result);
}

export async function listOwnerBoardingRecords(req: Request, res: Response): Promise<void> {
  const result = await boardingService.listOwnerBoardingRecords(
    req.user!,
    req.query as unknown as ListBoardingRecordsQuery
  );

  sendPaginated(res, result.records, result.pagination);
}

export async function getOwnerBoardingRecordDetail(req: Request, res: Response): Promise<void> {
  const result = await boardingService.getOwnerBoardingRecordDetail(
    req.user!,
    req.params as unknown as BoardingRecordParams
  );

  sendSuccess(res, result);
}

export async function cancelOwnerBoardingRecord(req: Request, res: Response): Promise<void> {
  await boardingService.cancelOwnerBoardingRecord(
    req.user!,
    req.params as unknown as BoardingRecordParams
  );

  sendSuccess(res, null);
}

export async function createBoardingRecord(req: Request, res: Response): Promise<void> {
  const result = await boardingService.createBoardingRecord(
    req.user!,
    req.body as CreateBoardingRecordPayload
  );

  sendSuccess(res, result, "Đặt phòng lưu trú thành công", httpStatus.CREATED);
}

// ==========================================
// STAFF BOARDING CONTROLLERS
// ==========================================

import type {
  ListStaffBoardingRecordsQuery,
  UpdateStaffBoardingLogPayload,
  ConfirmStaffBoardingPayload,
  CheckInStaffBoardingPayload,
  CheckOutStaffBoardingPayload,
  RejectStaffBoardingPayload,
  GetStaffBoardingCreateOptionsQuery,
  CreateStaffBoardingAtCounterPayload,
  CreateStaffBoardingOwnerPayload,
  CreateStaffBoardingPetPayload,
  StaffBoardingOwnerParams,
  GetAdminBoardingRoomsQuery
} from "./boarding.schema.js";

export async function listStaffBoardingRecords(req: Request, res: Response): Promise<void> {
  const result = await boardingService.listStaffBoardingRecords(
    req.user!,
    req.query as unknown as ListStaffBoardingRecordsQuery
  );

  res.status(httpStatus.OK).json({
    success: true,
    data: result.data,
    stats: result.stats,
    pagination: result.pagination
  });
}

export async function getStaffBoardingDetail(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  const result = await boardingService.getStaffBoardingDetail(req.user!, boardingId);
  sendSuccess(res, result);
}

export async function getStaffBoardingDraftUpdate(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  const result = await boardingService.getStaffBoardingDraftUpdate(req.user!, boardingId);
  sendSuccess(res, result);
}

export async function updateStaffBoardingLog(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  const result = await boardingService.updateStaffBoardingLog(
    req.user!,
    boardingId,
    req.body as UpdateStaffBoardingLogPayload
  );
  sendSuccess(res, result, req.body?.visibilityStatus === "DRAFT" ? "Da luu nhap cap nhat cham soc" : "Cap nhat nhat ky cham soc thanh cong");
}

export async function deleteStaffBoardingDraftUpdate(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  await boardingService.deleteStaffBoardingDraftUpdate(req.user!, boardingId);
  sendSuccess(res, null, "Da xoa nhap cap nhat cham soc");
}

export async function confirmStaffBoarding(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  const result = await boardingService.confirmStaffBoarding(
    req.user!,
    boardingId,
    req.body as ConfirmStaffBoardingPayload
  );
  sendSuccess(res, result, "Da xac nhan yeu cau luu tru");
}

export async function rejectStaffBoarding(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  const result = await boardingService.rejectStaffBoarding(
    req.user!,
    boardingId,
    req.body as RejectStaffBoardingPayload
  );
  sendSuccess(res, result, "Da tu choi yeu cau luu tru");
}

export async function checkInStaffBoarding(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  const result = await boardingService.checkInStaffBoarding(
    req.user!,
    boardingId,
    req.body as CheckInStaffBoardingPayload
  );
  sendSuccess(res, result, "Nhan thu cung thanh cong");
}

export async function checkOutStaffBoarding(req: Request, res: Response): Promise<void> {
  const boardingId = req.params.boardingId as string;
  const result = await boardingService.checkOutStaffBoarding(
    req.user!,
    boardingId,
    req.body as CheckOutStaffBoardingPayload
  );
  sendSuccess(res, result, "Tra thu cung thanh cong");
}

export async function getRoomTypes(req: Request, res: Response): Promise<void> {
  const roomTypes = await boardingService.getRoomTypes();
  sendSuccess(res, roomTypes, "Lấy danh sách loại phòng thành công");
}

export async function getStaffBoardingCreateOptions(req: Request, res: Response): Promise<void> {
  const result = await boardingService.getStaffBoardingCreateOptions(
    req.user!,
    req.query as unknown as GetStaffBoardingCreateOptionsQuery
  );
  sendSuccess(res, result);
}

export async function createStaffBoardingOwner(req: Request, res: Response): Promise<void> {
  const result = await boardingService.createStaffBoardingOwner(
    req.user!,
    req.body as CreateStaffBoardingOwnerPayload
  );
  sendSuccess(res, result, "Tao ho so chu nuoi thanh cong", httpStatus.CREATED);
}

export async function createStaffBoardingPet(req: Request, res: Response): Promise<void> {
  const result = await boardingService.createStaffBoardingPet(
    req.user!,
    req.params as unknown as StaffBoardingOwnerParams,
    req.body as CreateStaffBoardingPetPayload
  );
  sendSuccess(res, result, "Tao ho so thu cung thanh cong", httpStatus.CREATED);
}

export async function createStaffBoardingAtCounter(req: Request, res: Response): Promise<void> {
  const result = await boardingService.createStaffBoardingAtCounter(
    req.user!,
    req.body as CreateStaffBoardingAtCounterPayload
  );
  sendSuccess(res, result, "Tạo lưu trú tại quầy thành công", httpStatus.CREATED);
}

// ==========================================
// ADMIN BOARDING CONTROLLERS
// ==========================================

export async function getAdminBoardingRoomsController(req: Request, res: Response): Promise<void> {
  const result = await boardingService.getAdminBoardingRooms(
    req.user!,
    req.query as unknown as GetAdminBoardingRoomsQuery
  );

  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message: "Lấy danh sách phòng lưu trú thành công."
  });
}
import type {
  AdminBoardingRoomUsageHistoryQueryDto,
  CreateAdminBoardingRoomBody,
  UpdateAdminBoardingRoomBody,
  UpdateAdminBoardingRoomStatusBody
} from "./boarding.types.js";

export async function getAdminBoardingRoomDetailController(req: Request, res: Response): Promise<void> {
  const result = await boardingService.getAdminBoardingRoomDetail(req.user!, req.params.roomTypeId);
  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message: "Lấy chi tiết phòng lưu trú thành công."
  });
}

export async function getAdminBoardingRoomUsageHistoryController(req: Request, res: Response): Promise<void> {
  const result = await boardingService.getAdminBoardingRoomUsageHistory(
    req.user!,
    req.params.roomTypeId,
    req.query as unknown as AdminBoardingRoomUsageHistoryQueryDto
  );
  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message: "Lấy lịch sử sử dụng phòng thành công."
  });
}

export async function createAdminBoardingRoomController(req: Request, res: Response): Promise<void> {
  const result = await boardingService.createAdminBoardingRoom(
    req.user!,
    req.body as CreateAdminBoardingRoomBody
  );
  res.status(httpStatus.CREATED).json({
    success: true,
    data: result,
    message: "Tạo phòng lưu trú thành công."
  });
}

export async function updateAdminBoardingRoomController(req: Request, res: Response): Promise<void> {
  const result = await boardingService.updateAdminBoardingRoom(
    req.user!,
    req.params.roomTypeId,
    req.body as UpdateAdminBoardingRoomBody
  );
  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message: "Cập nhật phòng lưu trú thành công."
  });
}

export async function updateAdminBoardingRoomStatusController(req: Request, res: Response): Promise<void> {
  const result = await boardingService.updateAdminBoardingRoomStatus(
    req.user!,
    req.params.roomTypeId,
    req.body as UpdateAdminBoardingRoomStatusBody
  );
  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message: req.body.status === "active" ? "Kích hoạt phòng lưu trú thành công." : "Tạm ngưng phòng lưu trú thành công."
  });
}

export async function deleteAdminBoardingRoomController(req: Request, res: Response): Promise<void> {
  const result = await boardingService.deleteAdminBoardingRoom(req.user!, req.params.roomTypeId);
  res.status(httpStatus.OK).json({
    success: true,
    data: result,
    message: result.message
  });
}
