import { query } from "../../db/query.js";
import type {
  DoctorPrescriptionDetailRow,
  DoctorPrescriptionItemRow,
  DoctorPrescriptionListRow,
  DoctorPrescriptionStatsRow,
  ListDoctorPrescriptionsFilters,
} from "./prescriptions.types.js";

function appendDoctorPrescriptionFilters(
  sql: string,
  params: unknown[],
  filters: Pick<ListDoctorPrescriptionsFilters, "search" | "date">
) {
  let nextSql = sql;

  if (filters.search) {
    params.push(`%${filters.search}%`);
    nextSql += ` AND (
      pr.prescription_id ILIKE $${params.length}
      OR me.exam_id ILIKE $${params.length}
      OR ma.appointment_id ILIKE $${params.length}
      OR p.pet_name ILIKE $${params.length}
      OR owner.full_name ILIKE $${params.length}
      OR EXISTS (
        SELECT 1
        FROM pet_center.prescription_items pi
        JOIN pet_center.medicines m ON m.medicine_id = pi.medicine_id
        WHERE pi.prescription_id = pr.prescription_id
          AND m.medicine_name ILIKE $${params.length}
      )
    )`;
  }

  if (filters.date) {
    params.push(filters.date);
    nextSql += ` AND pr.prescribed_at = $${params.length}::date`;
  }

  return nextSql;
}

function getDoctorPrescriptionBaseSql() {
  return `
    FROM pet_center.prescriptions pr
    JOIN pet_center.medical_exams me ON me.exam_id = pr.exam_id
    JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
    JOIN pet_center.pets p ON p.pet_id = ma.pet_id
    JOIN pet_center.users owner ON owner.user_id = ma.owner_user_id
    JOIN pet_center.users doctor ON doctor.user_id = me.examined_by_veterinarian_id
  `;
}

export async function getDoctorPrescriptionsList(
  doctorUserId: string,
  filters: ListDoctorPrescriptionsFilters
) {
  const params: unknown[] = [doctorUserId];
  let sql = `
    SELECT
      pr.prescription_id,
      pr.exam_id,
      ma.appointment_id,
      pr.prescribed_at::text,
      pr.general_note,
      me.diagnosis,
      me.conclusion,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.birth_date::text,
      p.estimated_age::text,
      p.profile_image_url,
      owner.user_id AS owner_id,
      owner.full_name AS owner_name,
      owner.phone_number AS owner_phone,
      doctor.full_name AS doctor_name,
      COUNT(pi.prescription_item_id)::text AS medicine_count,
      EXISTS (
        SELECT 1
        FROM pet_center.follow_up_instructions fui
        WHERE fui.exam_id = pr.exam_id
      ) AS has_follow_up
    ${getDoctorPrescriptionBaseSql()}
    LEFT JOIN pet_center.prescription_items pi ON pi.prescription_id = pr.prescription_id
    WHERE me.examined_by_veterinarian_id = $1
  `;

  sql = appendDoctorPrescriptionFilters(sql, params, filters);
  params.push(filters.limit, (filters.page - 1) * filters.limit);

  sql += `
    GROUP BY
      pr.prescription_id,
      pr.exam_id,
      ma.appointment_id,
      pr.prescribed_at,
      pr.general_note,
      me.diagnosis,
      me.conclusion,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.birth_date,
      p.estimated_age,
      p.profile_image_url,
      owner.user_id,
      owner.full_name,
      owner.phone_number,
      doctor.full_name
    ORDER BY pr.prescribed_at DESC, pr.prescription_id DESC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `;

  const result = await query<DoctorPrescriptionListRow>(sql, params);
  return result.rows;
}

export async function getDoctorPrescriptionsCount(
  doctorUserId: string,
  filters: Pick<ListDoctorPrescriptionsFilters, "search" | "date">
) {
  const params: unknown[] = [doctorUserId];
  let sql = `
    SELECT COUNT(DISTINCT pr.prescription_id)::int AS total
    ${getDoctorPrescriptionBaseSql()}
    WHERE me.examined_by_veterinarian_id = $1
  `;

  sql = appendDoctorPrescriptionFilters(sql, params, filters);

  const result = await query<{ total: number }>(sql, params);
  return result.rows[0]?.total ?? 0;
}

export async function getDoctorPrescriptionsStats(doctorUserId: string) {
  const result = await query<DoctorPrescriptionStatsRow>(
    `
    SELECT
      COUNT(DISTINCT pr.prescription_id)::text AS total_count,
      COUNT(DISTINCT pr.prescription_id) FILTER (WHERE pr.prescribed_at = CURRENT_DATE)::text AS today_count,
      COUNT(DISTINCT pr.prescription_id) FILTER (WHERE fui.follow_up_id IS NOT NULL)::text AS follow_up_count
    ${getDoctorPrescriptionBaseSql()}
    LEFT JOIN pet_center.follow_up_instructions fui ON fui.exam_id = pr.exam_id
    WHERE me.examined_by_veterinarian_id = $1
    `,
    [doctorUserId]
  );

  return result.rows[0] ?? null;
}

export async function getDoctorPrescriptionDetail(doctorUserId: string, prescriptionId: string) {
  const result = await query<DoctorPrescriptionDetailRow>(
    `
    SELECT
      pr.prescription_id,
      pr.exam_id,
      ma.appointment_id,
      pr.prescribed_at::text,
      pr.general_note,
      me.diagnosis,
      me.conclusion,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.birth_date::text,
      p.estimated_age::text,
      p.profile_image_url,
      owner.user_id AS owner_id,
      owner.full_name AS owner_name,
      owner.phone_number AS owner_phone,
      doctor.user_id AS doctor_id,
      doctor.full_name AS doctor_name,
      fui.follow_up_id,
      fui.follow_up_date::text,
      fui.reason AS follow_up_reason,
      fui.owner_note AS follow_up_owner_note
    ${getDoctorPrescriptionBaseSql()}
    LEFT JOIN pet_center.follow_up_instructions fui ON fui.exam_id = pr.exam_id
    WHERE me.examined_by_veterinarian_id = $1
      AND pr.prescription_id = $2
    `,
    [doctorUserId, prescriptionId]
  );

  return result.rows[0] ?? null;
}

export async function getDoctorPrescriptionItems(prescriptionId: string) {
  const result = await query<DoctorPrescriptionItemRow>(
    `
    SELECT
      pi.prescription_item_id,
      pi.medicine_id,
      m.medicine_name,
      m.unit AS medicine_unit,
      pi.quantity::text AS quantity,
      pi.dosage,
      pi.frequency,
      pi.duration,
      pi.usage_instruction,
      pi.note
    FROM pet_center.prescription_items pi
    JOIN pet_center.medicines m ON m.medicine_id = pi.medicine_id
    WHERE pi.prescription_id = $1
    ORDER BY pi.prescription_item_id ASC
    `,
    [prescriptionId]
  );

  return result.rows;
}
