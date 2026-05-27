import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as invoicesController from "./invoices.controller.js";
import {
  confirmPaymentSchema,
  invoiceParamsSchema,
  listOwnerInvoicesQuerySchema,
  listStaffInvoicesQuerySchema,
} from "./invoices.schema.js";

export const invoicesRouter = Router();

invoicesRouter.get(
  "/owner/invoices",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: listOwnerInvoicesQuerySchema }),
  asyncHandler(invoicesController.listOwnerInvoices)
);

invoicesRouter.get(
  "/owner/invoices/:invoiceId",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: invoiceParamsSchema }),
  asyncHandler(invoicesController.getOwnerInvoiceDetail)
);

invoicesRouter.get(
  "/staff/invoices",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: listStaffInvoicesQuerySchema }),
  asyncHandler(invoicesController.listStaffInvoices)
);

invoicesRouter.get(
  "/staff/invoices/:invoiceId",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: invoiceParamsSchema }),
  asyncHandler(invoicesController.getStaffInvoiceDetail)
);

invoicesRouter.patch(
  "/staff/invoices/:invoiceId/confirm-payment",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: invoiceParamsSchema, body: confirmPaymentSchema }),
  asyncHandler(invoicesController.confirmPayment)
);

invoicesRouter.patch(
  "/staff/invoices/:invoiceId/cancel",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: invoiceParamsSchema }),
  asyncHandler(invoicesController.cancelInvoice)
);
