import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

export const dashboardRouter = Router();

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
