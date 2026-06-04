import { z } from "zod";

export const listDoctorPrescriptionsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  date: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const prescriptionParamsSchema = z.object({
  prescriptionId: z.string().min(1, "Prescription ID is required").max(30),
});
