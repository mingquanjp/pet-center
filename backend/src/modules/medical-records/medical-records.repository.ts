import { query } from "../../db/query.js";
import { DoctorMedicalRecordSpeciesFilter, DoctorMedicalRecordExamStatus } from "./medical-records.types.js";

export interface MedicalRecordRow {
  pet_id: string;
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

export interface MedicalRecordPetDetailRow {
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birth_date: Date | string | null;
  estimated_age: string | number | null;
  fur_color: string | null;
  weight_kg: string | number | null;
  avatar_url: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string | null;
  owner_email: string | null;
  owner_address: string | null;
}

export interface MedicalRecordExamDetailRow {
  exam_id: string;
  appointment_id: string;
  exam_date: Date | string;
  exam_type_code: string | null;
  exam_type_name: string | null;
  veterinarian_id: string;
  veterinarian_name: string;
  symptom_description: string | null;
  diagnosis: string | null;
  conclusion: string | null;
  health_note: string | null;
  exam_status: string;
}

export interface MedicalRecordExamFieldValueRow {
  field_value_id: string;
  exam_id: string;
  field_label: string;
  field_type: "text" | "number" | "date" | "select" | "file";
  value_text: string | null;
  value_number: string | number | null;
  value_date: Date | string | null;
  file_url: string | null;
  display_order: number;
}

export interface MedicalRecordVaccinationRow {
  vaccination_id: string;
  exam_id: string | null;
  vaccine_name: string;
  vaccination_date: Date | string;
  note: string | null;
}

export interface MedicalRecordPrescriptionRow {
  prescription_id: string;
  exam_id: string;
  prescribed_at: Date | string;
  general_note: string | null;
}

export interface MedicalRecordPrescriptionItemRow {
  prescription_id: string;
  prescription_item_id: string;
  medicine_name: string;
  medicine_unit: string;
  quantity: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  usage_instruction: string | null;
  note: string | null;
}

export interface MedicalRecordFollowUpRow {
  follow_up_id: string;
  exam_id: string;
  follow_up_date: Date | string;
  reason: string;
  owner_note: string | null;
  follow_up_status: "pending" | "completed" | "cancelled";
  completed_at: Date | string | null;
}

export async function findDoctorMedicalRecordDetailRows(petId: string) {
  const [
    petResult,
    examsResult,
    fieldValuesResult,
    vaccinationsResult,
    prescriptionsResult,
    prescriptionItemsResult,
    followUpsResult,
  ] = await Promise.all([
    query<MedicalRecordPetDetailRow>(
      `
        SELECT
          p.pet_id,
          p.pet_name,
          p.species,
          p.breed,
          p.gender,
          p.birth_date,
          p.estimated_age,
          p.fur_color,
          p.weight_kg,
          p.profile_image_url AS avatar_url,
          owner.user_id AS owner_id,
          owner.full_name AS owner_name,
          owner.phone_number AS owner_phone,
          owner.email::text AS owner_email,
          owner.address AS owner_address
        FROM pet_center.pets p
        JOIN pet_center.users owner ON owner.user_id = p.owner_user_id
        WHERE p.pet_id = $1
          AND p.pet_status != 'deceased'
        LIMIT 1;
      `,
      [petId]
    ),
    query<MedicalRecordExamDetailRow>(
      `
        SELECT
          me.exam_id,
          ma.appointment_id,
          me.exam_date,
          et.type_code AS exam_type_code,
          et.type_name AS exam_type_name,
          vet.user_id AS veterinarian_id,
          vet.full_name AS veterinarian_name,
          ma.symptom_description,
          me.diagnosis,
          me.conclusion,
          me.health_note,
          me.exam_status
        FROM pet_center.medical_exams me
        JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
        JOIN pet_center.users vet ON vet.user_id = me.examined_by_veterinarian_id
        LEFT JOIN pet_center.exam_types et ON et.exam_type_id = ma.exam_type_id
        WHERE ma.pet_id = $1
        ORDER BY me.exam_date DESC NULLS LAST, me.exam_id DESC;
      `,
      [petId]
    ),
    query<MedicalRecordExamFieldValueRow>(
      `
        SELECT
          efv.field_value_id,
          efv.exam_id,
          efd.field_label,
          efd.field_type,
          efv.value_text,
          efv.value_number,
          efv.value_date,
          efv.file_url,
          efd.display_order
        FROM pet_center.medical_exam_field_values efv
        JOIN pet_center.medical_exams me ON me.exam_id = efv.exam_id
        JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
        JOIN pet_center.exam_field_definitions efd ON efd.field_definition_id = efv.field_definition_id
        WHERE ma.pet_id = $1
        ORDER BY me.exam_date DESC NULLS LAST, efv.exam_id DESC, efd.display_order ASC;
      `,
      [petId]
    ),
    query<MedicalRecordVaccinationRow>(
      `
        SELECT
          v.vaccination_id,
          v.exam_id,
          v.vaccine_name,
          v.vaccination_date,
          v.note
        FROM pet_center.vaccinations v
        WHERE v.pet_id = $1
        ORDER BY v.vaccination_date DESC, v.vaccination_id DESC;
      `,
      [petId]
    ),
    query<MedicalRecordPrescriptionRow>(
      `
        SELECT
          pr.prescription_id,
          pr.exam_id,
          pr.prescribed_at,
          pr.general_note
        FROM pet_center.prescriptions pr
        JOIN pet_center.medical_exams me ON me.exam_id = pr.exam_id
        JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
        WHERE ma.pet_id = $1
        ORDER BY pr.prescribed_at DESC, pr.prescription_id DESC;
      `,
      [petId]
    ),
    query<MedicalRecordPrescriptionItemRow>(
      `
        SELECT
          pr.prescription_id,
          pi.prescription_item_id,
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
        JOIN pet_center.prescriptions pr ON pr.prescription_id = pi.prescription_id
        JOIN pet_center.medical_exams me ON me.exam_id = pr.exam_id
        JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
        WHERE ma.pet_id = $1
        ORDER BY pr.prescribed_at DESC, pi.prescription_item_id ASC;
      `,
      [petId]
    ),
    query<MedicalRecordFollowUpRow>(
      `
        SELECT
          fui.follow_up_id,
          fui.exam_id,
          fui.follow_up_date,
          fui.reason,
          fui.owner_note,
          fui.follow_up_status,
          fui.completed_at
        FROM pet_center.follow_up_instructions fui
        JOIN pet_center.medical_exams me ON me.exam_id = fui.exam_id
        JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
        WHERE ma.pet_id = $1
        ORDER BY fui.follow_up_date DESC, fui.follow_up_id DESC;
      `,
      [petId]
    ),
  ]);

  return {
    pet: petResult.rows[0] ?? null,
    exams: examsResult.rows,
    fieldValues: fieldValuesResult.rows,
    vaccinations: vaccinationsResult.rows,
    prescriptions: prescriptionsResult.rows,
    prescriptionItems: prescriptionItemsResult.rows,
    followUps: followUpsResult.rows,
  };
}
