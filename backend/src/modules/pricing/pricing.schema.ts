import { z } from "zod";

const pricingStatusSchema = z.enum(["active", "inactive"]);

export const getAdminPricingQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: z.enum(["ALL", "medical", "grooming", "boarding", "medicine", "other"]).optional(),
  status: z.enum(["ALL", "active", "inactive"]).optional(),
  serviceId: z.string().max(30).optional(),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).optional()),
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().min(1).max(100).optional()),
});

export const priceRuleIdParamSchema = z.object({
  priceRuleId: z.string().min(1).max(30),
});

export const createAdminPriceRuleSchema = z.object({
  serviceId: z.string().min(1).max(30),
  pricingCondition: z.string().min(1, "Điều kiện giá là bắt buộc").max(150),
  priceAmount: z.number().min(0, "Giá không hợp lệ"),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày hiệu lực không hợp lệ"),
  status: pricingStatusSchema.optional().default("active"),
});

export const updateAdminPriceRuleSchema = z.object({
  serviceId: z.string().min(1).max(30).optional(),
  pricingCondition: z.string().min(1, "Điều kiện giá là bắt buộc").max(150).optional(),
  priceAmount: z.number().min(0, "Giá không hợp lệ").optional(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày hiệu lực không hợp lệ").optional(),
  status: pricingStatusSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Phải cung cấp ít nhất một trường để cập nhật",
});
