import { z } from "zod";

export const staffDashboardQuerySchema = z.object({
  taskLimit: z.coerce.number().int().min(1).max(10).default(2)
});

export type StaffDashboardQuery = z.infer<typeof staffDashboardQuerySchema>;
