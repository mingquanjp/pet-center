import { z } from "zod";

const medicineUnitSchema = z.enum(["tablet", "bottle", "packet", "tube", "ml", "dose", "other"]);
const medicineStatusSchema = z.enum(["active", "inactive"]);

export const getAdminMedicinesQuerySchema = z.object({
  search: z.string().max(100).optional(),
  unit: z.enum(["ALL", "tablet", "bottle", "packet", "tube", "ml", "dose", "other"]).optional(),
  status: z.enum(["ALL", "active", "inactive"]).optional(),
  page: z.preprocess(
    (val) => (val ? Number(val) : 1),
    z.number().min(1).optional()
  ),
  limit: z.preprocess(
    (val) => (val ? Number(val) : 10),
    z.number().min(1).max(100).optional()
  ),
});

export const medicineIdParamSchema = z.object({
  medicineId: z.string().min(1).max(30),
});

export const createAdminMedicineSchema = z.object({
  medicineName: z.string().min(1, "Tên thuốc là bắt buộc").max(150, "Tên thuốc tối đa 150 ký tự"),
  unit: medicineUnitSchema,
  description: z.string().nullable().optional(),
  usageNote: z.string().nullable().optional(),
  unitPrice: z.number().min(0, "Giá không hợp lệ"),
  medicineStatus: medicineStatusSchema.optional().default("active"),
});

export const updateAdminMedicineSchema = z.object({
  medicineName: z.string().min(1, "Tên thuốc là bắt buộc").max(150, "Tên thuốc tối đa 150 ký tự").optional(),
  unit: medicineUnitSchema.optional(),
  description: z.string().nullable().optional(),
  usageNote: z.string().nullable().optional(),
  unitPrice: z.number().min(0, "Giá không hợp lệ").optional(),
  medicineStatus: medicineStatusSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Phải cung cấp ít nhất một trường để cập nhật" }
);

export const updateAdminMedicineStatusSchema = z.object({
  medicineStatus: medicineStatusSchema,
});
