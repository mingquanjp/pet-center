import { z } from "zod";

const ownerStatusSchema = z.enum([
  "PENDING_PAYMENT",
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

export const listOwnerAppointmentsQuerySchema = z.object({
  search: z.string().trim().optional(),
  petId: z.string().trim().optional(),
  status: ownerStatusSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6),
});

export const ownerAppointmentIdParamsSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
});

export const ownerAvailableSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  examTypeId: z.string().trim().optional(),
});

export const createOwnerAppointmentSchema = z.object({
  petId: z.string().min(1, "Pet is required"),
  examTypeId: z.string().min(1, "Exam type is required"),
  scheduledAt: z.string().datetime("scheduledAt must be a valid ISO datetime"),
  symptomDescription: z.string().max(500).optional(),
  note: z.string().max(500).optional(),
});

export const cancelOwnerAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});
