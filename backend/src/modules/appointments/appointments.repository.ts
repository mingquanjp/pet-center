import type { PoolClient } from "pg";
import { query } from "../../db/query.js";
import type {
  AvailableDoctorRow,
  PendingAppointmentAssignmentRow,
  StaffAppointmentListRow,
  StaffAppointmentStatsRow,
  StaffAppointmentCountRow,
} from "./appointments.types.js";

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
    where += ` AND DATE(ma.scheduled_at) = $${params.length}::date`;
  }

  // Tab filter (overrides status if both exist conceptually, but FE sends tab separately)
  if (filters.tab && filters.tab !== "ALL") {
    params.push(filters.tab.toLowerCase());
    where += ` AND ma.appointment_status = $${params.length}`;
  }

  return { where, params };
}

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
      COUNT(*) FILTER (WHERE DATE(ma.scheduled_at) = CURRENT_DATE)::text AS today_total_count
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
      AND DATE(day_appt.scheduled_at) = DATE($1)
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
