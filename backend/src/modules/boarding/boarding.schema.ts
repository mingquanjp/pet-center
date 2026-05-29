import { z } from "zod";

export const listBoardingRecordsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(["all", "pending", "confirmed", "staying", "checked_out"]).optional().default("all"),
  roomTypeId: z.string().trim().min(1).max(30).optional(),
  timeRange: z.enum(["all", "upcoming", "current", "past"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(6)
});

export const boardingBookingOptionsQuerySchema = z.object({
  petId: z.string().trim().min(1).max(30).optional(),
  plannedCheckInAt: z.coerce.date().optional(),
  plannedCheckOutAt: z.coerce.date().optional()
});

export const createBoardingRecordSchema = z.object({
  petId: z.string().trim().min(1, "Thú cưng là bắt buộc").max(30),
  roomTypeId: z.string().trim().min(1, "Loại phòng là bắt buộc").max(30),
  plannedCheckInAt: z.coerce.date(),
  plannedCheckOutAt: z.coerce.date(),
  careRequest: z.string().trim().max(1000).optional().nullable(),
  paymentOption: z.enum(["counter", "online"])
});

export type ListBoardingRecordsQuery = z.infer<typeof listBoardingRecordsQuerySchema>;
export type BoardingBookingOptionsQuery = z.infer<typeof boardingBookingOptionsQuerySchema>;
export type CreateBoardingRecordPayload = z.infer<typeof createBoardingRecordSchema>;
