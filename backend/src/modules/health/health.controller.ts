import type { Request, RequestHandler, Response } from "express";
import { sendSuccess } from "../../shared/responses/api-response.js";
import * as healthService from "./health.service.js";

export const checkHealth: RequestHandler = (_req, res) => {
  sendSuccess(res, healthService.checkHealth());
};

export async function checkDatabaseHealth(_req: Request, res: Response): Promise<void> {
  const databaseHealth = await healthService.checkDatabaseHealth();
  sendSuccess(res, databaseHealth);
}
