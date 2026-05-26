import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/responses/api-response.js";
import * as groomingService from "./grooming.service.js";

export async function listAvailableServices(req: Request, res: Response): Promise<void> {
  const services = await groomingService.listAvailableServices(req.user!);

  sendSuccess(res, services);
}
