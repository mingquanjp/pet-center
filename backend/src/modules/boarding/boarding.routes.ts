import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as boardingController from "./boarding.controller.js";
import {
  boardingRecordParamsSchema,
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

boardingRouter.get(
  "/boarding/records/:boardingRecordId",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: boardingRecordParamsSchema }),
  asyncHandler(boardingController.getOwnerBoardingRecordDetail)
);

boardingRouter.patch(
  "/boarding/records/:boardingRecordId/cancel",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: boardingRecordParamsSchema }),
  asyncHandler(boardingController.cancelOwnerBoardingRecord)
);

boardingRouter.post(
  "/boarding/records",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ body: createBoardingRecordSchema }),
  asyncHandler(boardingController.createBoardingRecord)
);

// ==========================================
// STAFF BOARDING ROUTES
// ==========================================

import {
  listStaffBoardingRecordsQuerySchema,
  updateStaffBoardingLogSchema,
  confirmStaffBoardingSchema,
  rejectStaffBoardingSchema,
  checkInStaffBoardingSchema,
  checkOutStaffBoardingSchema,
  staffBoardingIdParamsSchema,
  getStaffBoardingCreateOptionsQuerySchema,
  createStaffBoardingAtCounterSchema,
  createStaffBoardingOwnerSchema,
  createStaffBoardingPetSchema,
  staffBoardingOwnerParamsSchema
} from "./boarding.schema.js";

// Keep existing routes mounted at "/boarding/staff/records" or "/staff/boarding" depending on setup
// Since user requirement specified: "/api/v1/staff/boarding" and module mounted at "/api/v1"
// We map them to "/staff/boarding"
boardingRouter.get(
  "/staff/boarding",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: listStaffBoardingRecordsQuerySchema }),
  asyncHandler(boardingController.listStaffBoardingRecords)
);

boardingRouter.get(
  "/staff/boarding/room-types",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  asyncHandler(boardingController.getRoomTypes)
);

boardingRouter.get(
  "/staff/boarding/create-options",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: getStaffBoardingCreateOptionsQuerySchema }),
  asyncHandler(boardingController.getStaffBoardingCreateOptions)
);

boardingRouter.post(
  "/staff/boarding/owners",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ body: createStaffBoardingOwnerSchema }),
  asyncHandler(boardingController.createStaffBoardingOwner)
);

boardingRouter.post(
  "/staff/boarding/owners/:ownerId/pets",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingOwnerParamsSchema, body: createStaffBoardingPetSchema }),
  asyncHandler(boardingController.createStaffBoardingPet)
);

boardingRouter.post(
  "/staff/boarding",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ body: createStaffBoardingAtCounterSchema }),
  asyncHandler(boardingController.createStaffBoardingAtCounter)
);

boardingRouter.get(
  "/staff/boarding/:boardingId",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema }),
  asyncHandler(boardingController.getStaffBoardingDetail)
);

boardingRouter.get(
  "/staff/boarding/:boardingId/draft-update",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema }),
  asyncHandler(boardingController.getStaffBoardingDraftUpdate)
);

boardingRouter.patch(
  "/staff/boarding/:boardingId/update-log",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema, body: updateStaffBoardingLogSchema }),
  asyncHandler(boardingController.updateStaffBoardingLog)
);

boardingRouter.delete(
  "/staff/boarding/:boardingId/draft-update",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema }),
  asyncHandler(boardingController.deleteStaffBoardingDraftUpdate)
);

boardingRouter.patch(
  "/staff/boarding/:boardingId/confirm",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema, body: confirmStaffBoardingSchema }),
  asyncHandler(boardingController.confirmStaffBoarding)
);

boardingRouter.patch(
  "/staff/boarding/:boardingId/reject",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema, body: rejectStaffBoardingSchema }),
  asyncHandler(boardingController.rejectStaffBoarding)
);

boardingRouter.patch(
  "/staff/boarding/:boardingId/check-in",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema, body: checkInStaffBoardingSchema }),
  asyncHandler(boardingController.checkInStaffBoarding)
);

boardingRouter.patch(
  "/staff/boarding/:boardingId/check-out",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: staffBoardingIdParamsSchema, body: checkOutStaffBoardingSchema }),
  asyncHandler(boardingController.checkOutStaffBoarding)
);

