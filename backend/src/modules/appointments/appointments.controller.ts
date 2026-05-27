import type { Request, Response } from "express";
import * as appointmentsService from "./appointments.service.js";

export async function listStaffAppointments(req: Request, res: Response) {
  const result = await appointmentsService.listStaffAppointments(req.query);
  res.json({
    success: true,
    data: result.data,
    stats: result.stats,
    pagination: result.pagination,
  });
}

export async function getStaffAppointmentDetail(req: Request, res: Response) {
  const result = await appointmentsService.getStaffAppointmentDetail(req.params.appointmentId as string);
  res.json({
    success: true,
    data: result,
  });
}

export async function confirmStaffAppointment(req: Request, res: Response) {
  const staffUserId = (req as any).user.userId;
  const result = await appointmentsService.confirmStaffAppointment(
    req.params.appointmentId as string,
    staffUserId,
    req.body
  );
  res.json({
    success: true,
    data: result,
    message: "Xác nhận lịch hẹn thành công",
  });
}

export async function rejectStaffAppointment(req: Request, res: Response) {
  const staffUserId = (req as any).user.userId;
  const result = await appointmentsService.rejectStaffAppointment(
    req.params.appointmentId as string,
    staffUserId,
    req.body
  );
  res.json({
    success: true,
    data: result,
    message: "Từ chối lịch hẹn thành công",
  });
}
