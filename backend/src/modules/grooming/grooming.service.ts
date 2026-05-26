import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import type { AvailabilityQuery, BookingOptionsQuery, CreateGroomingTicketPayload, ListGroomingTicketsQuery } from "./grooming.schema.js";
import type { GroomingBookingOptionsDto, GroomingBookingServiceDto, GroomingBookingServicePriceBaseDto } from "./grooming.types.js";
import * as groomingRepository from "./grooming.repository.js";

const timeZone = "Asia/Ho_Chi_Minh";
const firstSlotHour = 8;
const lastSlotHour = 17;
const lastSlotMinute = 30;
const largePetThresholdKg = 5;
const largePetSurchargeStepKg = 3;
const largePetSurchargeAmount = 50000;

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền thao tác với dịch vụ spa của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function calculateGroomingPrice(basePrice: number, weightKg: number): number {
  if (weightKg < largePetThresholdKg) {
    return basePrice;
  }

  const surchargeSteps = Math.floor((weightKg - largePetThresholdKg) / largePetSurchargeStepKg);

  return basePrice + surchargeSteps * largePetSurchargeAmount;
}

function getAppliedPricingCondition(weightKg: number): "UNDER_5KG" | "FROM_5KG_INCREMENTAL" {
  return weightKg < largePetThresholdKg ? "UNDER_5KG" : "FROM_5KG_INCREMENTAL";
}

function getAppliedPricingConditionLabel(weightKg: number): string {
  if (weightKg < largePetThresholdKg) {
    return "Dưới 5kg";
  }

  const surchargeSteps = Math.floor((weightKg - largePetThresholdKg) / largePetSurchargeStepKg);

  if (surchargeSteps === 0) {
    return "Từ 5kg trở lên";
  }

  return `Từ 5kg trở lên (+${formatMoney(surchargeSteps * largePetSurchargeAmount)} VNĐ)`;
}

function applyWeightBasedPrice(
  service: GroomingBookingServicePriceBaseDto,
  weightKg: number
): GroomingBookingServiceDto {
  const appliedPrice = calculateGroomingPrice(service.basePrice, weightKg);

  return {
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    description: service.description,
    estimatedDurationMinutes: service.estimatedDurationMinutes,
    durationText: service.durationText,
    appliedPrice,
    appliedPricingCondition: getAppliedPricingCondition(weightKg),
    appliedPricingConditionLabel: getAppliedPricingConditionLabel(weightKg),
    priceText: `${formatMoney(appliedPrice)} VNĐ`
  };
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

function getVietnamTimeParts(value: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(value);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value),
    minute: Number(parts.find((part) => part.type === "minute")?.value)
  };
}

function assertSchedulableTime(scheduledAt: Date): void {
  if (scheduledAt.getTime() <= Date.now()) {
    throw new AppError("Thời gian đặt dịch vụ phải ở tương lai", "INVALID_SCHEDULE_TIME", httpStatus.BAD_REQUEST);
  }

  const { hour, minute } = getVietnamTimeParts(scheduledAt);
  const isValidMinute = minute === 0 || minute === 30;
  const isBeforeOpening = hour < firstSlotHour;
  const isAfterClosing = hour > lastSlotHour || (hour === lastSlotHour && minute > lastSlotMinute);

  if (!isValidMinute || isBeforeOpening || isAfterClosing) {
    throw new AppError("Thời gian đặt dịch vụ phải nằm trong khung 08:00 - 17:30 và cách nhau 30 phút", "INVALID_SCHEDULE_TIME", httpStatus.BAD_REQUEST);
  }
}

export async function listAvailableServices(_authUser: AuthUser) {
  assertOwner(_authUser);

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

  const selectedPetWeightKg = selectedPet.weightKg;
  const servicePriceBases = await groomingRepository.findBookingServicePriceBases();
  const services = servicePriceBases.map((service) => applyWeightBasedPrice(service, selectedPetWeightKg));

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

export async function createTicket(authUser: AuthUser, payload: CreateGroomingTicketPayload) {
  assertOwner(authUser);
  assertSchedulableTime(payload.scheduledAt);

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

  const service = applyWeightBasedPrice(servicePriceBase, pet.weightKg);

  try {
    return await groomingRepository.createGroomingBooking({
      ownerUserId: authUser.userId,
      pet,
      service,
      scheduledAt: payload.scheduledAt,
      specialRequest: payload.specialRequest,
      paymentOption: payload.paymentOption
    });
  } catch (error) {
    if (error instanceof Error && error.message === "GROOMING_SLOT_FULL") {
      throw new AppError("Khung giờ này đã đầy, vui lòng chọn khung giờ khác", "GROOMING_SLOT_FULL", httpStatus.CONFLICT);
    }

    throw error;
  }
}
