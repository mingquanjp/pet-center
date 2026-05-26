export interface StaffAppointmentListRow {
  id: string;
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  profile_image_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string | null;
  owner_email: string | null;
  exam_type_id: string;
  type_code: string;
  type_name: string;
  scheduled_at: Date;
  appointment_status: string;
  symptom_description: string | null;
}

export interface StaffAppointmentStatsRow {
  pending_count: string;
  confirmed_count: string;
  rejected_count: string;
  cancelled_count: string;
  today_total_count: string;
}

export interface StaffAppointmentCountRow {
  total: string;
}
