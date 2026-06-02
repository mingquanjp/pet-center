import { z } from "zod";

export const listAdminUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["Owner", "Staff", "Doctor", "Admin"]).optional(),
  status: z.enum(["active", "locked", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;
