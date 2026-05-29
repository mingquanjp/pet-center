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

export type StaffAppointmentDetailMode = "PROCESS" | "VIEW";

export interface StaffAssignedDoctor {
  id: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
}

export interface StaffDoctorScheduleItem {
  appointmentId: string;
  startsAt: string;
  endsAt: string;
}

export interface StaffDoctor {
  id: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
  workingStatus: "ACTIVE" | "INACTIVE";
  schedules: StaffDoctorScheduleItem[];
}

export type DoctorAssignmentStatus =
  | "ASSIGNED"
  | "NO_AVAILABLE_DOCTOR";

export interface StaffAppointmentDetail {
  id: string;
  appointmentCode: string;
  pet: {
    id: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    imageUrl?: string;
    ageText?: string;
    weightText?: string;
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
  ownerNote?: string;
  assignedDoctor?: StaffAssignedDoctor | null;
  suggestedDoctor?: StaffAssignedDoctor | null;
  assignmentStatus?: DoctorAssignmentStatus;
  rejectionReason?: string;
}

export type AppointmentProcessAction = "CONFIRM" | "REJECT";
