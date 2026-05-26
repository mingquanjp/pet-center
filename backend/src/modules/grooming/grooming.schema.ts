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

export type BookingOptionsQuery = z.infer<typeof bookingOptionsQuerySchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type CreateGroomingTicketPayload = z.infer<typeof createGroomingTicketSchema>;
