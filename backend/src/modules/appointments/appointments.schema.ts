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

export const staffAppointmentIdParamsSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
});

export const confirmStaffAppointmentSchema = z.object({
  doctorUserId: z.string().min(1, "Doctor ID is required").optional(),
  internalNote: z.string().max(1000, "Note must be at most 1000 characters").optional(),
});

export const rejectStaffAppointmentSchema = z.object({
  rejectionReason: z.string().min(5, "Rejection reason must be at least 5 characters").max(500, "Rejection reason must be at most 500 characters"),
  internalNote: z.string().max(1000, "Note must be at most 1000 characters").optional(),
});
