import { z } from "zod";

const serviceCategoryKindSchema = z.enum(["medical", "grooming", "boarding", "medicine"]);
const serviceCategoryStatusSchema = z.enum(["active", "inactive"]);

export const getAdminServiceCategoriesQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: z.enum(["ALL", "medical", "grooming", "boarding", "medicine"]).optional(),
  status: z.enum(["ALL", "active", "inactive"]).optional(),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).optional()),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(100).optional()),
});

export const serviceCategoryIdParamSchema = z.object({
  serviceId: z.string().min(1).max(30),
});

export const createAdminServiceCategorySchema = z.object({
  serviceName: z.string().min(1, "Tên dịch vụ là bắt buộc").max(150, "Tên dịch vụ tối đa 150 ký tự"),
  category: serviceCategoryKindSchema,
  description: z.string().nullable().optional(),
  durationMinutes: z.number().int().min(1, "Thời lượng phải lớn hơn 0").nullable().optional(),
  basePrice: z.number().min(0, "Giá không hợp lệ"),
  status: serviceCategoryStatusSchema.optional().default("active"),
});

export const updateAdminServiceCategorySchema = z.object({
  serviceName: z.string().min(1, "Tên dịch vụ là bắt buộc").max(150, "Tên dịch vụ tối đa 150 ký tự").optional(),
  category: serviceCategoryKindSchema.optional(),
  description: z.string().nullable().optional(),
  durationMinutes: z.number().int().min(1, "Thời lượng phải lớn hơn 0").nullable().optional(),
  basePrice: z.number().min(0, "Giá không hợp lệ").optional(),
  status: serviceCategoryStatusSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Phải cung cấp ít nhất một trường để cập nhật" }
);

export const updateAdminServiceCategoryStatusSchema = z.object({
  status: serviceCategoryStatusSchema,
});
