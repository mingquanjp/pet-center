import { z } from "zod";

export const listAdminUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["Owner", "Staff", "Doctor", "Admin"]).optional(),
  status: z.enum(["active", "locked", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;

export const createAdminUserBodySchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9+() .-]{8,20}$/)
    .optional(),
  address: z.string().trim().max(1000).optional(),
  role: z.enum(["Owner", "Staff", "Doctor", "Admin"]),
  accountStatus: z.enum(["active", "locked", "inactive"]).default("active"),
});

export type CreateAdminUserBody = z.infer<typeof createAdminUserBodySchema>;

export const adminUserIdParamsSchema = z.object({
  userId: z.string().min(1),
});

export const adminUserActivitiesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
  offset: z.coerce.number().int().min(0).default(0),
});

export type AdminUserActivitiesQuery = z.infer<typeof adminUserActivitiesQuerySchema>;

export const updateAdminUserBodySchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  email: z.string().trim().email().max(255).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9+() .-]{8,20}$/)
    .nullable()
    .optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  role: z.enum(["Owner", "Staff", "Doctor", "Admin"]).optional(),
  accountStatus: z.enum(["active", "locked", "inactive"]).optional(),
});

export type AdminUserIdParams = z.infer<typeof adminUserIdParamsSchema>;
export type UpdateAdminUserBody = z.infer<typeof updateAdminUserBodySchema>;
