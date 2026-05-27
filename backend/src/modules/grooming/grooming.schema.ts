import { z } from "zod";

export const bookingOptionsQuerySchema = z.object({
  petId: z.string().trim().min(1).max(30).optional()
});

export const availabilityQuerySchema = z.object({
  date: z.coerce.date()
});

export const createGroomingTicketSchema = z.object({
  petId: z.string().trim().min(1, "Thú cưng là bắt buộc").max(30),
  serviceId: z.string().trim().min(1, "Dịch vụ là bắt buộc").max(30),
  scheduledAt: z.coerce.date(),
  specialRequest: z.string().trim().max(1000).optional().nullable(),
  paymentOption: z.enum(["counter", "online"])
});

export const staffGroomingTicketQuerySchema = z.object({
  status: z
    .enum(["all", "pending_payment", "pending", "waiting", "in_progress", "completed", "cancelled"])
    .default("all"),
  serviceId: z.string().trim().max(30).default("all"),
  species: z.enum(["all", "Dog", "Cat", "Other"]).default("all"),
  timeRange: z.enum(["all", "today", "upcoming", "past"]).default("all"),
  search: z.string().trim().max(120).default(""),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

export const staffCounterOptionsQuerySchema = z.object({
  petId: z.string().trim().min(1).max(30).optional(),
  search: z.string().trim().max(120).default(""),
  limit: z.coerce.number().int().min(1).max(20).default(10)
});

export const createStaffCounterGroomingTicketSchema = z.object({
  petId: z.string().trim().min(1, "ThÃº cÆ°ng lÃ  báº¯t buá»™c").max(30),
  serviceId: z.string().trim().min(1, "Dá»‹ch vá»¥ lÃ  báº¯t buá»™c").max(30),
  scheduledAt: z.coerce.date(),
  specialRequest: z.string().trim().max(1000).optional().nullable()
});

export const groomingTicketParamsSchema = z.object({
  ticketId: z.string().trim().min(1).max(30)
});

export type BookingOptionsQuery = z.infer<typeof bookingOptionsQuerySchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type CreateGroomingTicketPayload = z.infer<typeof createGroomingTicketSchema>;
export type StaffGroomingTicketQuery = z.infer<typeof staffGroomingTicketQuerySchema>;
export type StaffCounterOptionsQuery = z.infer<typeof staffCounterOptionsQuerySchema>;
export type CreateStaffCounterGroomingTicketPayload = z.infer<typeof createStaffCounterGroomingTicketSchema>;
export type GroomingTicketParams = z.infer<typeof groomingTicketParamsSchema>;
