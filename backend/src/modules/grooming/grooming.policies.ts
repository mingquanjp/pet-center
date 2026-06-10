import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { GroomingTicketStatus, GroomingBookingServicePriceBaseDto, GroomingBookingServiceDto } from "./grooming.types.js";
import {
  notifyGroomingCreated,
  notifyGroomingAccepted,
  notifyGroomingCompleted
} from "../notifications/notification-events.js";

const timeZone = "Asia/Ho_Chi_Minh";
const firstSlotHour = 8;
const lastSlotHour = 17;
const lastSlotMinute = 30;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function getVietnamTimeParts(value: Date): { hour: number; minute: number } {
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

export function assertSchedulableTime(scheduledAt: Date): void {
  if (scheduledAt.getTime() <= Date.now()) {
    throw new AppError("Thời gian đặt dịch vụ phải ở tương lai", "INVALID_SCHEDULE_TIME", httpStatus.BAD_REQUEST);
  }

  const { hour, minute } = getVietnamTimeParts(scheduledAt);
  const isValidMinute = minute === 0 || minute === 30;
  const isBeforeOpening = hour < firstSlotHour;
  const isAfterClosing = hour > lastSlotHour || (hour === lastSlotHour && minute > lastSlotMinute);

  if (!isValidMinute || isBeforeOpening || isAfterClosing) {
    throw new AppError(
      "Thời gian đặt dịch vụ phải nằm trong khung 08:00 - 17:30 và cách nhau 30 phút",
      "INVALID_SCHEDULE_TIME",
      httpStatus.BAD_REQUEST
    );
  }
}

export function assertGroomingTransition(
  currentStatus: GroomingTicketStatus,
  targetStatus: GroomingTicketStatus
): void {
  const allowedTransitions: Record<GroomingTicketStatus, GroomingTicketStatus[]> = {
    pending_payment: ["pending", "cancelled"],
    pending: ["waiting", "cancelled"],
    waiting: ["in_progress", "cancelled"],
    in_progress: ["completed"],
    completed: [],
    cancelled: []
  };

  const allowed = allowedTransitions[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new AppError(
      `Không thể chuyển trạng thái vé spa từ ${currentStatus} sang ${targetStatus}`,
      "INVALID_STATUS_TRANSITION",
      httpStatus.BAD_REQUEST
    );
  }
}

export function assertOwnerCanCancelTicket(
  status: GroomingTicketStatus,
  invoiceStatus: string | null,
  hasSuccessPayment: boolean
): void {
  if (status !== "pending" || invoiceStatus === "paid" || hasSuccessPayment) {
    throw new AppError(
      "Không thể hủy vé spa lúc này. Xin vui lòng liên hệ với trung tâm để được hỗ trợ",
      "CANNOT_CANCEL_TICKET",
      httpStatus.BAD_REQUEST
    );
  }
}

const largePetThresholdKg = 5;
const largePetSurchargeStepKg = 3;
const largePetSurchargeAmount = 50000;

export function calculateGroomingPrice(basePrice: number, weightKg: number): number {
  if (weightKg < largePetThresholdKg) {
    return basePrice;
  }
  const surchargeSteps = Math.floor((weightKg - largePetThresholdKg) / largePetSurchargeStepKg);
  return basePrice + surchargeSteps * largePetSurchargeAmount;
}

export function getAppliedPricingConditionLabel(weightKg: number): string {
  if (weightKg < largePetThresholdKg) {
    return "Dưới 5kg";
  }
  const surchargeSteps = Math.floor((weightKg - largePetThresholdKg) / largePetSurchargeStepKg);
  if (surchargeSteps === 0) {
    return "Từ 5kg trở lên";
  }
  return `Từ 5kg trở lên (+${formatMoney(surchargeSteps * largePetSurchargeAmount)} VND)`;
}

export function applyWeightBasedPrice(
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

export const groomingNotificationPublisher = {
  groomingCreated: async (ticketId: string) => {
    return notifyGroomingCreated(ticketId).catch((error) => {
      console.error("[Notification] Failed to publish grooming created event", error);
    });
  },
  groomingAccepted: async (ticketId: string) => {
    return notifyGroomingAccepted(ticketId).catch((error) => {
      console.error("[Notification] Failed to publish grooming accepted event", error);
    });
  },
  groomingCompleted: async (ticketId: string) => {
    return notifyGroomingCompleted(ticketId).catch((error) => {
      console.error("[Notification] Failed to publish grooming completed event", error);
    });
  }
};
