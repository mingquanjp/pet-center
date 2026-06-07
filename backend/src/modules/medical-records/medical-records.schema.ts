import { z } from "zod";

export const getDoctorMedicalRecordsQuerySchema = z.object({
  keyword: z.string().max(100).optional().default(""),
  species: z.enum(["ALL", "Dog", "Cat", "Other"]).optional().default("ALL"),
  examStatus: z
    .enum(["ALL", "result_recorded", "prescribed", "follow_up_required"])
    .optional()
    .default("ALL"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
