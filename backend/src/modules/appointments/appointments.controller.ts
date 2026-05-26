import type { Request, Response } from "express";
import { appointmentService } from "./appointments.service.js";
import { sendSuccess, sendPaginated } from "../../shared/responses/api-response.js";
import { CreateAppointmentInput, AppointmentListQuery } from "./appointments.types.js";
import { httpStatus } from "../../shared/errors/http-status.js";

export const createAppointment = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const data = req.body as CreateAppointmentInput;

  const result = await appointmentService.createAppointment(userId, data);
  sendSuccess(res, result, "Tạo lịch hẹn thành công", httpStatus.CREATED);
};

export const getMyList = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const filter = req.query as unknown as AppointmentListQuery;

  const { data, pagination } = await appointmentService.getMyList(userId, filter);
  sendPaginated(res, data, pagination);
};

export const getDetail = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params as { id: string };

  const result = await appointmentService.getDetail(id, userId);
  sendSuccess(res, result);
};

export const cancelAppointment = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params as { id: string };

  const result = await appointmentService.cancelAppointment(id, userId);
  sendSuccess(res, result, "Hủy lịch hẹn thành công");
};
