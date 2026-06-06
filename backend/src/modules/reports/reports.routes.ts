import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { exportAdminReportsSchema, getAdminReportsQuerySchema } from "./reports.schema.js";
import { reportsController } from "./reports.controller.js";

export const reportsRouter = Router();

reportsRouter.get(
  "/admin/reports",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: getAdminReportsQuerySchema }),
  reportsController.getAdminReportsController as any
);

reportsRouter.post(
  "/admin/reports/export",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: exportAdminReportsSchema }),
  reportsController.exportAdminReportsController as any
);
