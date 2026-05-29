import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/responses/api-response.js";
import * as dashboardService from "./dashboard.service.js";

export async function getOwnerDashboard(req: Request, res: Response): Promise<void> {
  const dashboard = await dashboardService.getOwnerDashboard(req.user!);

  sendSuccess(res, dashboard);
}
