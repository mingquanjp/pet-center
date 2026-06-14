import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendSuccess } from "../../shared/responses/api-response.js";
import * as uploadsService from "./uploads.service.js";

export async function uploadImage(req: Request, res: Response): Promise<void> {
  const image = await uploadsService.uploadImage(req.file!);

  sendSuccess(res, image, "Upload ảnh thành công", httpStatus.CREATED);
}

export async function uploadFile(req: Request, res: Response): Promise<void> {
  const file = await uploadsService.uploadFile(req.file!);

  sendSuccess(res, file, "Upload tệp thành công", httpStatus.CREATED);
}

export async function getFileViewUrl(req: Request, res: Response): Promise<void> {
  const viewUrl = uploadsService.createFileViewUrl(req.body.url);

  sendSuccess(res, { url: viewUrl }, "Tạo đường dẫn xem tệp thành công");
}
