import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendPaginated, sendSuccess } from "../../shared/responses/api-response.js";
import type {
  AvailabilityQuery,
  BookingOptionsQuery,
  CreateGroomingTicketPayload,
  GroomingTicketParams,
  ListGroomingTicketHistoryQuery,
  ListGroomingTicketsQuery
} from "./grooming.schema.js";
import * as groomingService from "./grooming.service.js";

export async function listAvailableServices(req: Request, res: Response): Promise<void> {
  const services = await groomingService.listAvailableServices(req.user!);

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

export async function listBookedTickets(req: Request, res: Response): Promise<void> {
  const result = await groomingService.listBookedTickets(req.user!, req.query as unknown as ListGroomingTicketsQuery);

  sendPaginated(res, result.tickets, result.pagination);
}

export async function listTicketHistory(req: Request, res: Response): Promise<void> {
  const result = await groomingService.listTicketHistory(req.user!, req.query as unknown as ListGroomingTicketHistoryQuery);

  sendPaginated(res, result.tickets, result.pagination);
}

export async function getBookedTicket(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as GroomingTicketParams;
  const ticket = await groomingService.getBookedTicket(req.user!, ticketId);

  sendSuccess(res, ticket);
}

export async function cancelBookedTicket(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as GroomingTicketParams;
  const ticket = await groomingService.cancelBookedTicket(req.user!, ticketId);

  sendSuccess(res, ticket, "Hủy yêu cầu dịch vụ spa thành công");
}

export async function createTicket(req: Request, res: Response): Promise<void> {
  const ticket = await groomingService.createTicket(
    req.user!,
    req.body as CreateGroomingTicketPayload,
    req.ip ?? "127.0.0.1"
  );

  sendSuccess(res, ticket, "Tạo yêu cầu dịch vụ spa thành công", httpStatus.CREATED);
}
