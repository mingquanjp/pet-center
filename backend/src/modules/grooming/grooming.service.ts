import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import type { AvailabilityQuery, BookingOptionsQuery, CreateGroomingTicketPayload } from "./grooming.schema.js";
import type { GroomingBookingOptionsDto } from "./grooming.types.js";
import * as groomingRepository from "./grooming.repository.js";

const timeZone = "Asia/Ho_Chi_Minh";
const firstSlotHour = 8;
const lastSlotHour = 17;
const lastSlotMinute = 30;

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền thao tác với dịch vụ spa của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function getPricingCondition(weightKg: number): "UNDER_5KG" | "FROM_5KG" {
  return weightKg < 5 ? "UNDER_5KG" : "FROM_5KG";
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

  const services = await groomingRepository.findBookingServicesForCondition(getPricingCondition(selectedPet.weightKg));

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

  const pricingCondition = getPricingCondition(pet.weightKg);
  const service = await groomingRepository.findBookingServiceForCondition(payload.serviceId, pricingCondition);

  if (!service) {
    throw new AppError("Không tìm thấy dịch vụ spa hoặc bảng giá phù hợp", "GROOMING_SERVICE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

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
