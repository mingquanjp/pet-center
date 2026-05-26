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
