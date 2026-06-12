import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as paymentsController from "./payments.controller.js";
import { vnpayCallbackQuerySchema } from "./payments.schema.js";

export const paymentsRouter = Router();

/**
 * @openapi
 * /api/v1/payments/vnpay/return:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Handle VNPay browser return
 *     description: Verifies VNPay callback signature and redirects the user to the frontend payment result page. This endpoint does not update booking state.
 *     responses:
 *       302:
 *         description: Redirects to frontend payment result page.
 */
paymentsRouter.get(
  "/payments/vnpay/return",
  validateRequest({ query: vnpayCallbackQuerySchema }),
  asyncHandler(paymentsController.handleVnpayReturn)
);

/**
 * @openapi
 * /api/v1/payments/vnpay/ipn:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Handle VNPay IPN
 *     description: Verifies VNPay IPN signature and idempotently updates payment attempt, invoice, payment, and booking state.
 *     responses:
 *       200:
 *         description: VNPay-compatible IPN response.
 */
paymentsRouter.get(
  "/payments/vnpay/ipn",
  validateRequest({ query: vnpayCallbackQuerySchema }),
  asyncHandler(paymentsController.handleVnpayIpn)
);
