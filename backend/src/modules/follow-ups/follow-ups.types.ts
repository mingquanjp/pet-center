import type { QueryResultRow } from "pg";

export type FollowUpEffectiveStatus = "upcoming" | "overdue" | "completed";

export type ListDoctorFollowUpsFilters = {
  search?: string;
  status?: FollowUpEffectiveStatus;
  date?: string;
  page: number;
  limit: number;
};

export type DoctorFollowUpListRow = QueryResultRow & {
  follow_up_id: string;
  exam_id: string;
  appointment_id: string;
  follow_up_date: string;
  reason: string;
  owner_note: string | null;
  follow_up_status: string;
  completed_at: string | null;
  effective_status: FollowUpEffectiveStatus;
  exam_date: string;
  diagnosis: string | null;
  conclusion: string | null;
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birth_date: string | null;
  estimated_age: string | null;
  profile_image_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string | null;
  owner_email: string;
  doctor_id: string;
  doctor_name: string;
  medicine_count: string;
};

export type DoctorFollowUpStatsRow = QueryResultRow & {
  upcoming_count: string;
  overdue_count: string;
  completed_count: string;
};

export type DoctorFollowUpDetailRow = DoctorFollowUpListRow & {
  health_note: string | null;
  prescribed_at: string | null;
  general_note: string | null;
  prescription_id: string | null;
};
