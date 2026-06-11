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

export async function listAvailableServices(authUser: AuthUser) {
  assertOwner(authUser);

  return groomingRepository.findActiveGroomingServices();
}

export async function getBookingOptions(authUser: AuthUser, query: BookingOptionsQuery): Promise<GroomingBookingOptionsDto> {

      assertOwner(authUser);

      const pets = await groomingRepository.findOwnerBookingPets(authUser.userId);
      const selectedPet = query.petId
        ? await groomingRepository.findOwnerBookingPet(authUser.userId, query.petId)
        : pets[0] ?? null;

      if (query.petId && !selectedPet) {
        throw new AppError("Không tìm thấy thú cưng phù hợp để đặt dịch vụ", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
      }

      if (!selectedPet) {
        return {
          pets,
          selectedPet: null,
          services: []
        };
      }

      if (selectedPet.weightKg === null) {
        throw new AppError("Cần cập nhật cân nặng thú cưng để tính giá dịch vụ spa", "PET_WEIGHT_REQUIRED", httpStatus.UNPROCESSABLE_ENTITY);
      }

      const servicePriceBases = await groomingRepository.findBookingServicePriceBases();
      const services = servicePriceBases.map((service) => groomingPricingPolicy.applyWeightBasedPrice(service, selectedPet.weightKg!));

      return {
        pets,
        selectedPet,
        services
      };
}

export async function getAvailability(authUser: AuthUser, query: AvailabilityQuery) {
  assertOwner(authUser);

  return groomingRepository.getAvailability(toVietnamDateString(query.date));
}

export async function listBookedTickets(authUser: AuthUser, query: ListGroomingTicketsQuery) {
  assertOwner(authUser);

  const page = query.page;
  const limit = query.limit;
  const result = await groomingRepository.findBookedGroomingTickets({
    ownerUserId: authUser.userId,
    search: query.search,
    petId: query.petId,
    status: query.status,
    timeRange: query.timeRange,
    limit,
    offset: (page - 1) * limit
  });

  return {
    tickets: result.tickets,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
}

export async function listTicketHistory(authUser: AuthUser, query: ListGroomingTicketHistoryQuery) {
  assertOwner(authUser);

  const page = query.page;
  const limit = query.limit;
  const result = await groomingRepository.findGroomingTicketHistory({
    ownerUserId: authUser.userId,
    search: query.search,
    petId: query.petId,
    status: query.status,
    timeRange: query.timeRange,
    limit,
    offset: (page - 1) * limit
  });

  return {
    tickets: result.tickets,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
}

export async function getBookedTicket(authUser: AuthUser, ticketId: string) {
  assertOwner(authUser);

  const ticket = await groomingRepository.findBookedGroomingTicketById(authUser.userId, ticketId);

  if (!ticket) {
    throw new AppError("Không tìm thấy yêu cầu dịch vụ spa phù hợp", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}

export async function cancelBookedTicket(authUser: AuthUser, ticketId: string) {
  assertOwner(authUser);

  try {
    const ticket = await groomingRepository.cancelBookedGroomingTicket(authUser.userId, ticketId);

    if (!ticket) {
      throw new AppError("Không tìm thấy yêu cầu dịch vụ spa phù hợp", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    return ticket;
  } catch (error) {
    if (error instanceof Error && error.message === "GROOMING_TICKET_CANCEL_NOT_ALLOWED") {
      throw new AppError("Chỉ có thể hủy yêu cầu đang chờ tiếp nhận", "GROOMING_TICKET_CANCEL_NOT_ALLOWED", httpStatus.CONFLICT);
    }

    if (error instanceof Error && error.message === "GROOMING_TICKET_PAID_CANCEL_NOT_ALLOWED") {
      throw new AppError("Yêu cầu đã thanh toán chưa hỗ trợ hủy ở bước này", "GROOMING_TICKET_PAID_CANCEL_NOT_ALLOWED", httpStatus.CONFLICT);
    }

    throw error;
  }
}

export async function createTicket(authUser: AuthUser, payload: CreateGroomingTicketPayload, clientIp: string) {

      assertOwner(authUser);
      groomingAvailabilityPolicy.assertSchedulableTime(payload.scheduledAt);

      const pet = await groomingRepository.findOwnerBookingPet(authUser.userId, payload.petId);

      if (!pet) {
        throw new AppError("Không tìm thấy thú cưng phù hợp để đặt dịch vụ", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
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
          ownerUserId: authUser.userId,
          clientIp,
          pet,
          service,
          scheduledAt: payload.scheduledAt,
          specialRequest: payload.specialRequest,
          paymentOption: payload.paymentOption
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

        if (error instanceof Error && error.message === "VNPAY_CONFIGURATION_MISSING") {
          throw new AppError("VNPay configuration is missing", "VNPAY_CONFIGURATION_MISSING", httpStatus.INTERNAL_SERVER_ERROR);
        }

        throw error;
      }
}

const timeZone = "Asia/Ho_Chi_Minh";
