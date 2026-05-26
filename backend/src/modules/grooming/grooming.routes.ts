import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import * as groomingController from "./grooming.controller.js";

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
 *           example: 100.000 - 150.000 VNĐ
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
