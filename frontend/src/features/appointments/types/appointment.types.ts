export type StaffAppointmentStatus =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

export type StaffAppointmentTab =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

export type StaffAppointmentServiceType =
  | "GENERAL_CHECKUP"
  | "VACCINATION"
  | "LAB_TEST"
  | "RECHECK";

export interface StaffAppointment {
  id: string;
  appointmentCode: string;
  pet: {
    id: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    imageUrl?: string;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  examType: {
    id: string;
    code: StaffAppointmentServiceType;
    name: string;
  };
  scheduledAt: string;
  bookingChannel: "ONLINE" | "COUNTER";
  status: StaffAppointmentStatus;
  symptomDescription?: string;
}

export type StaffAppointmentStatusFilter =
  | "ALL"
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

export type StaffAppointmentServiceFilter =
  | "ALL"
  | "GENERAL_CHECKUP"
  | "VACCINATION"
  | "LAB_TEST"
  | "RECHECK";

export interface StaffAppointmentFilters {
  search: string;
  status: StaffAppointmentStatusFilter;
  serviceType: StaffAppointmentServiceFilter;
  date: string;
  tab: StaffAppointmentTab;
  page: number;
  limit: number;
}
