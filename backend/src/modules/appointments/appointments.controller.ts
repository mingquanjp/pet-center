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

export async function listDoctorExaminations(req: Request, res: Response) {
  const doctorUserId = req.user?.userId;
  const result = await appointmentsService.listDoctorExaminations(doctorUserId as string, req.query);
  res.json({
    success: true,
    data: result.data,
    stats: result.stats,
    tabStats: result.tabStats,
    pagination: result.pagination,
  });
}

export async function getDoctorExaminationDetail(req: Request, res: Response) {
  const doctorUserId = req.user?.userId;
  const result = await appointmentsService.getDoctorExaminationDetail(
    doctorUserId as string,
    req.params.appointmentId as string
  );
  res.json({
    success: true,
    data: result,
  });
}

export async function startDoctorExamination(req: Request, res: Response) {
  const doctorUserId = req.user?.userId;
  const result = await appointmentsService.startDoctorExamination(
    doctorUserId as string,
    req.params.appointmentId as string
  );
  res.json({
    success: true,
    data: result,
    message: "Bắt đầu khám thành công",
  });
}

export async function completeDoctorExamination(req: Request, res: Response) {
  const doctorUserId = req.user?.userId;
  const result = await appointmentsService.completeDoctorExamination(
    doctorUserId as string,
    req.params.appointmentId as string,
    req.body
  );
  res.json({
    success: true,
    data: result,
    message: "Hoàn tất khám thành công",
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
