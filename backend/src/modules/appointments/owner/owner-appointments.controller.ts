import type { Request, Response } from "express";
import * as ownerAppointmentsService from "./owner-appointments.service.js";

export async function listOwnerAppointments(req: Request, res: Response) {
  const result = await ownerAppointmentsService.listOwnerAppointments(req.user!.userId, req.query as any);
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function getOwnerAppointmentDetail(req: Request, res: Response) {
  const result = await ownerAppointmentsService.getOwnerAppointmentDetail(
    req.user!.userId,
    req.params.appointmentId as string,
  );
  res.json({
    success: true,
    data: result,
  });
}

export async function getOwnerAppointmentCreateOptions(req: Request, res: Response) {
  const result = await ownerAppointmentsService.getOwnerAppointmentCreateOptions(req.user!.userId);
  res.json({
    success: true,
    data: result,
  });
}

export async function getOwnerAvailableSlots(req: Request, res: Response) {
  const result = await ownerAppointmentsService.getOwnerAvailableSlots(
    req.query.date as string,
    req.query.examTypeId as string | undefined,
  );
  res.json({
    success: true,
    data: result,
  });
}

export async function createOwnerAppointment(req: Request, res: Response) {
  const result = await ownerAppointmentsService.createOwnerAppointment(req.user!.userId, req.body);
  res.status(201).json({
    success: true,
    data: result,
    message: "Tạo lịch hẹn thành công",
  });
}

export async function cancelOwnerAppointment(req: Request, res: Response) {
  const result = await ownerAppointmentsService.cancelOwnerAppointment(
    req.user!.userId,
    req.params.appointmentId as string,
    req.body,
  );
  res.json({
    success: true,
    data: result,
    message: "Hủy lịch hẹn thành công",
  });
}
