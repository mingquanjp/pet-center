export type OwnerAppointmentStatusDto =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type OwnerAppointmentServiceTypeDto =
  | "GENERAL_CHECKUP"
  | "VACCINATION"
  | "LAB_TEST"
  | "RECHECK"
  | "GROOMING";

export interface OwnerAppointmentListQuery {
  search?: string;
  petId?: string;
  status?: OwnerAppointmentStatusDto;
  date?: string;
  page: number;
  limit: number;
}

export interface OwnerAppointmentListRow {
  appointment_id: string;
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  profile_image_url: string | null;
  exam_type_id: string;
  type_code: string;
  type_name: string;
  scheduled_at: Date;
  appointment_status: string;
  symptom_description: string | null;
  completed_exam_id: string | null;
}

export interface OwnerAppointmentDetailRow extends OwnerAppointmentListRow {
  owner_user_id: string;
  internal_note: string | null;
  rejection_reason: string | null;
  birth_date: Date | null;
  estimated_age: string | null;
  gender: string | null;
  owner_full_name: string;
  owner_phone_number: string | null;
  owner_email: string | null;
}

export interface OwnerPetOptionRow {
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  birth_date: Date | null;
  estimated_age: string | null;
  profile_image_url: string | null;
}

export interface OwnerExamTypeOptionRow {
  exam_type_id: string;
  type_code: string;
  type_name: string;
  description: string | null;
}

export interface OwnerAppointmentCountRow {
  total: string;
}

export interface OwnerAppointmentDto {
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
    code: OwnerAppointmentServiceTypeDto;
    name: string;
  };
  scheduledAt: string;
  status: OwnerAppointmentStatusDto;
  symptomDescription?: string;
}

export interface OwnerAppointmentTimelineItemDto {
  key: string;
  label: string;
  description?: string;
  occurredAt?: string;
  status: "DONE" | "CURRENT" | "UPCOMING";
}

export interface OwnerAppointmentDetailDto {
  id: string;
  appointmentCode: string;
  status: OwnerAppointmentStatusDto;
  serviceName: string;
  serviceType: OwnerAppointmentServiceTypeDto;
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
  timeline: OwnerAppointmentTimelineItemDto[];
}

export interface OwnerAppointmentPetOptionDto {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed?: string;
  ageText?: string;
  imageUrl?: string;
}

export interface OwnerExamTypeOptionDto {
  id: string;
  code: OwnerAppointmentServiceTypeDto;
  name: string;
  description?: string;
}

export interface OwnerAppointmentTimeSlotDto {
  value: string;
  label: string;
  disabled?: boolean;
  availableUnits: number;
}

export interface CreateOwnerAppointmentBody {
  petId: string;
  examTypeId: string;
  scheduledAt: string;
  symptomDescription?: string;
  note?: string;
}

export interface CreateOwnerAppointmentResultDto {
  id: string;
  appointmentCode: string;
  petName: string;
  petSpecies: string;
  examTypeName: string;
  scheduledAt: string;
  status: "PENDING";
}

export interface CancelOwnerAppointmentBody {
  reason?: string;
}
