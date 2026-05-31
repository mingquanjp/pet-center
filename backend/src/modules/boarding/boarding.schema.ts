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
  petId: z.string().trim().min(1, "ThÃº cÆ°ng lÃ  báº¯t buá»™c").max(30),
  roomTypeId: z.string().trim().min(1, "Loáº¡i phÃ²ng lÃ  báº¯t buá»™c").max(30),
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

export const staffBoardingOwnerParamsSchema = z.object({
  ownerId: z.string().trim().min(1).max(30)
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

// ==========================================
// STAFF CREATE BOARDING AT COUNTER SCHEMAS
// ==========================================

export const getStaffBoardingCreateOptionsQuerySchema = z.object({
  plannedCheckInAt: z.union([z.string(), z.date()]).optional(),
  plannedCheckOutAt: z.union([z.string(), z.date()]).optional(),
  plannedCheckInDate: z.string().optional(),
  plannedCheckOutDate: z.string().optional(),
  searchOwner: z.string().max(100).optional()
});

export const createStaffBoardingAtCounterSchema = z.object({
  ownerId: z.string().min(1, "Vui lÃ²ng chá»n chá»§ nuÃ´i"),
  petId: z.string().min(1, "Vui lÃ²ng chá»n thÃº cÆ°ng"),
  roomTypeId: z.string().min(1, "Vui lÃ²ng chá»n loáº¡i phÃ²ng"),

  plannedCheckInAt: z.union([z.string(), z.date()]).optional(),
  plannedCheckOutAt: z.union([z.string(), z.date()]).optional(),

  plannedCheckInDate: z.string().optional(),
  plannedCheckInTime: z.string().optional(),
  plannedCheckOutDate: z.string().optional(),
  plannedCheckOutTime: z.string().optional(),

  careRequest: z.string().max(1000).optional().nullable(),
  specialRequests: z.array(z.string().max(100)).optional(),

  paymentMethod: z.enum(["AT_COUNTER"]).optional().default("AT_COUNTER"),
  paymentStatus: z.enum(["PAID"]).optional().default("PAID"),
  createMode: z.enum(["CHECK_IN_NOW"]).optional().default("CHECK_IN_NOW"),

  note: z.string().max(500).optional().nullable()
});

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const createStaffBoardingOwnerSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên chủ nuôi").max(150),
  phoneNumber: z.string().trim().min(8, "Số điện thoại không hợp lệ").max(20)
    .regex(/^[0-9+()\s.-]+$/, "Số điện thoại không hợp lệ"),
  email: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1, "Vui lòng nhập email chủ nuôi").email("Email không hợp lệ").max(254)
  ),
  address: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional()
  )
});

const optionalDateInput = z.preprocess(
  emptyStringToUndefined,
  z.coerce.date().max(new Date(), "Ngày sinh không được ở tương lai").optional()
);
const optionalNonNegativeNumberInput = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().min(0).max(999.99).optional()
);
const optionalPositiveNumberInput = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().positive().optional()
);

export const createStaffBoardingPetSchema = z.object({
  petName: z.string().trim().min(1, "Vui lòng nhập tên thú cưng").max(100),
  species: z.enum(["Dog", "Cat", "Other"]),
  breed: z.string().trim().min(1, "Vui lòng nhập giống thú cưng").max(100),
  gender: z.enum(["male", "female", "unknown"]),
  birthDate: optionalDateInput,
  estimatedAge: optionalNonNegativeNumberInput,
  furColor: z.preprocess(emptyStringToUndefined, z.string().trim().max(80).optional()),
  weightKg: optionalPositiveNumberInput,
  profileImageUrl: z.preprocess(emptyStringToUndefined, z.string().trim().url().max(2000).optional()),
  identifyingMarks: z.preprocess(emptyStringToUndefined, z.string().trim().max(1000).optional())
}).refine((value) => value.birthDate || value.estimatedAge !== undefined, {
  path: ["estimatedAge"],
  message: "Cần nhập ngày sinh hoặc tuổi ước tính"
});

export type GetStaffBoardingCreateOptionsQuery = z.infer<typeof getStaffBoardingCreateOptionsQuerySchema>;
export type CreateStaffBoardingAtCounterPayload = z.infer<typeof createStaffBoardingAtCounterSchema>;
export type CreateStaffBoardingOwnerPayload = z.infer<typeof createStaffBoardingOwnerSchema>;
export type StaffBoardingOwnerParams = z.infer<typeof staffBoardingOwnerParamsSchema>;
export type CreateStaffBoardingPetPayload = z.infer<typeof createStaffBoardingPetSchema>;

