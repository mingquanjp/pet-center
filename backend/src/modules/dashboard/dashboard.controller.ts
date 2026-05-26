import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/responses/api-response.js";
import type { StaffDashboardQuery } from "./dashboard.schema.js";
import * as dashboardService from "./dashboard.service.js";

export async function getStaffOverview(req: Request, res: Response): Promise<void> {
  const overview = await dashboardService.getStaffOverview(req.user!, req.query as unknown as StaffDashboardQuery);

  sendSuccess(res, overview);
}
