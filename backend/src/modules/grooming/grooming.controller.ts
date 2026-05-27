import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendSuccess } from "../../shared/responses/api-response.js";
import type {
  AvailabilityQuery,
  BookingOptionsQuery,
  CreateStaffCounterGroomingTicketPayload,
  CreateGroomingTicketPayload,
  GroomingTicketParams,
  StaffCounterOptionsQuery,
  StaffGroomingTicketQuery
} from "./grooming.schema.js";
import * as groomingService from "./grooming.service.js";

export async function listAvailableServices(req: Request, res: Response): Promise<void> {
  const services = await groomingService.listAvailableServices(req.user!);

  sendSuccess(res, services);
}

export async function listStaffAvailableServices(req: Request, res: Response): Promise<void> {
  const services = await groomingService.listStaffAvailableServices(req.user!);

  sendSuccess(res, services);
}

export async function getBookingOptions(req: Request, res: Response): Promise<void> {
  const options = await groomingService.getBookingOptions(req.user!, req.query as unknown as BookingOptionsQuery);

  sendSuccess(res, options);
}

export async function getAvailability(req: Request, res: Response): Promise<void> {
  const availability = await groomingService.getAvailability(req.user!, req.query as unknown as AvailabilityQuery);

  sendSuccess(res, availability);
}

export async function getStaffCounterAvailability(req: Request, res: Response): Promise<void> {
  const availability = await groomingService.getStaffCounterAvailability(req.user!, req.query as unknown as AvailabilityQuery);

  sendSuccess(res, availability);
}

export async function createTicket(req: Request, res: Response): Promise<void> {
  const ticket = await groomingService.createTicket(req.user!, req.body as CreateGroomingTicketPayload);

  sendSuccess(res, ticket, "Tạo yêu cầu dịch vụ spa thành công", httpStatus.CREATED);
}

export async function getStaffCounterOptions(req: Request, res: Response): Promise<void> {
  const options = await groomingService.getStaffCounterOptions(req.user!, req.query as unknown as StaffCounterOptionsQuery);

  sendSuccess(res, options);
}

export async function createStaffCounterTicket(req: Request, res: Response): Promise<void> {
  const ticket = await groomingService.createStaffCounterTicket(
    req.user!,
    req.body as CreateStaffCounterGroomingTicketPayload
  );

  sendSuccess(res, ticket, "Táº¡o yÃªu cáº§u spa táº¡i quáº§y thÃ nh cÃ´ng", httpStatus.CREATED);
}

export async function listStaffTickets(req: Request, res: Response): Promise<void> {
  const tickets = await groomingService.listStaffTickets(req.user!, req.query as unknown as StaffGroomingTicketQuery);

  sendSuccess(res, tickets);
}

export async function acceptStaffTicket(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as unknown as GroomingTicketParams;
  const ticket = await groomingService.acceptStaffTicket(req.user!, ticketId);

  sendSuccess(res, ticket, "Tiếp nhận yêu cầu spa thành công");
}

export async function completeStaffTicket(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as unknown as GroomingTicketParams;
  const ticket = await groomingService.completeStaffTicket(req.user!, ticketId);

  sendSuccess(res, ticket, "Hoàn tất yêu cầu spa thành công");
}

export async function cancelStaffTicket(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as unknown as GroomingTicketParams;
  const ticket = await groomingService.cancelStaffTicket(req.user!, ticketId);

  sendSuccess(res, ticket, "Hủy yêu cầu spa thành công");
}
