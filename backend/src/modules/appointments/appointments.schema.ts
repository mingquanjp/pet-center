import { z } from "zod";

export const listStaffAppointmentsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING_PAYMENT", "PENDING", "CONFIRMED", "REJECTED", "CANCELLED"]).optional(),
  serviceType: z.enum(["GENERAL_CHECKUP", "VACCINATION", "LAB_TEST", "RECHECK"]).optional(),
  tab: z.enum(["ALL", "PENDING", "CONFIRMED", "REJECTED", "CANCELLED"]).optional(),
  date: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});
