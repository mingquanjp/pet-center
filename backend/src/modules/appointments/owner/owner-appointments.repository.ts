import type { PoolClient } from "pg";
import { query } from "../../../db/query.js";
import type {
  OwnerAppointmentCountRow,
  OwnerAppointmentDetailRow,
  OwnerAppointmentIntervalRow,
  OwnerAppointmentListQuery,
  OwnerAppointmentListRow,
  OwnerExamTypeOptionRow,
  OwnerPetOptionRow,
} from "./owner-appointments.types.js";

const effectiveStatusSql = "CASE WHEN ma.examination_status IN ('completed', 'follow_up') THEN 'completed' ELSE ma.appointment_status END";
const timeZone = "Asia/Ho_Chi_Minh";

function buildOwnerAppointmentFilterClauses(ownerUserId: string, filters: OwnerAppointmentListQuery) {
  const params: unknown[] = [ownerUserId];
  let where = "ma.owner_user_id = $1";

  if (filters.search) {
    params.push(`%${filters.search}%`);
    where += ` AND (
      ma.appointment_id ILIKE $${params.length}
      OR p.pet_name ILIKE $${params.length}
      OR et.type_name ILIKE $${params.length}
    )`;
  }

  if (filters.petId) {
    params.push(filters.petId);
    where += ` AND ma.pet_id = $${params.length}`;
  }

  if (filters.status) {
    params.push(filters.status.toLowerCase());
    where += ` AND ${effectiveStatusSql} = $${params.length}`;
  }

  if (filters.date) {
    params.push(filters.date);
    where += ` AND (ma.scheduled_at AT TIME ZONE '${timeZone}')::date = $${params.length}::date`;
  }

  return { params, where };
}

export async function listOwnerAppointments(ownerUserId: string, filters: OwnerAppointmentListQuery) {
  const { params, where } = buildOwnerAppointmentFilterClauses(ownerUserId, filters);
  const offset = (filters.page - 1) * filters.limit;

  params.push(filters.limit);
  const limitParam = params.length;
  params.push(offset);
  const offsetParam = params.length;

  const sql = `
    SELECT
      ma.appointment_id,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url,
      et.exam_type_id,
      et.type_code,
      et.type_name,
      ma.scheduled_at,
      ma.appointment_status,
      ma.symptom_description,
      me.exam_id AS completed_exam_id
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    LEFT JOIN pet_center.medical_exams me ON me.appointment_id = ma.appointment_id
    WHERE ${where}
    ORDER BY
      (ma.scheduled_at >= now()) DESC,
      CASE WHEN ma.scheduled_at >= now() THEN ma.scheduled_at END ASC,
      CASE WHEN ma.scheduled_at < now() THEN ma.scheduled_at END DESC,
      ma.appointment_id DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const result = await query<OwnerAppointmentListRow>(sql, params);
  return result.rows;
}

export async function countOwnerAppointments(ownerUserId: string, filters: OwnerAppointmentListQuery) {
  const { params, where } = buildOwnerAppointmentFilterClauses(ownerUserId, filters);
  const sql = `
    SELECT COUNT(*)::text AS total
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    LEFT JOIN pet_center.medical_exams me ON me.appointment_id = ma.appointment_id
    WHERE ${where}
  `;

  const result = await query<OwnerAppointmentCountRow>(sql, params);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

export async function findOwnerAppointmentDetail(appointmentId: string, ownerUserId: string, client?: PoolClient) {
  const sql = `
    SELECT
      ma.appointment_id,
      ma.owner_user_id,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url,
      p.birth_date,
      p.estimated_age::text AS estimated_age,
      p.gender,
      et.exam_type_id,
      et.type_code,
      et.type_name,
      ma.scheduled_at,
      ma.appointment_status,
      ma.symptom_description,
      ma.internal_note,
      ma.rejection_reason,
      o.full_name AS owner_full_name,
      o.phone_number AS owner_phone_number,
      o.email AS owner_email,
      me.exam_id AS completed_exam_id
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users o ON ma.owner_user_id = o.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    LEFT JOIN pet_center.medical_exams me ON me.appointment_id = ma.appointment_id
    WHERE ma.appointment_id = $1
      AND ma.owner_user_id = $2
  `;

  const result = client
    ? await client.query<OwnerAppointmentDetailRow>(sql, [appointmentId, ownerUserId])
    : await query<OwnerAppointmentDetailRow>(sql, [appointmentId, ownerUserId]);
  return result.rows[0] ?? null;
}

export async function findOwnerAppointmentDetailForUpdate(
  appointmentId: string,
  ownerUserId: string,
  client: PoolClient,
) {
  const sql = `
    SELECT
      ma.appointment_id,
      ma.owner_user_id,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url,
      p.birth_date,
      p.estimated_age::text AS estimated_age,
      p.gender,
      et.exam_type_id,
      et.type_code,
      et.type_name,
      ma.scheduled_at,
      ma.appointment_status,
      ma.symptom_description,
      ma.internal_note,
      ma.rejection_reason,
      o.full_name AS owner_full_name,
      o.phone_number AS owner_phone_number,
      o.email AS owner_email,
      me.exam_id AS completed_exam_id
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users o ON ma.owner_user_id = o.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    LEFT JOIN pet_center.medical_exams me ON me.appointment_id = ma.appointment_id
    WHERE ma.appointment_id = $1
      AND ma.owner_user_id = $2
    FOR UPDATE OF ma
  `;

  const result = await client.query<OwnerAppointmentDetailRow>(sql, [appointmentId, ownerUserId]);
  return result.rows[0] ?? null;
}

export async function listOwnerPetOptions(ownerUserId: string) {
  const sql = `
    SELECT
      pet_id,
      pet_name,
      species,
      breed,
      birth_date,
      estimated_age::text AS estimated_age,
      weight_kg::text AS weight_kg,
      profile_image_url
    FROM pet_center.pets
    WHERE owner_user_id = $1
    ORDER BY pet_name ASC
  `;

  const result = await query<OwnerPetOptionRow>(sql, [ownerUserId]);
  return result.rows;
}

export async function listActiveExamTypes() {
  const sql = `
    SELECT
      et.exam_type_id,
      et.type_code,
      et.type_name,
      et.description,
      COALESCE(s.estimated_duration_minutes, 60)::int AS duration_minutes
    FROM pet_center.exam_types et
    LEFT JOIN pet_center.services s ON s.service_id = et.service_id
    WHERE et.type_status = 'active'
    ORDER BY et.type_name ASC
  `;

  const result = await query<OwnerExamTypeOptionRow>(sql);
  return result.rows;
}

export async function findOwnerPetById(ownerUserId: string, petId: string, client?: PoolClient) {
  const sql = `
    SELECT pet_id, pet_name, species, breed, birth_date, estimated_age::text AS estimated_age, weight_kg::text AS weight_kg, profile_image_url
    FROM pet_center.pets
    WHERE owner_user_id = $1
      AND pet_id = $2
  `;

  const result = client
    ? await client.query<OwnerPetOptionRow>(sql, [ownerUserId, petId])
    : await query<OwnerPetOptionRow>(sql, [ownerUserId, petId]);
  return result.rows[0] ?? null;
}

export async function findActiveExamTypeById(examTypeId: string, client?: PoolClient) {
  const sql = `
    SELECT
      et.exam_type_id,
      et.type_code,
      et.type_name,
      et.description,
      COALESCE(s.estimated_duration_minutes, 60)::int AS duration_minutes
    FROM pet_center.exam_types et
    LEFT JOIN pet_center.services s ON s.service_id = et.service_id
    WHERE et.exam_type_id = $1
      AND et.type_status = 'active'
  `;

  const result = client
    ? await client.query<OwnerExamTypeOptionRow>(sql, [examTypeId])
    : await query<OwnerExamTypeOptionRow>(sql, [examTypeId]);
  return result.rows[0] ?? null;
}

export async function countActiveDoctors(client?: PoolClient) {
  const sql = `
    SELECT COUNT(*)::int AS total
    FROM pet_center.users
    WHERE role = 'Doctor'
      AND account_status = 'active'
  `;

  const result = client ? await client.query<{ total: number }>(sql) : await query<{ total: number }>(sql);
  return result.rows[0]?.total ?? 0;
}

export async function lockMedicalAppointmentsForScheduling(client: PoolClient) {
  await client.query("LOCK TABLE pet_center.medical_appointments IN SHARE ROW EXCLUSIVE MODE");
}

export async function listActiveAppointmentIntervals(
  rangeStart: Date,
  rangeEnd: Date,
  client?: PoolClient,
) {
  const sql = `
    SELECT scheduled_at, duration_minutes
    FROM pet_center.medical_appointments
    WHERE appointment_status IN ('pending_payment', 'pending', 'confirmed')
      AND scheduled_at < $2
      AND scheduled_at + duration_minutes * interval '1 minute' > $1
  `;
  const params = [rangeStart, rangeEnd];
  const result = client
    ? await client.query<OwnerAppointmentIntervalRow>(sql, params)
    : await query<OwnerAppointmentIntervalRow>(sql, params);

  return result.rows;
}

export async function hasOverlappingPetAppointment(
  petId: string,
  rangeStart: Date,
  rangeEnd: Date,
  client: PoolClient,
) {
  const result = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM pet_center.medical_appointments
        WHERE pet_id = $1
          AND appointment_status IN ('pending_payment', 'pending', 'confirmed')
          AND scheduled_at < $3
          AND scheduled_at + duration_minutes * interval '1 minute' > $2
      ) AS "exists"
    `,
    [petId, rangeStart, rangeEnd],
  );

  return result.rows[0]?.exists ?? false;
}

export async function insertOwnerAppointment(
  input: {
    appointmentId: string;
    ownerUserId: string;
    petId: string;
    examTypeId: string;
    scheduledAt: Date;
    durationMinutes: number;
    symptomDescription?: string;
  },
  client: PoolClient,
) {
  const sql = `
    INSERT INTO pet_center.medical_appointments (
      appointment_id,
      pet_id,
      owner_user_id,
      exam_type_id,
      veterinarian_user_id,
      scheduled_at,
      duration_minutes,
      symptom_description,
      appointment_status,
      internal_note,
      handled_by_staff_id
    )
    VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, 'pending', NULL, NULL)
  `;

  await client.query(sql, [
    input.appointmentId,
    input.petId,
    input.ownerUserId,
    input.examTypeId,
    input.scheduledAt,
    input.durationMinutes,
    input.symptomDescription ?? null,
  ]);
}

export async function insertOwnerMedicalExam(examId: string, appointmentId: string, client: PoolClient) {
  await client.query(
    `
      INSERT INTO pet_center.medical_exams (exam_id, appointment_id, exam_status)
      VALUES ($1, $2, 'waiting')
    `,
    [examId, appointmentId],
  );
}

export async function cancelOwnerAppointment(appointmentId: string, ownerUserId: string, client: PoolClient) {
  const sql = `
    UPDATE pet_center.medical_appointments
    SET appointment_status = 'cancelled'
    WHERE appointment_id = $1
      AND owner_user_id = $2
  `;

  await client.query(sql, [appointmentId, ownerUserId]);
}
