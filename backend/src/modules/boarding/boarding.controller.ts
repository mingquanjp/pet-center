import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendPaginated, sendSuccess } from "../../shared/responses/api-response.js";
import type {
  BoardingBookingOptionsQuery,
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
  RejectStaffBoardingPayload
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
