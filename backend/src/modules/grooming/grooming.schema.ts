import { z } from "zod";

export const bookingOptionsQuerySchema = z.object({
  petId: z.string().trim().min(1).max(30).optional()
});

export const availabilityQuerySchema = z.object({
  date: z.coerce.date()
});

export const listGroomingTicketsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  petId: z.string().trim().min(1).max(30).optional(),
  status: z.enum(["all", "pending", "waiting", "in_progress"]).optional().default("all"),
  timeRange: z.enum(["all", "today", "upcoming", "past"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

export const listGroomingTicketHistoryQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  petId: z.string().trim().min(1).max(30).optional(),
  status: z.enum(["all", "completed", "cancelled"]).optional().default("all"),
  timeRange: z.enum(["all", "today", "upcoming", "past"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

export const groomingTicketParamsSchema = z.object({
  ticketId: z.string().trim().min(1).max(30)
});

export const createGroomingTicketSchema = z.object({
  petId: z.string().trim().min(1, "Thú cưng là bắt buộc").max(30),
  serviceId: z.string().trim().min(1, "Dịch vụ là bắt buộc").max(30),
  scheduledAt: z.coerce.date(),
  specialRequest: z.string().trim().max(1000).optional().nullable(),
  paymentOption: z.enum(["counter", "online"])
});

export type BookingOptionsQuery = z.infer<typeof bookingOptionsQuerySchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type ListGroomingTicketsQuery = z.infer<typeof listGroomingTicketsQuerySchema>;
export type ListGroomingTicketHistoryQuery = z.infer<typeof listGroomingTicketHistoryQuerySchema>;
export type GroomingTicketParams = z.infer<typeof groomingTicketParamsSchema>;
export type CreateGroomingTicketPayload = z.infer<typeof createGroomingTicketSchema>;
