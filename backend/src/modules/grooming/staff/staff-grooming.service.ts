import { AppError } from "../../../shared/errors/app-error.js";
import { httpStatus } from "../../../shared/errors/http-status.js";
import type { AuthUser } from "../../../shared/types/auth.js";
import type {
  AvailabilityQuery,
  BookingOptionsQuery,
  CreateGroomingTicketPayload,
  CreateStaffCounterGroomingTicketPayload,
  ListGroomingTicketHistoryQuery,
  ListGroomingTicketsQuery,
  StaffCounterOptionsQuery,
  StaffGroomingTicketQuery
} from "../grooming.schema.js";
import type {
  GroomingBookingOptionsDto,
  GroomingBookingServiceDto,
  GroomingBookingServicePriceBaseDto,
  StaffCounterGroomingOptionsDto
} from "../grooming.types.js";
import * as groomingRepository from "../grooming.repository.js";
import {
  notifyGroomingCreated,
  notifyGroomingAccepted,
  notifyGroomingCompleted
} from "../../notifications/notification-events.js";
import * as groomingPricingPolicy from "../grooming-pricing.policy.js";
import * as groomingAvailabilityPolicy from "../grooming-availability.policy.js";
import * as groomingStatusPolicy from "../grooming-status.policy.js";

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền thao tác với dịch vụ spa của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function assertStaff(authUser: AuthUser): void {
  if (authUser.role !== "STAFF" && authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền thao tác với yêu cầu spa", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function toVietnamDateString(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export async function listStaffAvailableServices(authUser: AuthUser) {
  assertStaff(authUser);

  return groomingRepository.findActiveGroomingServices();
}

export async function getStaffCounterAvailability(authUser: AuthUser, query: AvailabilityQuery) {
  assertStaff(authUser);

  return groomingRepository.getAvailability(toVietnamDateString(query.date));
}

export async function getStaffCounterOptions(
  authUser: AuthUser,
  query: StaffCounterOptionsQuery
): Promise<StaffCounterGroomingOptionsDto> {

      assertStaff(authUser);

      const pets = await groomingRepository.findStaffCounterPets({
        search: query.search,
        limit: query.limit
      });
      const selectedPet = query.petId ? await groomingRepository.findStaffCounterPet(query.petId) : pets[0] ?? null;

      if (query.petId && !selectedPet) {
        throw new AppError("Không tìm thấy thú cưng phù hợp để tạo yêu cầu spa", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
      }

      if (!selectedPet || selectedPet.weightKg === null) {
        return {
          pets,
          selectedPet,
          services: []
        };
      }

      const servicePriceBases = await groomingRepository.findBookingServicePriceBases();
      const services = servicePriceBases.map((service) => groomingPricingPolicy.applyWeightBasedPrice(service, selectedPet.weightKg!));

      return {
        pets,
        selectedPet,
        services
      };
}

export async function createStaffCounterTicket(
  authUser: AuthUser,
  payload: CreateStaffCounterGroomingTicketPayload
) {

      assertStaff(authUser);
      groomingAvailabilityPolicy.assertSchedulableTime(payload.scheduledAt);

      const pet = await groomingRepository.findStaffCounterPet(payload.petId);

      if (!pet) {
        throw new AppError("Không tìm thấy thú cưng phù hợp để tạo yêu cầu spa", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
      }

      if (pet.weightKg === null) {
        throw new AppError("Cần cập nhật cân nặng thú cưng để tính giá dịch vụ spa", "PET_WEIGHT_REQUIRED", httpStatus.UNPROCESSABLE_ENTITY);
      }

      const servicePriceBase = await groomingRepository.findBookingServicePriceBase(payload.serviceId);

      if (!servicePriceBase) {
        throw new AppError("Không tìm thấy dịch vụ spa hoặc bảng giá phù hợp", "GROOMING_SERVICE_NOT_FOUND", httpStatus.NOT_FOUND);
      }
      const service = groomingPricingPolicy.applyWeightBasedPrice(servicePriceBase, pet.weightKg);

      try {
        const ticket = await groomingRepository.createGroomingBooking({
          ownerUserId: pet.ownerUserId,
          createdByUserId: authUser.userId,
          sourceType: "counter",
          pet,
          service,
          scheduledAt: payload.scheduledAt,
          specialRequest: payload.specialRequest,
          paymentOption: "counter"
        });
        notifyGroomingCreated(ticket.groomingTicketId).catch(console.error);
        return ticket;
      } catch (error) {
        if (error instanceof Error && error.message === "GROOMING_SLOT_FULL") {
          throw new AppError("Khung giờ này đã đầy, vui lòng chọn khung giờ khác", "GROOMING_SLOT_FULL", httpStatus.CONFLICT);
        }

        if (error instanceof Error && error.message === "GROOMING_PET_TIME_CONFLICT") {
          throw new AppError(
            "Thú cưng này đã có lịch spa trong khung giờ đã chọn",
            "GROOMING_PET_TIME_CONFLICT",
            httpStatus.CONFLICT
          );
        }

        throw error;
      }
}

export async function listStaffTickets(authUser: AuthUser, query: StaffGroomingTicketQuery) {
  assertStaff(authUser);

  return groomingRepository.listStaffGroomingTickets(query);
}

export async function acceptStaffTicket(authUser: AuthUser, ticketId: string) {
  assertStaff(authUser);

  const currentStatus = await groomingRepository.findGroomingTicketStatus(ticketId);

  if (!currentStatus) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus !== "pending") {
    throw new AppError("Chỉ yêu cầu đang chờ tiếp nhận mới có thể tiếp nhận", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "waiting");

  if (!ticket) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  notifyGroomingAccepted(ticketId).catch(console.error);

  return ticket;
}

export async function completeStaffTicket(authUser: AuthUser, ticketId: string) {
  assertStaff(authUser);

  const currentStatus = await groomingRepository.findGroomingTicketStatus(ticketId);

  if (!currentStatus) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus !== "in_progress") {
    throw new AppError("Chỉ yêu cầu đang thực hiện mới có thể hoàn tất", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "completed");

  if (!ticket) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  notifyGroomingCompleted(ticketId).catch(console.error);

  return ticket;
}

export async function startStaffTicket(authUser: AuthUser, ticketId: string) {
  assertStaff(authUser);

  const currentStatus = await groomingRepository.findGroomingTicketStatus(ticketId);

  if (!currentStatus) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus !== "waiting") {
    throw new AppError("Chỉ yêu cầu đã tiếp nhận mới có thể bắt đầu thực hiện", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "in_progress");

  if (!ticket) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}

export async function cancelStaffTicket(authUser: AuthUser, ticketId: string) {
  assertStaff(authUser);

  const currentStatus = await groomingRepository.findGroomingTicketStatus(ticketId);

  if (!currentStatus) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    throw new AppError("Không thể hủy yêu cầu spa đã hoàn tất hoặc đã hủy", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "cancelled");

  if (!ticket) {
    throw new AppError("Không tìm thấy yêu cầu spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}

const timeZone = "Asia/Ho_Chi_Minh";
