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
