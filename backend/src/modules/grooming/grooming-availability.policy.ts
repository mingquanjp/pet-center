
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";

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

export const timeZone = "Asia/Ho_Chi_Minh";
export const firstSlotHour = 8;
export const lastSlotHour = 17;
export const lastSlotMinute = 30;
