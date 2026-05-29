import { StaffAppointment } from "../types/appointment.types";

export function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatAppointmentTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
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
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getUtcDateParts(dateString: string) {
  const date = new Date(dateString);

  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    weekday: date.getUTCDay(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

export function formatAppointmentDateUtc(dateString: string): string {
  const { day, month, year } = getUtcDateParts(dateString);
  return `${`${day}`.padStart(2, "0")}/${`${month}`.padStart(2, "0")}/${year}`;
}

export function formatAppointmentTimeUtc(dateString: string): string {
  const { hour, minute } = getUtcDateParts(dateString);
  return `${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}

export function formatAppointmentDateTimeUtc(dateString: string): string {
  return `${formatAppointmentDateUtc(dateString)} - ${formatAppointmentTimeUtc(dateString)}`;
}

export function formatAppointmentWeekdayDate(dateString: string): string {
  const { day, month, year, weekday } = getUtcDateParts(dateString);
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
  const { hour, minute } = getUtcDateParts(dateString);
  const period = hour < 12 ? "SA" : "CH";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${`${displayHour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")} ${period}`;
}

export function formatAppointmentDateTimeWithPeriod(dateString: string): string {
  return `${formatAppointmentDate(dateString)} - ${formatAppointmentTimeWithPeriod(dateString)}`;
}

export function buildScheduledAt(date: string, timeSlot: string): string {
  return `${date}T${timeSlot}:00.000Z`;
}
