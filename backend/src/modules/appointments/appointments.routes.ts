import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as appointmentsController from "./appointments.controller.js";
import { listStaffAppointmentsQuerySchema } from "./appointments.schema.js";

export const appointmentsRouter = Router();

/**
 * @openapi
 * /api/v1/staff/appointments:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: List staff appointments
 *     description: Get paginated list of medical appointments for staff dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by appointment ID, pet name, owner name, or phone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_PAYMENT, PENDING, CONFIRMED, REJECTED, CANCELLED]
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: [GENERAL_CHECKUP, VACCINATION, LAB_TEST, RECHECK]
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [ALL, PENDING, CONFIRMED, REJECTED, CANCELLED]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Staff appointments list with stats and pagination
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires STAFF or ADMIN role
 */
appointmentsRouter.get(
  "/staff/appointments",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: listStaffAppointmentsQuerySchema }),
  asyncHandler(appointmentsController.listStaffAppointments)
);
