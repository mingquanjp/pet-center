import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import type {
  AvailabilityQuery,
  BookingOptionsQuery,
  CreateGroomingTicketPayload,
  CreateStaffCounterGroomingTicketPayload,
  ListGroomingTicketHistoryQuery,
  ListGroomingTicketsQuery,
  StaffCounterOptionsQuery,
  StaffGroomingTicketQuery
} from "./grooming.schema.js";
import type {
  GroomingBookingOptionsDto,
  GroomingBookingServiceDto,
  GroomingBookingServicePriceBaseDto,
  StaffCounterGroomingOptionsDto
} from "./grooming.types.js";
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
    throw new AppError("Ban khong co quyen thao tac voi dich vu spa cua chu nuoi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function assertStaff(authUser: AuthUser): void {
  if (authUser.role !== "STAFF" && authUser.role !== "ADMIN") {
    throw new AppError("Ban khong co quyen thao tac voi yeu cau spa", "FORBIDDEN", httpStatus.FORBIDDEN);
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

function getAppliedPricingConditionLabel(weightKg: number): string {
  if (weightKg < largePetThresholdKg) {
    return "Duoi 5kg";
  }

  const surchargeSteps = Math.floor((weightKg - largePetThresholdKg) / largePetSurchargeStepKg);

  if (surchargeSteps === 0) {
    return "Tu 5kg tro len";
  }

  return `Tu 5kg tro len (+${formatMoney(surchargeSteps * largePetSurchargeAmount)} VND)`;
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
    appliedPricingConditionLabel: getAppliedPricingConditionLabel(weightKg),
    priceText: `${formatMoney(appliedPrice)} VND`
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
    throw new AppError("Thoi gian dat dich vu phai o tuong lai", "INVALID_SCHEDULE_TIME", httpStatus.BAD_REQUEST);
  }

  const { hour, minute } = getVietnamTimeParts(scheduledAt);
  const isValidMinute = minute === 0 || minute === 30;
  const isBeforeOpening = hour < firstSlotHour;
  const isAfterClosing = hour > lastSlotHour || (hour === lastSlotHour && minute > lastSlotMinute);

  if (!isValidMinute || isBeforeOpening || isAfterClosing) {
    throw new AppError(
      "Thoi gian dat dich vu phai nam trong khung 08:00 - 17:30 va cach nhau 30 phut",
      "INVALID_SCHEDULE_TIME",
      httpStatus.BAD_REQUEST
    );
  }
}

export async function listAvailableServices(authUser: AuthUser) {
  assertOwner(authUser);

  return groomingRepository.findActiveGroomingServices();
}

export async function listStaffAvailableServices(authUser: AuthUser) {
  assertStaff(authUser);

  return groomingRepository.findActiveGroomingServices();
}

export async function getBookingOptions(authUser: AuthUser, query: BookingOptionsQuery): Promise<GroomingBookingOptionsDto> {
  assertOwner(authUser);

  const pets = await groomingRepository.findOwnerBookingPets(authUser.userId);
  const selectedPet = query.petId
    ? await groomingRepository.findOwnerBookingPet(authUser.userId, query.petId)
    : pets[0] ?? null;

  if (query.petId && !selectedPet) {
    throw new AppError("Khong tim thay thu cung phu hop de dat dich vu", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (!selectedPet) {
    return {
      pets,
      selectedPet: null,
      services: []
    };
  }

  if (selectedPet.weightKg === null) {
    throw new AppError("Can cap nhat can nang thu cung de tinh gia dich vu spa", "PET_WEIGHT_REQUIRED", httpStatus.UNPROCESSABLE_ENTITY);
  }

  const servicePriceBases = await groomingRepository.findBookingServicePriceBases();
  const services = servicePriceBases.map((service) => applyWeightBasedPrice(service, selectedPet.weightKg!));

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

export async function getStaffCounterAvailability(authUser: AuthUser, query: AvailabilityQuery) {
  assertStaff(authUser);

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
    throw new AppError("Khong tim thay yeu cau dich vu spa phu hop", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}

export async function cancelBookedTicket(authUser: AuthUser, ticketId: string) {
  assertOwner(authUser);

  try {
    const ticket = await groomingRepository.cancelBookedGroomingTicket(authUser.userId, ticketId);

    if (!ticket) {
      throw new AppError("Khong tim thay yeu cau dich vu spa phu hop", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    return ticket;
  } catch (error) {
    if (error instanceof Error && error.message === "GROOMING_TICKET_CANCEL_NOT_ALLOWED") {
      throw new AppError("Chi co the huy yeu cau dang cho tiep nhan", "GROOMING_TICKET_CANCEL_NOT_ALLOWED", httpStatus.CONFLICT);
    }

    if (error instanceof Error && error.message === "GROOMING_TICKET_PAID_CANCEL_NOT_ALLOWED") {
      throw new AppError("Yeu cau da thanh toan chua ho tro huy o buoc nay", "GROOMING_TICKET_PAID_CANCEL_NOT_ALLOWED", httpStatus.CONFLICT);
    }

    throw error;
  }
}

export async function createTicket(authUser: AuthUser, payload: CreateGroomingTicketPayload) {
  assertOwner(authUser);
  assertSchedulableTime(payload.scheduledAt);

  const pet = await groomingRepository.findOwnerBookingPet(authUser.userId, payload.petId);

  if (!pet) {
    throw new AppError("Khong tim thay thu cung phu hop de dat dich vu", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (pet.weightKg === null) {
    throw new AppError("Can cap nhat can nang thu cung de tinh gia dich vu spa", "PET_WEIGHT_REQUIRED", httpStatus.UNPROCESSABLE_ENTITY);
  }

  const servicePriceBase = await groomingRepository.findBookingServicePriceBase(payload.serviceId);

  if (!servicePriceBase) {
    throw new AppError("Khong tim thay dich vu spa hoac bang gia phu hop", "GROOMING_SERVICE_NOT_FOUND", httpStatus.NOT_FOUND);
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
      throw new AppError("Khung gio nay da day, vui long chon khung gio khac", "GROOMING_SLOT_FULL", httpStatus.CONFLICT);
    }

    if (error instanceof Error && error.message === "GROOMING_PET_TIME_CONFLICT") {
      throw new AppError(
        "Thu cung nay da co lich spa trong khung gio da chon",
        "GROOMING_PET_TIME_CONFLICT",
        httpStatus.CONFLICT
      );
    }

    throw error;
  }
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
    throw new AppError("Khong tim thay thu cung phu hop de tao yeu cau spa", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (!selectedPet || selectedPet.weightKg === null) {
    return {
      pets,
      selectedPet,
      services: []
    };
  }

  const servicePriceBases = await groomingRepository.findBookingServicePriceBases();
  const services = servicePriceBases.map((service) => applyWeightBasedPrice(service, selectedPet.weightKg!));

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
  assertSchedulableTime(payload.scheduledAt);

  const pet = await groomingRepository.findStaffCounterPet(payload.petId);

  if (!pet) {
    throw new AppError("Khong tim thay thu cung phu hop de tao yeu cau spa", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (pet.weightKg === null) {
    throw new AppError("Can cap nhat can nang thu cung de tinh gia dich vu spa", "PET_WEIGHT_REQUIRED", httpStatus.UNPROCESSABLE_ENTITY);
  }

  const servicePriceBase = await groomingRepository.findBookingServicePriceBase(payload.serviceId);

  if (!servicePriceBase) {
    throw new AppError("Khong tim thay dich vu spa hoac bang gia phu hop", "GROOMING_SERVICE_NOT_FOUND", httpStatus.NOT_FOUND);
  }
  const service = applyWeightBasedPrice(servicePriceBase, pet.weightKg);

  try {
    return await groomingRepository.createGroomingBooking({
      ownerUserId: pet.ownerUserId,
      createdByUserId: authUser.userId,
      sourceType: "counter",
      pet,
      service,
      scheduledAt: payload.scheduledAt,
      specialRequest: payload.specialRequest,
      paymentOption: "counter"
    });
  } catch (error) {
    if (error instanceof Error && error.message === "GROOMING_SLOT_FULL") {
      throw new AppError("Khung gio nay da day, vui long chon khung gio khac", "GROOMING_SLOT_FULL", httpStatus.CONFLICT);
    }

    if (error instanceof Error && error.message === "GROOMING_PET_TIME_CONFLICT") {
      throw new AppError(
        "Thu cung nay da co lich spa trong khung gio da chon",
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
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus !== "pending") {
    throw new AppError("Chi yeu cau dang cho tiep nhan moi co the tiep nhan", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "waiting");

  if (!ticket) {
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}

export async function completeStaffTicket(authUser: AuthUser, ticketId: string) {
  assertStaff(authUser);

  const currentStatus = await groomingRepository.findGroomingTicketStatus(ticketId);

  if (!currentStatus) {
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus !== "in_progress") {
    throw new AppError("Chi yeu cau dang thuc hien moi co the hoan tat", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "completed");

  if (!ticket) {
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}

export async function startStaffTicket(authUser: AuthUser, ticketId: string) {
  assertStaff(authUser);

  const currentStatus = await groomingRepository.findGroomingTicketStatus(ticketId);

  if (!currentStatus) {
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus !== "waiting") {
    throw new AppError("Chi yeu cau da tiep nhan moi co the bat dau thuc hien", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "in_progress");

  if (!ticket) {
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}

export async function cancelStaffTicket(authUser: AuthUser, ticketId: string) {
  assertStaff(authUser);

  const currentStatus = await groomingRepository.findGroomingTicketStatus(ticketId);

  if (!currentStatus) {
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    throw new AppError("Khong the huy yeu cau spa da hoan tat hoac da huy", "INVALID_GROOMING_STATUS", httpStatus.CONFLICT);
  }

  const ticket = await groomingRepository.updateGroomingTicketStatus(ticketId, "cancelled");

  if (!ticket) {
    throw new AppError("Khong tim thay yeu cau spa", "GROOMING_TICKET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return ticket;
}
