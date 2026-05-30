import { StaffAppointment } from "../types/appointment.types";

const APPOINTMENT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const VI_LOCALE = "vi-VN";
const LAST_APPOINTMENT_SLOT_HOUR = 17;
const MIN_BOOKING_LEAD_TIME_HOURS = 1;

export function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(VI_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APPOINTMENT_TIME_ZONE,
  });
}

export function formatAppointmentTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(VI_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APPOINTMENT_TIME_ZONE,
  });
}

export function getAppointmentPetSubtitle(appointment: StaffAppointment): string {
  if (appointment.pet.breed) {
    return `${appointment.pet.breed} • ${appointment.pet.species}`;
  }
  return appointment.pet.species;
}

export function formatAppointmentDateTime(dateString: string): string {
  const dateStr = formatAppointmentDate(dateString);
  const timeStr = formatAppointmentTime(dateString);
  return `${timeStr} - ${dateStr}`;
}

export function getBookingChannelLabel(channel: "ONLINE" | "COUNTER"): string {
  switch (channel) {
    case "ONLINE":
      return "Đặt trực tuyến";
    case "COUNTER":
      return "Đặt tại quầy";
    default:
      return "Không xác định";
  }
}

export function getPetHealthStatusLabel(status: "HEALTHY" | "NEED_MONITORING" | "TREATING"): string {
  switch (status) {
    case "HEALTHY":
      return "Khỏe mạnh";
    case "NEED_MONITORING":
      return "Cần theo dõi";
    case "TREATING":
      return "Đang điều trị";
    default:
      return "";
  }
}

export function getPetHealthStatusClassName(status: "HEALTHY" | "NEED_MONITORING" | "TREATING"): string {
  switch (status) {
    case "HEALTHY":
      return "bg-petcenter-success-bg text-petcenter-success-text";
    case "NEED_MONITORING":
      return "bg-petcenter-warning-bg text-petcenter-warning-text";
    case "TREATING":
      return "bg-petcenter-danger-bg text-petcenter-danger-text";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getAppointmentDateInputValue(dateString: string): string {
  const parts = getVietnamDateParts(dateString);
  const year = parts.year;
  const month = `${parts.month}`.padStart(2, "0");
  const day = `${parts.day}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getVietnamDateParts(dateString: string) {
  const date = new Date(dateString);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APPOINTMENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    day: Number(value("day")),
    month: Number(value("month")),
    year: Number(value("year")),
    weekday: weekdayMap[value("weekday")] ?? 0,
    hour: Number(value("hour")),
    minute: Number(value("minute")),
  };
}

export function formatAppointmentDateUtc(dateString: string): string {
  const { day, month, year } = getVietnamDateParts(dateString);
  return `${`${day}`.padStart(2, "0")}/${`${month}`.padStart(2, "0")}/${year}`;
}

export function formatAppointmentTimeUtc(dateString: string): string {
  const { hour, minute } = getVietnamDateParts(dateString);
  return `${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}

export function formatAppointmentDateTimeUtc(dateString: string): string {
  return `${formatAppointmentDateUtc(dateString)} - ${formatAppointmentTimeUtc(dateString)}`;
}

export function formatAppointmentWeekdayDate(dateString: string): string {
  const { day, month, year, weekday } = getVietnamDateParts(dateString);
  const weekdayLabels = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  return `${weekdayLabels[weekday]}, ${`${day}`.padStart(2, "0")}/${`${month}`.padStart(2, "0")}/${year}`;
}

export function formatAppointmentTimeWithPeriod(dateString: string): string {
  const { hour, minute } = getVietnamDateParts(dateString);
  const period = hour < 12 ? "SA" : "CH";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${`${displayHour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")} ${period}`;
}

export function formatAppointmentDateTimeWithPeriod(dateString: string): string {
  return `${formatAppointmentDate(dateString)} - ${formatAppointmentTimeWithPeriod(dateString)}`;
}

export function getVietnamDateInputValue(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APPOINTMENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getMinAppointmentDateInputValue(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APPOINTMENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const minimumDate = new Date(date);
  const currentHour = Number(value("hour"));

  if (currentHour >= LAST_APPOINTMENT_SLOT_HOUR - MIN_BOOKING_LEAD_TIME_HOURS) {
    minimumDate.setDate(minimumDate.getDate() + 1);
  }

  return getVietnamDateInputValue(minimumDate);
}

export function buildScheduledAt(date: string, timeSlot: string): string {
  return `${date}T${timeSlot}:00+07:00`;
}
