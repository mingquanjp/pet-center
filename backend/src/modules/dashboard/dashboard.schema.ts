import { z } from "zod";

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const staffDashboardQuerySchema = z.object({
  taskLimit: z.coerce.number().int().min(1).max(10).default(2)
});

export type StaffDashboardQuery = z.infer<typeof staffDashboardQuerySchema>;

export const adminDashboardQuerySchema = z
  .object({
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
  })
  .refine(
    (value) => {
      if (!value.startDate || !value.endDate) return true;

      return value.startDate <= value.endDate;
    },
    {
      message: "startDate must be before or equal to endDate",
      path: ["startDate"],
    }
  );

export type AdminDashboardQuery = z.infer<typeof adminDashboardQuerySchema>;
