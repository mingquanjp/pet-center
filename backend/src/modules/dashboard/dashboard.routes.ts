import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as dashboardController from "./dashboard.controller.js";
import { staffDashboardQuerySchema } from "./dashboard.schema.js";

export const dashboardRouter = Router();

/**
 * @openapi
 * /api/v1/dashboards/staff/overview:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get staff dashboard overview
 *     description: "Returns today's pending staff tasks, room availability, invoice count, and appointment tasks. Security BearerAuth. Roles: STAFF, ADMIN."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskLimit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 2
 *     responses:
 *       200:
 *         description: Staff dashboard overview returned successfully.
 *       401:
 *         description: Missing or invalid token.
 *       403:
 *         description: Role is not allowed.
 */
dashboardRouter.get(
  "/dashboards/staff/overview",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: staffDashboardQuerySchema }),
  asyncHandler(dashboardController.getStaffOverview)
);
