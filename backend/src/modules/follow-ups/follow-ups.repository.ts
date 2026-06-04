import { query } from "../../db/query.js";
import type {
  DoctorFollowUpDetailRow,
  DoctorFollowUpListRow,
  DoctorFollowUpStatsRow,
  ListDoctorFollowUpsFilters,
} from "./follow-ups.types.js";

const effectiveStatusSql = `
  CASE
    WHEN fui.follow_up_status = 'completed' THEN 'completed'
    WHEN fui.follow_up_status = 'pending' AND fui.follow_up_date < CURRENT_DATE THEN 'overdue'
    ELSE 'upcoming'
  END
`;

function getDoctorFollowUpBaseSql() {
  return `
    FROM pet_center.follow_up_instructions fui
    JOIN pet_center.medical_exams me ON me.exam_id = fui.exam_id
    JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
    JOIN pet_center.pets p ON p.pet_id = ma.pet_id
    JOIN pet_center.users owner ON owner.user_id = ma.owner_user_id
    JOIN pet_center.users doctor ON doctor.user_id = me.examined_by_veterinarian_id
  `;
}

function appendDoctorFollowUpFilters(
  sql: string,
  params: unknown[],
  filters: Pick<ListDoctorFollowUpsFilters, "search" | "status" | "date">
) {
  let nextSql = sql;

  if (filters.search) {
    params.push(`%${filters.search}%`);
    nextSql += ` AND (
      fui.follow_up_id ILIKE $${params.length}
      OR fui.exam_id ILIKE $${params.length}
      OR ma.appointment_id ILIKE $${params.length}
      OR p.pet_name ILIKE $${params.length}
      OR owner.full_name ILIKE $${params.length}
      OR fui.reason ILIKE $${params.length}
    )`;
  }

  if (filters.date) {
    params.push(filters.date);
    nextSql += ` AND fui.follow_up_date = $${params.length}::date`;
  }

  if (filters.status) {
    params.push(filters.status);
    nextSql += ` AND ${effectiveStatusSql} = $${params.length}`;
  }

  return nextSql;
}

export async function getDoctorFollowUpsList(
  doctorUserId: string,
  filters: ListDoctorFollowUpsFilters
) {
  const params: unknown[] = [doctorUserId];
  let sql = `
    SELECT
      fui.follow_up_id,
      fui.exam_id,
      ma.appointment_id,
      fui.follow_up_date::text,
      fui.reason,
      fui.owner_note,
      fui.follow_up_status,
      fui.completed_at::text,
      ${effectiveStatusSql} AS effective_status,
      me.exam_date::text,
      me.diagnosis,
      me.conclusion,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.gender,
      p.birth_date::text,
      p.estimated_age::text,
      p.profile_image_url,
      owner.user_id AS owner_id,
      owner.full_name AS owner_name,
      owner.phone_number AS owner_phone,
      owner.email::text AS owner_email,
      doctor.user_id AS doctor_id,
      doctor.full_name AS doctor_name,
      COALESCE(medicine_counts.medicine_count, 0)::text AS medicine_count
    ${getDoctorFollowUpBaseSql()}
    LEFT JOIN (
      SELECT pr.exam_id, COUNT(pi.prescription_item_id)::int AS medicine_count
      FROM pet_center.prescriptions pr
      LEFT JOIN pet_center.prescription_items pi ON pi.prescription_id = pr.prescription_id
      GROUP BY pr.exam_id
    ) medicine_counts ON medicine_counts.exam_id = me.exam_id
    WHERE me.examined_by_veterinarian_id = $1
      AND fui.follow_up_status <> 'cancelled'
  `;

  sql = appendDoctorFollowUpFilters(sql, params, filters);
  params.push(filters.limit, (filters.page - 1) * filters.limit);

  sql += `
    ORDER BY
      CASE
        WHEN ${effectiveStatusSql} = 'overdue' THEN 0
        WHEN ${effectiveStatusSql} = 'upcoming' THEN 1
        ELSE 2
      END,
      fui.follow_up_date ASC,
      fui.follow_up_id ASC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `;

  const result = await query<DoctorFollowUpListRow>(sql, params);
  return result.rows;
}

export async function getDoctorFollowUpsCount(
  doctorUserId: string,
  filters: Pick<ListDoctorFollowUpsFilters, "search" | "status" | "date">
) {
  const params: unknown[] = [doctorUserId];
  let sql = `
    SELECT COUNT(DISTINCT fui.follow_up_id)::int AS total
    ${getDoctorFollowUpBaseSql()}
    WHERE me.examined_by_veterinarian_id = $1
      AND fui.follow_up_status <> 'cancelled'
  `;

  sql = appendDoctorFollowUpFilters(sql, params, filters);

  const result = await query<{ total: number }>(sql, params);
  return result.rows[0]?.total ?? 0;
}

export async function getDoctorFollowUpsStats(doctorUserId: string) {
  const result = await query<DoctorFollowUpStatsRow>(
    `
    SELECT
      COUNT(*) FILTER (
        WHERE fui.follow_up_status = 'pending' AND fui.follow_up_date >= CURRENT_DATE
      )::text AS upcoming_count,
      COUNT(*) FILTER (
        WHERE fui.follow_up_status = 'pending' AND fui.follow_up_date < CURRENT_DATE
      )::text AS overdue_count,
      COUNT(*) FILTER (
        WHERE fui.follow_up_status = 'completed'
      )::text AS completed_count
    ${getDoctorFollowUpBaseSql()}
    WHERE me.examined_by_veterinarian_id = $1
      AND fui.follow_up_status <> 'cancelled'
    `,
    [doctorUserId]
  );

  return result.rows[0] ?? null;
}

export async function getDoctorFollowUpDetail(doctorUserId: string, followUpId: string) {
  const result = await query<DoctorFollowUpDetailRow>(
    `
    SELECT
      fui.follow_up_id,
      fui.exam_id,
      ma.appointment_id,
      fui.follow_up_date::text,
      fui.reason,
      fui.owner_note,
      fui.follow_up_status,
      fui.completed_at::text,
      ${effectiveStatusSql} AS effective_status,
      me.exam_date::text,
      me.diagnosis,
      me.conclusion,
      me.health_note,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.gender,
      p.birth_date::text,
      p.estimated_age::text,
      p.profile_image_url,
      owner.user_id AS owner_id,
      owner.full_name AS owner_name,
      owner.phone_number AS owner_phone,
      owner.email::text AS owner_email,
      doctor.user_id AS doctor_id,
      doctor.full_name AS doctor_name,
      pr.prescription_id,
      pr.prescribed_at::text,
      pr.general_note,
      COUNT(pi.prescription_item_id)::text AS medicine_count
    ${getDoctorFollowUpBaseSql()}
    LEFT JOIN pet_center.prescriptions pr ON pr.exam_id = me.exam_id
    LEFT JOIN pet_center.prescription_items pi ON pi.prescription_id = pr.prescription_id
    WHERE me.examined_by_veterinarian_id = $1
      AND fui.follow_up_id = $2
      AND fui.follow_up_status <> 'cancelled'
    GROUP BY
      fui.follow_up_id,
      fui.exam_id,
      ma.appointment_id,
      fui.follow_up_date,
      fui.reason,
      fui.owner_note,
      fui.follow_up_status,
      fui.completed_at,
      me.exam_date,
      me.diagnosis,
      me.conclusion,
      me.health_note,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.gender,
      p.birth_date,
      p.estimated_age,
      p.profile_image_url,
      owner.user_id,
      owner.full_name,
      owner.phone_number,
      owner.email,
      doctor.user_id,
      doctor.full_name,
      pr.prescription_id,
      pr.prescribed_at,
      pr.general_note
    `,
    [doctorUserId, followUpId]
  );

  return result.rows[0] ?? null;
}
