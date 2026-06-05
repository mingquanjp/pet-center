import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as dashboardController from "./dashboard.controller.js";
import { adminDashboardActivityLogsQuerySchema, adminDashboardQuerySchema, doctorDashboardQuerySchema, staffDashboardQuerySchema } from "./dashboard.schema.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/dashboards/staff/overview",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: staffDashboardQuerySchema }),
  asyncHandler(dashboardController.getStaffOverview)
);

dashboardRouter.get(
  "/dashboards/doctor/overview",
  authMiddleware,
  requireRole("DOCTOR"),
  validateRequest({ query: doctorDashboardQuerySchema }),
  asyncHandler(dashboardController.getDoctorOverview)
);

dashboardRouter.get(
  "/dashboards/admin/overview",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: adminDashboardQuerySchema }),
  asyncHandler(dashboardController.getAdminOverview)
);

dashboardRouter.get(
  "/dashboards/admin/activity-logs",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: adminDashboardActivityLogsQuerySchema }),
  asyncHandler(dashboardController.listAdminActivityLogs)
);

dashboardRouter.get(
  "/owner/dashboard",
  authMiddleware,
  requireRole("OWNER"),
  asyncHandler(dashboardController.getOwnerDashboard)
);

dashboardRouter.get(
  "/owner/dashboard/activity-logs",
  authMiddleware,
  requireRole("OWNER"),
  asyncHandler(dashboardController.listOwnerActivityLogs)
);
