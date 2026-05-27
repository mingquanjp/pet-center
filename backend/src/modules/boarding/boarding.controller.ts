import type { Request, Response } from "express";
import { sendPaginated } from "../../shared/responses/api-response.js";
import type { ListBoardingRecordsQuery } from "./boarding.schema.js";
import * as boardingService from "./boarding.service.js";

export async function listOwnerBoardingRecords(req: Request, res: Response): Promise<void> {
  const result = await boardingService.listOwnerBoardingRecords(
    req.user!,
    req.query as unknown as ListBoardingRecordsQuery
  );

  sendPaginated(res, result.records, result.pagination);
}
