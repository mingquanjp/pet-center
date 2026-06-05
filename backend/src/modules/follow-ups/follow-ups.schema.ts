import { z } from "zod";

export const listDoctorFollowUpsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(["upcoming", "overdue", "completed"]).optional(),
  date: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const followUpParamsSchema = z.object({
  followUpId: z.string().min(1, "Follow-up ID is required").max(30),
});
