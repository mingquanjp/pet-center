import { z } from "zod";
import { AppointmentStatus } from "./appointments.types.js";

// Regex for YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// Regex for HH:mm
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const createAppointmentSchema = {
  body: z.object({
    petId: z.string().min(1, "Vui lòng chọn thú cưng"),
    appointmentType: z.string().min(1, "Vui lòng chọn loại hình khám"),
    appointmentDate: z.string()
      .regex(dateRegex, "Ngày khám không hợp lệ (định dạng YYYY-MM-DD)"),
    appointmentTime: z.string()
      .regex(timeRegex, "Giờ khám không hợp lệ (định dạng HH:mm)"),
    symptoms: z.string().optional(),
    note: z.string().optional(),
  }).refine((data) => {
    // Check if appointment is in the past
    const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}:00`);
    return appointmentDateTime > new Date();
  }, {
    message: "Thời gian hẹn phải ở trong tương lai",
    path: ["appointmentDate"]
  })
};

export const listAppointmentsSchema = {
  query: z.object({
    keyword: z.string().optional(),
    petId: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).optional(),
    fromDate: z.string().regex(dateRegex, "Ngày không hợp lệ").optional(),
    toDate: z.string().regex(dateRegex, "Ngày không hợp lệ").optional(),
    page: z.string().optional().transform(val => (val ? parseInt(val) : 1)).pipe(z.number().min(1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)).pipe(z.number().min(1).max(100)),
  })
};

export const appointmentIdSchema = {
  params: z.object({
    id: z.string().uuid("ID lịch hẹn không hợp lệ")
  })
};
