import { z } from "zod";

export const listBoardingRecordsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(["all", "pending", "confirmed", "staying", "checked_out"]).optional().default("all"),
  roomTypeId: z.string().trim().min(1).max(30).optional(),
  timeRange: z.enum(["all", "upcoming", "current", "past"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(6)
});

export type ListBoardingRecordsQuery = z.infer<typeof listBoardingRecordsQuerySchema>;
