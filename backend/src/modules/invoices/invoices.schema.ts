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

export const listOwnerInvoicesQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PAID", "PENDING_PAYMENT", "OVERDUE"]).optional(),
  serviceType: z.enum(["MEDICAL", "GROOMING", "BOARDING", "PRESCRIPTION"]).optional(),
  date: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(4),
});

export const invoiceParamsSchema = z.object({
  invoiceId: z.string().max(30),
});

export const confirmPaymentSchema = z.object({
  paymentMethod: z.enum(["at_counter"]),
});
