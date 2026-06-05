import type { QueryResultRow } from "pg";

export type ListDoctorPrescriptionsFilters = {
  search?: string;
  date?: string;
  page: number;
  limit: number;
};

export type DoctorPrescriptionListRow = QueryResultRow & {
  prescription_id: string;
  exam_id: string;
  appointment_id: string;
  prescribed_at: string;
  general_note: string | null;
  diagnosis: string | null;
  conclusion: string | null;
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  estimated_age: string | null;
  profile_image_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string | null;
  doctor_name: string;
  medicine_count: string;
  has_follow_up: boolean;
};

export type DoctorPrescriptionStatsRow = QueryResultRow & {
  total_count: string;
  today_count: string;
  follow_up_count: string;
};

export type DoctorPrescriptionDetailRow = QueryResultRow & {
  prescription_id: string;
  exam_id: string;
  appointment_id: string;
  prescribed_at: string;
  general_note: string | null;
  diagnosis: string | null;
  conclusion: string | null;
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  estimated_age: string | null;
  profile_image_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string | null;
  doctor_id: string;
  doctor_name: string;
  follow_up_id: string | null;
  follow_up_date: string | null;
  follow_up_reason: string | null;
  follow_up_owner_note: string | null;
};

export type DoctorPrescriptionItemRow = QueryResultRow & {
  prescription_item_id: string;
  medicine_id: string;
  medicine_name: string;
  quantity: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  usage_instruction: string | null;
  note: string | null;
};
