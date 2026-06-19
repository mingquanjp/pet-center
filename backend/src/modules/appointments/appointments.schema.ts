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

export const listDoctorExaminationsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["WAITING", "EXAMINING", "COMPLETED", "FOLLOW_UP"]).optional(),
  examType: z.enum(["GENERAL_CHECKUP", "VACCINATION", "LAB_TEST", "RECHECK"]).optional(),
  tab: z.enum(["ALL", "WAITING", "EXAMINING", "COMPLETED", "FOLLOW_UP"]).optional(),
  date: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const doctorExaminationIdParamsSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
});

const doctorExaminationFieldValueSchema = z.object({
  fieldDefinitionId: z.string().min(1),
  valueText: z.string().optional(),
  valueNumber: z.number().optional(),
  valueDate: z.string().optional(),
  fileUrl: z.string().optional(),
});

const doctorPrescriptionItemSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  quantity: z.number().positive().optional(),
  dosage: z.string().trim().min(1, "Dosage is required").max(120),
  frequency: z.string().trim().min(1, "Frequency is required").max(120),
  duration: z.string().trim().min(1, "Duration is required").max(120),
  usageInstruction: z.string().trim().min(1, "Usage instruction is required").max(1000),
  note: z.string().trim().max(1000).optional(),
});

const doctorVaccinationSchema = z.object({
  vaccineName: z.string().trim().min(1, "Vaccine name is required").max(150),
  vaccinationDate: z.string().min(1, "Vaccination date is required"),
  note: z.string().trim().max(1000).optional(),
});

const doctorFollowUpSchema = z.object({
  followUpDate: z.string().min(1, "Follow-up date is required"),
  reason: z.string().trim().min(1, "Follow-up reason is required").max(3000),
  ownerNote: z.string().trim().max(3000).optional(),
});

export const saveDraftDoctorExaminationSchema = z.object({
  diagnosis: z.string().trim().max(3000).optional(),
  conclusion: z.string().trim().max(3000).optional(),
  healthNote: z.string().trim().max(3000).optional(),
  fieldValues: z.array(doctorExaminationFieldValueSchema).optional(),
});

export const completeDoctorExaminationSchema = z.object({
  diagnosis: z.string().trim().min(1, "Diagnosis is required").max(3000),
  conclusion: z.string().trim().min(1, "Conclusion is required").max(3000),
  healthNote: z.string().trim().max(3000).optional(),
  fieldValues: z.array(doctorExaminationFieldValueSchema).optional(),
  prescriptionItems: z.array(doctorPrescriptionItemSchema).optional(),
  vaccination: doctorVaccinationSchema.optional(),
  followUp: doctorFollowUpSchema.optional(),
  dispenseMedicine: z.boolean().default(true).optional(),
});
