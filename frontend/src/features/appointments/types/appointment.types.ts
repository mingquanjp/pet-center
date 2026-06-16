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

export type OwnerAppointmentStatus =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type OwnerAppointmentServiceType =
  | "GENERAL_CHECKUP"
  | "VACCINATION"
  | "LAB_TEST"
  | "RECHECK"
  | "GROOMING";

export interface OwnerAppointment {
  id: string;
  appointmentCode: string;
  pet: {
    id: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    imageUrl?: string;
  };
  examType: {
    id: string;
    code: OwnerAppointmentServiceType;
    name: string;
  };
  scheduledAt: string;
  status: OwnerAppointmentStatus;
  symptomDescription?: string;
}

export type OwnerAppointmentStatusFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type OwnerAppointmentPetFilter = "ALL" | string;

export interface OwnerAppointmentFilters {
  search: string;
  petId: OwnerAppointmentPetFilter;
  status: OwnerAppointmentStatusFilter;
  date: string;
}

export interface OwnerAppointmentTimelineItem {
  key: string;
  label: string;
  description?: string;
  occurredAt?: string;
  status: "DONE" | "CURRENT" | "UPCOMING";
}

export interface OwnerAppointmentDetail {
  id: string;
  appointmentCode: string;
  status: OwnerAppointmentStatus;
  serviceName: string;
  serviceType: OwnerAppointmentServiceType;
  scheduledAt: string;
  reason: string;
  note?: string;
  pet: {
    id: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    ageText?: string;
    gender?: string;
    imageUrl?: string;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  timeline: OwnerAppointmentTimelineItem[];
}

export interface OwnerAppointmentPetOption {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed?: string;
  ageText?: string;
  weightText?: string;
  imageUrl?: string;
}

export interface OwnerExamTypeOption {
  id: string;
  code: OwnerAppointmentServiceType;
  name: string;
  description?: string;
}

export interface OwnerAppointmentTimeSlot {
  value: string;
  label: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  disabled?: boolean;
  disabledReason?: "cutoff" | "full" | "outside_working_hours";
  availableUnits?: number;
}

export interface CreateOwnerAppointmentFormValues {
  petId: string;
  examTypeId: string;
  appointmentDate: string;
  timeSlot: string;
  symptomDescription: string;
  note: string;
}

export interface CreateOwnerAppointmentPayload {
  petId: string;
  examTypeId: string;
  scheduledAt: string;
  symptomDescription?: string;
  note?: string;
}

export interface CreateOwnerAppointmentResult {
  id: string;
  appointmentCode: string;
  petName: string;
  petSpecies: string;
  examTypeName: string;
  scheduledAt: string;
  status: "PENDING";
}
