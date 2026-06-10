import type { PoolClient } from "pg";
import { query } from "../../../db/query.js";
import { createId } from "../../../shared/utils/id.js";
import type {
  AvailableDoctorRow,
  CompleteDoctorExaminationFieldValueBody,
  DoctorFollowUpInstructionBody,
  DoctorFollowUpInstructionRow,
  DoctorMedicineOptionRow,
  DoctorExaminationCountRow,
  DoctorExaminationDetailRow,
  DoctorExaminationFieldDefinitionRow,
  DoctorExaminationFieldValueRow,
  DoctorExaminationHistoryRow,
  DoctorExaminationListRow,
  DoctorPrescriptionItemBody,
  DoctorPrescriptionItemRow,
  DoctorPrescriptionRow,
  DoctorRecheckContextRow,
  DoctorExaminationStatsRow,
  DoctorVaccinationBody,
  DoctorVaccinationRow,
  PendingAppointmentAssignmentRow,
  StaffAppointmentListRow,
  StaffAppointmentStatsRow,
  StaffAppointmentCountRow,
} from "../appointments.types.js";

const timeZone = "Asia/Ho_Chi_Minh";

type StandardFieldConfig = {
  fieldName: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "date" | "select" | "file";
  isRequired: boolean;
  optionSource?: string;
};

const commonClinicalFields: StandardFieldConfig[] = [
  { fieldName: "temperatureC", fieldLabel: "Nhiệt độ", fieldType: "number", isRequired: true },
  { fieldName: "weightKg", fieldLabel: "Cân nặng", fieldType: "number", isRequired: true },
  { fieldName: "heartRateBpm", fieldLabel: "Nhịp tim", fieldType: "number", isRequired: true },
  { fieldName: "clinicalSymptoms", fieldLabel: "Triệu chứng lâm sàng ghi nhận", fieldType: "text", isRequired: true },
];

const typeSpecificFields: Record<string, StandardFieldConfig[]> = {
  general_checkup: [
    { fieldName: "generalCondition", fieldLabel: "Tình trạng tổng quát", fieldType: "text", isRequired: true },
    { fieldName: "skinCoatCondition", fieldLabel: "Da / lông", fieldType: "text", isRequired: false },
    { fieldName: "eyesEarsNoseMouth", fieldLabel: "Mắt / tai / mũi / miệng", fieldType: "text", isRequired: false },
    { fieldName: "cardioRespiratory", fieldLabel: "Hô hấp / tim phổi", fieldType: "text", isRequired: false },
    { fieldName: "digestiveCondition", fieldLabel: "Tiêu hóa", fieldType: "text", isRequired: false },
    { fieldName: "suggestedLabTest", fieldLabel: "Đề xuất xét nghiệm thêm nếu cần", fieldType: "text", isRequired: false },
    { fieldName: "generalCheckupNote", fieldLabel: "Nhận xét khám tổng quát", fieldType: "text", isRequired: false },
  ],
  vaccination: [
    { fieldName: "vaccineName", fieldLabel: "Tên vaccine", fieldType: "text", isRequired: true },
    { fieldName: "vaccinationDate", fieldLabel: "Ngày tiêm", fieldType: "date", isRequired: true },
    { fieldName: "doseNumber", fieldLabel: "Mũi tiêm", fieldType: "select", isRequired: false, optionSource: "vaccinationDose" },
    { fieldName: "vaccineBatchNumber", fieldLabel: "Lô vaccine", fieldType: "text", isRequired: false },
    { fieldName: "postVaccinationReaction", fieldLabel: "Phản ứng sau tiêm", fieldType: "text", isRequired: false },
    { fieldName: "nextDoseDate", fieldLabel: "Ngày nhắc mũi tiếp theo", fieldType: "date", isRequired: false },
    { fieldName: "vaccinationNote", fieldLabel: "Ghi chú sau tiêm", fieldType: "text", isRequired: false },
  ],
  lab_test: [
    { fieldName: "labTestType", fieldLabel: "Loại xét nghiệm", fieldType: "select", isRequired: true, optionSource: "labTestType" },
    { fieldName: "labResultStatus", fieldLabel: "Trạng thái kết quả", fieldType: "select", isRequired: true, optionSource: "labResultStatus" },
    { fieldName: "labPerformedDate", fieldLabel: "Ngày thực hiện", fieldType: "date", isRequired: true },
    { fieldName: "labResultText", fieldLabel: "Kết quả ghi nhận", fieldType: "text", isRequired: false },
    { fieldName: "labDoctorComment", fieldLabel: "Nhận xét của bác sĩ", fieldType: "text", isRequired: false },
    { fieldName: "labResultFile", fieldLabel: "Tệp kết quả đính kèm", fieldType: "file", isRequired: false },
  ],
  recheck: [
    { fieldName: "currentCondition", fieldLabel: "Tình trạng hiện tại", fieldType: "text", isRequired: true },
    { fieldName: "improvementLevel", fieldLabel: "Mức độ cải thiện", fieldType: "select", isRequired: true, optionSource: "improvementLevel" },
    { fieldName: "nextTreatmentPlan", fieldLabel: "Hướng xử lý tiếp theo", fieldType: "text", isRequired: true },
  ],
};

/**
 * Build reusable WHERE clauses for search/status/serviceType/date/tab filters.
 * Returns { whereClause, params } to be appended to the base SQL.
 */
function buildFilterClauses(filters: any) {
  const params: unknown[] = [];
  let where = "";

  // Search
  if (filters.search) {
    params.push(`%${filters.search}%`);
    where += ` AND (
      ma.appointment_id ILIKE $${params.length}
      OR p.pet_name ILIKE $${params.length}
      OR u.full_name ILIKE $${params.length}
      OR u.phone_number ILIKE $${params.length}
    )`;
  }

  // Status dropdown filter
  if (filters.status) {
    params.push(filters.status.toLowerCase());
    where += ` AND ma.appointment_status = $${params.length}`;
  }

  // Service type filter
  if (filters.serviceType) {
    params.push(filters.serviceType.toLowerCase());
    where += ` AND et.type_code = $${params.length}`;
  }

  // Date filter
  if (filters.date) {
    params.push(filters.date);
    where += ` AND (ma.scheduled_at AT TIME ZONE '${timeZone}')::date = $${params.length}::date`;
  }

  // Tab filter (overrides status if both exist conceptually, but FE sends tab separately)
  if (filters.tab && filters.tab !== "ALL") {
    params.push(filters.tab.toLowerCase());
    where += ` AND ma.appointment_status = $${params.length}`;
  }

  return { where, params };
}

type DoctorExaminationFilters = {
  search?: string;
  status?: string;
  examType?: string;
  tab?: string;
  date?: string;
  page?: number;
  limit?: number;
};
let cachedPrescriptionItemHasQuantity: boolean | null = null;

export async function getStaffAppointmentsList(filters: any) {
  const { where, params } = buildFilterClauses(filters);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  // Data query
  params.push(limit);
  const limitParam = params.length;
  params.push(offset);
  const offsetParam = params.length;

  const sql = `
    SELECT
      ma.appointment_id AS id,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url,
      u.user_id AS owner_id,
      u.full_name AS owner_name,
      u.phone_number AS owner_phone,
      u.email AS owner_email,
      et.exam_type_id,
      et.type_code,
      et.type_name,
      ma.scheduled_at,
      ma.appointment_status,
      ma.symptom_description
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users u ON ma.owner_user_id = u.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    WHERE 1=1 ${where}
    ORDER BY ma.scheduled_at DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const result = await query<StaffAppointmentListRow>(sql, params);
  return result.rows;
}

export async function getStaffAppointmentsCount(filters: any) {
  const { where, params } = buildFilterClauses(filters);

  const sql = `
    SELECT COUNT(*)::text AS total
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users u ON ma.owner_user_id = u.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    WHERE 1=1 ${where}
  `;

  const result = await query<StaffAppointmentCountRow>(sql, params);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

/**
 * Stats are calculated with the same search/date/serviceType/status filters
 * but WITHOUT the tab filter, so that tab counts remain stable.
 */
export async function getStaffAppointmentsStats(filters: any) {
  // Build filters WITHOUT tab
  const filtersWithoutTab = { ...filters, tab: undefined };
  const { where, params } = buildFilterClauses(filtersWithoutTab);

  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE ma.appointment_status = 'pending')::text    AS pending_count,
      COUNT(*) FILTER (WHERE ma.appointment_status = 'confirmed')::text  AS confirmed_count,
      COUNT(*) FILTER (WHERE ma.appointment_status = 'rejected')::text   AS rejected_count,
      COUNT(*) FILTER (WHERE ma.appointment_status = 'cancelled')::text  AS cancelled_count,
      COUNT(*) FILTER (WHERE (ma.scheduled_at AT TIME ZONE '${timeZone}')::date = (now() AT TIME ZONE '${timeZone}')::date)::text AS today_total_count
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users u ON ma.owner_user_id = u.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    WHERE 1=1 ${where}
  `;

  const result = await query<StaffAppointmentStatsRow>(sql, params);
  return result.rows[0];
}

export async function findStaffAppointmentDetailById(appointmentId: string, client?: PoolClient) {
  const sql = `
    SELECT
      ma.appointment_id,
      p.pet_id,
      ma.owner_user_id,
      ma.exam_type_id,
      ma.veterinarian_user_id,
      ma.scheduled_at,
      ma.symptom_description,
      ma.appointment_status,
      ma.internal_note,
      ma.rejection_reason,
      ma.handled_by_staff_id,
      
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url,
      p.birth_date,
      p.weight_kg,
      
      o.full_name AS owner_full_name,
      o.phone_number AS owner_phone_number,
      o.email AS owner_email,
      
      et.type_code,
      et.type_name,

      d.full_name AS doctor_full_name,
      d.phone_number AS doctor_phone_number,
      d.email AS doctor_email,
      NULL AS doctor_avatar
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users o ON ma.owner_user_id = o.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    LEFT JOIN pet_center.users d ON ma.veterinarian_user_id = d.user_id
    WHERE ma.appointment_id = $1
  `;

  const result = client ? await client.query<any>(sql, [appointmentId]) : await query<any>(sql, [appointmentId]);
  return result.rows[0] || null;
}

export async function findStaffAppointmentDetailByIdForUpdate(appointmentId: string, client: PoolClient) {
  const sql = `
    SELECT
      ma.appointment_id,
      p.pet_id,
      ma.owner_user_id,
      ma.exam_type_id,
      ma.veterinarian_user_id,
      ma.scheduled_at,
      ma.symptom_description,
      ma.appointment_status,
      ma.internal_note,
      ma.rejection_reason,
      ma.handled_by_staff_id,
      
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url,
      p.birth_date,
      p.weight_kg,
      
      o.full_name AS owner_full_name,
      o.phone_number AS owner_phone_number,
      o.email AS owner_email,
      
      et.type_code,
      et.type_name,

      d.full_name AS doctor_full_name,
      d.phone_number AS doctor_phone_number,
      d.email AS doctor_email,
      NULL AS doctor_avatar
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users o ON ma.owner_user_id = o.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    LEFT JOIN pet_center.users d ON ma.veterinarian_user_id = d.user_id
    WHERE ma.appointment_id = $1
    FOR UPDATE OF ma
  `;

  const result = await client.query<any>(sql, [appointmentId]);
  return result.rows[0] || null;
}

export async function findAvailableDoctorsForAppointment(
  appointmentStart: Date,
  appointmentEnd: Date,
  currentAppointmentId?: string,
  client?: PoolClient
): Promise<AvailableDoctorRow[]> {
  const sql = `
    SELECT
      u.user_id,
      u.full_name,
      u.phone_number,
      u.email,
      NULL AS profile_image_url,
      COUNT(day_appt.appointment_id)::text AS confirmed_count_in_day
    FROM pet_center.users u
    LEFT JOIN pet_center.medical_appointments busy
      ON busy.veterinarian_user_id = u.user_id
      AND busy.appointment_status = 'confirmed'
      AND ($3::text IS NULL OR busy.appointment_id <> $3)
      AND busy.scheduled_at < $2
      AND busy.scheduled_at + interval '60 minutes' > $1
    LEFT JOIN pet_center.medical_appointments day_appt
      ON day_appt.veterinarian_user_id = u.user_id
      AND day_appt.appointment_status = 'confirmed'
      AND (day_appt.scheduled_at AT TIME ZONE '${timeZone}')::date = ($1 AT TIME ZONE '${timeZone}')::date
    WHERE u.role = 'Doctor'
      AND u.account_status = 'active'
    GROUP BY u.user_id, u.full_name, u.phone_number, u.email
    HAVING COUNT(busy.appointment_id) = 0
    ORDER BY confirmed_count_in_day ASC
  `;

  const params = [appointmentStart, appointmentEnd, currentAppointmentId || null];
  const result = client ? await client.query<AvailableDoctorRow>(sql, params) : await query<AvailableDoctorRow>(sql, params);
  return result.rows;
}

export async function findPendingAppointmentsAssignedToDoctorInRange(
  doctorUserId: string,
  appointmentStart: Date,
  appointmentEnd: Date,
  excludedAppointmentId: string,
  client: PoolClient
): Promise<PendingAppointmentAssignmentRow[]> {
  const sql = `
    SELECT
      appointment_id,
      scheduled_at
    FROM pet_center.medical_appointments
    WHERE appointment_status = 'pending'
      AND veterinarian_user_id = $1
      AND appointment_id <> $4
      AND scheduled_at < $3
      AND scheduled_at + interval '60 minutes' > $2
    ORDER BY scheduled_at ASC, appointment_id ASC
    FOR UPDATE
  `;

  const result = await client.query<PendingAppointmentAssignmentRow>(sql, [
    doctorUserId,
    appointmentStart,
    appointmentEnd,
    excludedAppointmentId,
  ]);
  return result.rows;
}

export async function updateAppointmentDoctor(
  appointmentId: string,
  doctorUserId: string | null,
  client: PoolClient
) {
  const sql = `
    UPDATE pet_center.medical_appointments
    SET veterinarian_user_id = $1
    WHERE appointment_id = $2
      AND appointment_status = 'pending'
  `;

  await client.query(sql, [doctorUserId, appointmentId]);
}

export async function lockDoctorForAssignment(
  doctorUserId: string,
  client: PoolClient
): Promise<boolean> {
  const sql = `
    SELECT user_id
    FROM pet_center.users
    WHERE user_id = $1
      AND role = 'Doctor'
      AND account_status = 'active'
    FOR UPDATE
  `;

  const result = await client.query(sql, [doctorUserId]);
  return (result.rowCount ?? 0) > 0;
}

export async function confirmAppointmentWithDoctor(
  appointmentId: string,
  staffUserId: string,
  doctorUserId: string,
  internalNote?: string,
  client?: PoolClient
) {
  const sql = `
    UPDATE pet_center.medical_appointments
    SET 
      appointment_status = 'confirmed',
      examination_status = 'waiting',
      veterinarian_user_id = $1,
      handled_by_staff_id = $2,
      internal_note = COALESCE($3, internal_note)
    WHERE appointment_id = $4
  `;
  const params = [doctorUserId, staffUserId, internalNote || null, appointmentId];
  if (client) {
    await client.query(sql, params);
    return;
  }
  await query(sql, params);
}

export async function rejectAppointment(
  appointmentId: string,
  staffUserId: string,
  rejectionReason: string,
  internalNote?: string
) {
  const sql = `
    UPDATE pet_center.medical_appointments
    SET 
      appointment_status = 'rejected',
      rejection_reason = $1,
      handled_by_staff_id = $2,
      internal_note = COALESCE($3, internal_note)
    WHERE appointment_id = $4
  `;
  await query(sql, [rejectionReason, staffUserId, internalNote || null, appointmentId]);
}
