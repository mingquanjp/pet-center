import { query } from "../../db/query.js";
import { DoctorMedicalRecordSpeciesFilter, DoctorMedicalRecordExamStatus } from "./medical-records.types.js";

export interface MedicalRecordRow {
  pet_id: string;
  pet_code: string;
  pet_name: string;
  species: string;
  breed: string | null;
  avatar_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string | null;
  latest_exam_id: string;
  latest_exam_date: Date;
  latest_diagnosis: string | null;
  exam_status: string;
  exam_type_code: string | null;
  exam_type_name: string | null;
  total_count: string;
}

export async function findDoctorMedicalRecords(params: {
  keyword: string;
  species: DoctorMedicalRecordSpeciesFilter;
  examStatus: "ALL" | DoctorMedicalRecordExamStatus;
  limit: number;
  offset: number;
}): Promise<{ rows: MedicalRecordRow[]; total: number }> {
  let conditions: string[] = ["p.pet_status != 'deceased'"];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.keyword) {
    conditions.push(`(
      LOWER(p.pet_id) LIKE LOWER($${paramIndex}) OR
      LOWER(p.pet_name) LIKE LOWER($${paramIndex}) OR
      LOWER(owner.full_name) LIKE LOWER($${paramIndex}) OR
      LOWER(latest.diagnosis) LIKE LOWER($${paramIndex})
    )`);
    values.push(`%${params.keyword}%`);
    paramIndex++;
  }

  if (params.species !== "ALL") {
    conditions.push(`p.species = $${paramIndex}`);
    values.push(params.species);
    paramIndex++;
  }

  if (params.examStatus !== "ALL") {
    conditions.push(`latest.exam_status = $${paramIndex}`);
    values.push(params.examStatus);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(params.limit);
  const limitIndex = paramIndex++;
  values.push(params.offset);
  const offsetIndex = paramIndex++;

  const sql = `
    SELECT
      p.pet_id,
      p.pet_id AS pet_code,
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url AS avatar_url,
      owner.user_id AS owner_id,
      owner.full_name AS owner_name,
      owner.phone_number AS owner_phone,
      latest.exam_id AS latest_exam_id,
      latest.exam_date AS latest_exam_date,
      latest.diagnosis AS latest_diagnosis,
      latest.exam_status,
      latest.exam_type_code,
      latest.exam_type_name,
      COUNT(*) OVER() AS total_count
    FROM pet_center.pets p
    JOIN pet_center.users owner ON owner.user_id = p.owner_user_id
    JOIN LATERAL (
      SELECT
        me.exam_id,
        me.exam_date,
        me.diagnosis,
        me.exam_status,
        et.type_code AS exam_type_code,
        et.type_name AS exam_type_name
      FROM pet_center.medical_exams me
      JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
      LEFT JOIN pet_center.exam_types et ON et.exam_type_id = ma.exam_type_id
      WHERE ma.pet_id = p.pet_id
      ORDER BY me.exam_date DESC NULLS LAST, me.exam_id DESC
      LIMIT 1
    ) latest ON true
    ${whereClause}
    ORDER BY latest.exam_date DESC NULLS LAST, p.pet_id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex};
  `;

  const result = await query(sql, values);
  const rows = result.rows as MedicalRecordRow[];
  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;

  return { rows, total };
}
