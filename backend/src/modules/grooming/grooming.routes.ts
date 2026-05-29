import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as groomingController from "./grooming.controller.js";
import {
  availabilityQuerySchema,
  bookingOptionsQuerySchema,
  createGroomingTicketSchema,
  createStaffCounterGroomingTicketSchema,
  groomingTicketParamsSchema,
  listGroomingTicketHistoryQuerySchema,
  listGroomingTicketsQuerySchema,
  staffCounterOptionsQuerySchema,
  staffGroomingTicketQuerySchema
} from "./grooming.schema.js";

export const groomingRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     GroomingServicePriceRule:
 *       type: object
 *       properties:
 *         priceRuleId:
 *           type: string
 *           example: spr_groom_001_under
 *         pricingCondition:
 *           type: string
 *           enum: [UNDER_5KG, FROM_5KG]
 *           example: UNDER_5KG
 *         pricingConditionLabel:
 *           type: string
 *           example: Dưới 5kg
 *         priceAmount:
 *           type: number
 *           example: 100000
 *         effectiveFrom:
 *           type: string
 *           format: date
 *           example: "2026-05-01"
 *     GroomingService:
 *       type: object
 *       properties:
 *         serviceId:
 *           type: string
 *           example: svc_groom_001_basic
 *         serviceName:
 *           type: string
 *           example: Tắm gội cơ bản
 *         description:
 *           type: string
 *           nullable: true
 *           example: Làm sạch lông, khử mùi nhẹ và sấy khô cho thú cưng.
 *         estimatedDurationMinutes:
 *           type: integer
 *           nullable: true
 *           example: 30
 *         durationText:
 *           type: string
 *           example: 30 phút
 *         basePrice:
 *           type: number
 *           example: 100000
 *         priceMin:
 *           type: number
 *           example: 100000
 *         priceMax:
 *           type: number
 *           example: 150000
 *         priceText:
 *           type: string
 *           example: Từ 100.000 VNĐ
 *         priceRules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GroomingServicePriceRule'
 *     GroomingServiceListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GroomingService'
 *         message:
 *           type: string
 *           example: Thành công
 */

/**
 * @openapi
 * /api/v1/grooming/services:
 *   get:
 *     tags:
 *       - Grooming
 *     summary: List active grooming services
 *     description: "Returns active spa/grooming services for the Owner available services tab. Security BearerAuth. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grooming services returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroomingServiceListResponse'
 *       401:
 *         description: Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role is not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
groomingRouter.get(
  "/grooming/services",
  authMiddleware,
  requireRole("OWNER"),
  asyncHandler(groomingController.listAvailableServices)
);

groomingRouter.get(
  "/grooming/staff/services",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  asyncHandler(groomingController.listStaffAvailableServices)
);

/**
 * @openapi
 * /api/v1/grooming/booking-options:
 *   get:
 *     tags:
 *       - Grooming
 *     summary: Get owner grooming booking options
 *     description: "Returns current owner's active pets and grooming services priced by the selected pet weight. The UNDER_5KG price rule is used as the base price; pets from 5kg upward add 50,000 VND for each completed 3kg block. Security BearerAuth. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking options returned successfully.
 *       401:
 *         description: Missing or invalid token.
 *       403:
 *         description: Role is not allowed.
 *       404:
 *         description: Pet not found.
 *       422:
 *         description: Pet weight is required.
 */
groomingRouter.get(
  "/grooming/booking-options",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: bookingOptionsQuerySchema }),
  asyncHandler(groomingController.getBookingOptions)
);

/**
 * @openapi
 * /api/v1/grooming/availability:
 *   get:
 *     tags:
 *       - Grooming
 *     summary: Get grooming slot availability
 *     description: "Returns 30-minute grooming slots for a date. Each 30-minute slot capacity equals the active staff count."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-26"
 *     responses:
 *       200:
 *         description: Availability returned successfully.
 */
groomingRouter.get(
  "/grooming/availability",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: availabilityQuerySchema }),
  asyncHandler(groomingController.getAvailability)
);

groomingRouter.get(
  "/grooming/counter/options",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: staffCounterOptionsQuerySchema }),
  asyncHandler(groomingController.getStaffCounterOptions)
);

groomingRouter.get(
  "/grooming/counter/availability",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: availabilityQuerySchema }),
  asyncHandler(groomingController.getStaffCounterAvailability)
);

groomingRouter.post(
  "/grooming/counter/tickets",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ body: createStaffCounterGroomingTicketSchema }),
  asyncHandler(groomingController.createStaffCounterTicket)
);

/**
 * @openapi
 * /api/v1/grooming/tickets:
 *   get:
 *     tags:
 *       - Grooming
 *     summary: List current owner's booked grooming tickets
 *     description: "Returns grooming tickets that are already counted as booked. Pending online payments are excluded until payment succeeds. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, waiting, in_progress]
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [all, today, upcoming, past]
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
 *         description: Booked grooming tickets returned successfully.
 */
groomingRouter.get(
  "/grooming/tickets",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: listGroomingTicketsQuerySchema }),
  asyncHandler(groomingController.listBookedTickets)
);

/**
 * @openapi
 * /api/v1/grooming/tickets/history:
 *   get:
 *     tags:
 *       - Grooming
 *     summary: List current owner's grooming ticket history
 *     description: "Returns completed and cancelled grooming tickets for the Owner history tab. Pending online payments are excluded because they are not considered booked services. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, completed, cancelled]
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [all, today, upcoming, past]
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
 *         description: Grooming ticket history returned successfully.
 */
groomingRouter.get(
  "/grooming/tickets/history",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: listGroomingTicketHistoryQuerySchema }),
  asyncHandler(groomingController.listTicketHistory)
);

/**
 * @openapi
 * /api/v1/grooming/tickets/{ticketId}:
 *   get:
 *     tags:
 *       - Grooming
 *     summary: Get current owner's booked grooming ticket detail
 *     description: "Returns detail for a booked or historical grooming ticket. Pending online payments are excluded until payment succeeds. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grooming ticket returned successfully.
 *       404:
 *         description: Grooming ticket not found.
 */
groomingRouter.get(
  "/grooming/tickets/:ticketId",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: groomingTicketParamsSchema }),
  asyncHandler(groomingController.getBookedTicket)
);

/**
 * @openapi
 * /api/v1/grooming/tickets/{ticketId}/cancel:
 *   patch:
 *     tags:
 *       - Grooming
 *     summary: Cancel a pending grooming ticket
 *     description: "Allows the owner to cancel only tickets that are still pending reception and not paid."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grooming ticket cancelled successfully.
 *       404:
 *         description: Grooming ticket not found.
 *       409:
 *         description: Grooming ticket cannot be cancelled in its current state.
 */
groomingRouter.patch(
  "/grooming/tickets/:ticketId/cancel",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: groomingTicketParamsSchema }),
  asyncHandler(groomingController.cancelBookedTicket)
);

/**
 * @openapi
 * /api/v1/grooming/tickets:
 *   post:
 *     tags:
 *       - Grooming
 *     summary: Create an owner grooming booking
 *     description: "Creates grooming ticket, ticket item, invoice, and invoice line in one transaction using the weight-based grooming price. Online payment returns pending_payment for later VNPay integration."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [petId, serviceId, scheduledAt, paymentOption]
 *             properties:
 *               petId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               specialRequest:
 *                 type: string
 *                 nullable: true
 *               paymentOption:
 *                 type: string
 *                 enum: [counter, online]
 *     responses:
 *       201:
 *         description: Grooming ticket created successfully.
 *       400:
 *         description: Invalid schedule time.
 *       409:
 *         description: Selected slot is full.
 */
groomingRouter.post(
  "/grooming/tickets",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ body: createGroomingTicketSchema }),
  asyncHandler(groomingController.createTicket)
);

groomingRouter.get(
  "/grooming/staff/tickets",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: staffGroomingTicketQuerySchema }),
  asyncHandler(groomingController.listStaffTickets)
);

groomingRouter.patch(
  "/grooming/staff/tickets/:ticketId/accept",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: groomingTicketParamsSchema }),
  asyncHandler(groomingController.acceptStaffTicket)
);

groomingRouter.patch(
  "/grooming/staff/tickets/:ticketId/complete",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: groomingTicketParamsSchema }),
  asyncHandler(groomingController.completeStaffTicket)
);

groomingRouter.patch(
  "/grooming/staff/tickets/:ticketId/cancel",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: groomingTicketParamsSchema }),
  asyncHandler(groomingController.cancelStaffTicket)
);
