import { z } from "zod";

export const listBoardingRecordsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(["all", "pending", "confirmed", "staying", "checked_out", "cancelled", "rejected"]).optional().default("all"),
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

export const boardingRecordParamsSchema = z.object({
  boardingRecordId: z.string().trim().min(1).max(30)
});

export type ListBoardingRecordsQuery = z.infer<typeof listBoardingRecordsQuerySchema>;
export type BoardingBookingOptionsQuery = z.infer<typeof boardingBookingOptionsQuerySchema>;
export type CreateBoardingRecordPayload = z.infer<typeof createBoardingRecordSchema>;
export type BoardingRecordParams = z.infer<typeof boardingRecordParamsSchema>;

export const staffBoardingIdParamsSchema = z.object({
  boardingId: z.string().trim().min(1).max(60)
});

export const listStaffBoardingRecordsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  tab: z.enum(["ALL", "PENDING", "CONFIRMED", "STAYING", "CHECKED_OUT", "REJECTED", "CANCELLED"]).optional().default("ALL"),
  status: z.enum(["PENDING_PAYMENT", "PENDING", "CONFIRMED", "STAYING", "CHECKED_OUT", "REJECTED", "CANCELLED"]).optional(),
  roomType: z.string().trim().max(60).optional().default("ALL"),
  timeRange: z.enum(["ALL", "TODAY", "THIS_WEEK", "THIS_MONTH"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10)
}).transform((query) => ({ ...query, status: query.status ?? "ALL" }));

export const updateStaffBoardingLogSchema = z.object({
  description: z.string().trim().min(3).max(1000),
  alertLevel: z.enum(["NORMAL", "NEED_ATTENTION", "WARNING"]).optional(),
  visibilityStatus: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  attachmentUrl: z.string().url().max(1000).optional().nullable(),
  attachmentUrls: z.array(z.string().url()).optional()
});

export const confirmStaffBoardingSchema = z.object({
  internalNote: z.string().trim().max(1000).optional()
});

export const checkInStaffBoardingSchema = z.object({
  internalNote: z.string().trim().max(1000).optional()
});

export const checkOutStaffBoardingSchema = z.object({
  internalNote: z.string().trim().max(1000).optional(),
  finalAmount: z.coerce.number().min(0).optional()
});

export const rejectStaffBoardingSchema = z.object({
  rejectionReason: z.string().trim().min(3).max(500),
  internalNote: z.string().trim().max(1000).optional()
});

export type ListStaffBoardingRecordsQuery = z.infer<typeof listStaffBoardingRecordsQuerySchema>;
export type UpdateStaffBoardingLogPayload = z.infer<typeof updateStaffBoardingLogSchema>;
export type ConfirmStaffBoardingPayload = z.infer<typeof confirmStaffBoardingSchema>;
export type CheckInStaffBoardingPayload = z.infer<typeof checkInStaffBoardingSchema>;
export type CheckOutStaffBoardingPayload = z.infer<typeof checkOutStaffBoardingSchema>;
export type RejectStaffBoardingPayload = z.infer<typeof rejectStaffBoardingSchema>;
