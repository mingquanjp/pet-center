import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../shared/responses/api-response.js";
import type { AdminDashboardActivityLogsQuery, AdminDashboardQuery, DoctorDashboardQuery, StaffDashboardQuery } from "./dashboard.schema.js";
import * as dashboardService from "./dashboard.service.js";

export async function getOwnerDashboard(req: Request, res: Response): Promise<void> {
  const dashboard = await dashboardService.getOwnerDashboard(req.user!);

  sendSuccess(res, dashboard);
}

export async function listOwnerActivityLogs(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await dashboardService.listOwnerActivityLogs(req.user!, { page, limit });

  sendPaginated(res, result.data, result.pagination);
}

export async function getStaffOverview(req: Request, res: Response): Promise<void> {
  const overview = await dashboardService.getStaffOverview(req.user!, req.query as unknown as StaffDashboardQuery);

  sendSuccess(res, overview);
}

export async function getDoctorOverview(req: Request, res: Response): Promise<void> {
  const overview = await dashboardService.getDoctorOverview(req.user!, req.query as unknown as DoctorDashboardQuery);

  sendSuccess(res, overview);
}

export async function getAdminOverview(req: Request, res: Response): Promise<void> {
  const overview = await dashboardService.getAdminOverview(req.user!, req.query as unknown as AdminDashboardQuery);

  sendSuccess(res, overview);
}

export async function listAdminActivityLogs(req: Request, res: Response): Promise<void> {
  const result = await dashboardService.listAdminActivityLogs(req.user!, req.query as unknown as AdminDashboardActivityLogsQuery);

  sendPaginated(res, result.data, result.pagination);
}
