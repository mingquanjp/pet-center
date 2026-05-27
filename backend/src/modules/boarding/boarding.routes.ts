import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as boardingController from "./boarding.controller.js";
import {
  boardingBookingOptionsQuerySchema,
  createBoardingRecordSchema,
  listBoardingRecordsQuerySchema
} from "./boarding.schema.js";

export const boardingRouter = Router();

boardingRouter.get(
  "/boarding/booking-options",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: boardingBookingOptionsQuerySchema }),
  asyncHandler(boardingController.getBoardingBookingOptions)
);

/**
 * @openapi
 * /api/v1/boarding/records:
 *   get:
 *     tags:
 *       - Boarding
 *     summary: List current owner's boarding records
 *     description: "Returns boarding records in the owner-visible flow: pending, confirmed, staying, checked_out. Pending online payments are excluded until the booking enters this flow. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, confirmed, staying, checked_out]
 *       - in: query
 *         name: roomTypeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [all, upcoming, current, past]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Boarding records returned successfully.
 */
boardingRouter.get(
  "/boarding/records",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: listBoardingRecordsQuerySchema }),
  asyncHandler(boardingController.listOwnerBoardingRecords)
);

boardingRouter.post(
  "/boarding/records",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ body: createBoardingRecordSchema }),
  asyncHandler(boardingController.createBoardingRecord)
);
