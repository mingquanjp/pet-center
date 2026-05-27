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

export async function createBoardingRecord(req: Request, res: Response): Promise<void> {
  const result = await boardingService.createBoardingRecord(
    req.user!,
    req.body as CreateBoardingRecordPayload
  );

  sendSuccess(res, result, "Đặt phòng lưu trú thành công", httpStatus.CREATED);
}
