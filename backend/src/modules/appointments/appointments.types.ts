export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface CreateAppointmentInput {
  petId: string;
  appointmentType: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  symptoms?: string;
  note?: string;
}

export interface AppointmentRecord {
  id: string; // UUID
  appointment_code: string;
  user_id: string;
  pet_id: string;
  appointment_type: string;
  appointment_date: Date;
  appointment_time: string; // HH:mm:ss format typically from pg
  symptoms: string | null;
  note: string | null;
  status: AppointmentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentListQuery {
  keyword?: string;
  petId?: string;
  status?: AppointmentStatus;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  page: number;
  limit: number;
}
