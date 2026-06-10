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

export type StaffAppointmentStatusDto =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

export type StaffAppointmentServiceTypeDto =
  | "GENERAL_CHECKUP"
  | "VACCINATION"
  | "LAB_TEST"
  | "RECHECK";

export type StaffBookingChannelDto = "ONLINE" | "COUNTER";

export type DoctorAssignmentStatusDto = "ASSIGNED" | "NO_AVAILABLE_DOCTOR";

export interface StaffAssignedDoctorDto {
  id: string;
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface StaffAppointmentDetailDto {
  id: string;
  appointmentCode: string;
  status: StaffAppointmentStatusDto;
  pet: {
    id: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string | null;
    imageUrl?: string | null;
    ageText?: string | null;
    weightText?: string | null;
    healthStatus?: "HEALTHY" | "NEED_MONITORING" | "TREATING";
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber?: string | null;
    email?: string | null;
  };
  examType: {
    id: string;
    code: StaffAppointmentServiceTypeDto;
    name: string;
  };
  scheduledAt: string;
  bookingChannel: StaffBookingChannelDto;
  symptomDescription?: string | null;
  ownerNote?: string | null;
  assignedDoctor?: StaffAssignedDoctorDto | null;
  suggestedDoctor?: StaffAssignedDoctorDto | null;
  assignmentStatus?: DoctorAssignmentStatusDto;
  rejectionReason?: string | null;
}

export interface ConfirmStaffAppointmentBody {
  doctorUserId?: string;
  internalNote?: string;
}

export interface RejectStaffAppointmentBody {
  rejectionReason: string;
  internalNote?: string;
}

export interface AppointmentDetailRow {
  appointment_id: string;
  pet_id: string;
  owner_user_id: string;
  exam_type_id: string;
  veterinarian_user_id: string | null;
  scheduled_at: Date;
  symptom_description: string | null;
  appointment_status: string;
  internal_note: string | null;
  rejection_reason: string | null;
  handled_by_staff_id: string | null;
  
  pet_name: string;
  species: string;
  breed: string | null;
  profile_image_url: string | null;
  birth_date: Date | null;
  weight_kg: string | null;
  
  owner_full_name: string;
  owner_phone_number: string | null;
  owner_email: string | null;
  
  type_code: string;
  type_name: string;

  doctor_full_name: string | null;
  doctor_phone_number: string | null;
  doctor_email: string | null;
  doctor_avatar: string | null;
}

export interface AvailableDoctorRow {
  user_id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  profile_image_url: string | null;
  confirmed_count_in_day: string;
}

export interface PendingAppointmentAssignmentRow {
  appointment_id: string;
  scheduled_at: Date;
}

export type DoctorExaminationStatusDto =
  | "WAITING"
  | "EXAMINING"
  | "COMPLETED"
  | "FOLLOW_UP";

export interface DoctorExaminationListRow {
  id: string;
  exam_id: string | null;
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  birth_date: Date | null;
  estimated_age: string | null;
  profile_image_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string | null;
  owner_email: string | null;
  exam_type_id: string;
  type_code: string;
  type_name: string;
  scheduled_at: Date;
  symptom_description: string | null;
  internal_note: string | null;
  doctor_id?: string | null;
  doctor_name?: string | null;
  examination_status: string;
}

export interface DoctorExaminationStatsRow {
  total_count: string;
  waiting_count: string;
  examining_count: string;
  completed_count: string;
  follow_up_count: string;
}

export interface DoctorExaminationCountRow {
  total: string;
}

export interface DoctorExaminationFieldDefinitionRow {
  field_definition_id: string;
  field_name: string;
  field_label: string;
  field_type: "text" | "number" | "date" | "select" | "file";
  is_required: boolean;
  display_order: number;
  option_source: string | null;
}

export interface DoctorExaminationFieldValueRow {
  field_definition_id: string;
  value_text: string | null;
  value_number: string | null;
  value_date: string | null;
  file_url: string | null;
}

export interface DoctorExaminationDetailRow extends DoctorExaminationListRow {
  gender: string | null;
  weight_kg: string | null;
  diagnosis: string | null;
  conclusion: string | null;
  health_note: string | null;
  exam_status: string | null;
  exam_date: string | null;
}

export interface DoctorExaminationHistoryRow {
  appointment_id: string;
  pet_id: string;
  scheduled_at: Date;
  type_name: string;
  diagnosis: string | null;
}

export interface DoctorMedicineOptionRow {
  medicine_id: string;
  medicine_name: string;
  unit: string;
  medicine_status: string;
}

export interface DoctorPrescriptionRow {
  prescription_id: string;
  prescribed_at: string;
  general_note: string | null;
}

export interface DoctorPrescriptionItemRow {
  prescription_item_id: string;
  medicine_id: string;
  medicine_name: string;
  medicine_unit: string;
  quantity: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  usage_instruction: string | null;
  note: string | null;
}

export interface DoctorVaccinationRow {
  vaccination_id: string;
  vaccine_name: string;
  vaccination_date: string;
  note: string | null;
}

export interface DoctorFollowUpInstructionRow {
  follow_up_id: string;
  follow_up_date: string;
  reason: string;
  owner_note: string | null;
}

export interface DoctorRecheckContextRow {
  previous_exam_id: string | null;
  previous_appointment_id: string | null;
  previous_diagnosis: string | null;
  follow_up_reason: string | null;
}

export interface CompleteDoctorExaminationFieldValueBody {
  fieldDefinitionId: string;
  valueText?: string;
  valueNumber?: number;
  valueDate?: string;
  fileUrl?: string;
}

export interface DoctorPrescriptionItemBody {
  medicineId: string;
  quantity?: number;
  dosage: string;
  frequency: string;
  duration: string;
  usageInstruction: string;
  note?: string;
}

export interface DoctorVaccinationBody {
  vaccineName: string;
  vaccinationDate: string;
  note?: string;
}

export interface DoctorFollowUpInstructionBody {
  followUpDate: string;
  reason: string;
  ownerNote?: string;
}

export interface CompleteDoctorExaminationBody {
  diagnosis: string;
  conclusion: string;
  healthNote?: string;
  fieldValues?: CompleteDoctorExaminationFieldValueBody[];
  prescriptionItems?: DoctorPrescriptionItemBody[];
  vaccination?: DoctorVaccinationBody;
  followUp?: DoctorFollowUpInstructionBody;
}

export interface SaveDraftDoctorExaminationBody {
  diagnosis?: string;
  conclusion?: string;
  healthNote?: string;
  fieldValues?: CompleteDoctorExaminationFieldValueBody[];
}
