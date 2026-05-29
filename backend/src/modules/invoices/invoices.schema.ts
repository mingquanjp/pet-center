import { z } from "zod";

export const listStaffInvoicesQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PAID", "PENDING_PAYMENT", "OVERDUE", "CANCELLED", "REFUNDED", "DRAFT"]).optional(),
  serviceType: z.enum(["MEDICAL", "GROOMING", "BOARDING", "PRESCRIPTION", "OTHER"]).optional(),
  paymentOption: z.enum(["ONLINE", "AT_COUNTER"]).optional(),
  timeRange: z.enum(["TODAY", "THIS_WEEK", "THIS_MONTH", "ALL"]).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const invoiceParamsSchema = z.object({
  invoiceId: z.string().max(30),
});

export const confirmPaymentSchema = z.object({
  paymentMethod: z.enum(["cash_at_counter", "card_at_counter"]),
});
