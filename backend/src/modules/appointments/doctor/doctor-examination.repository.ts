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
    { fieldName: "vaccinationNote", fieldLabel: "Ghi chú sau tiêm", fieldType: "text", isRequired: false },
  ],
  lab_test: [
    { fieldName: "labTestType", fieldLabel: "Loại xét nghiệm", fieldType: "select", isRequired: true, optionSource: "labTestType" },
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

function buildDoctorExaminationBaseSql(
  doctorUserId: string,
  filters: DoctorExaminationFilters,
  includeStatusFilter: boolean
) {
  const params: unknown[] = [doctorUserId];
  let innerWhere = "";
  let outerWhere = "";

  if (filters.search) {
    params.push(`%${filters.search}%`);
    innerWhere += ` AND (
      ma.appointment_id ILIKE $${params.length}
      OR me.exam_id ILIKE $${params.length}
      OR p.pet_name ILIKE $${params.length}
      OR u.full_name ILIKE $${params.length}
      OR u.phone_number ILIKE $${params.length}
    )`;
  }

  if (filters.examType) {
    params.push(filters.examType.toLowerCase());
    innerWhere += ` AND et.type_code = $${params.length}`;
  }

  if (filters.date) {
    params.push(filters.date);
    innerWhere += ` AND (ma.scheduled_at AT TIME ZONE '${timeZone}')::date = $${params.length}::date`;
  }

  const statusFilter = filters.tab && filters.tab !== "ALL" ? filters.tab : filters.status;
  if (includeStatusFilter && statusFilter) {
    params.push(statusFilter.toLowerCase());
    outerWhere += ` AND examination_status = $${params.length}`;
  }

  const sql = `
    WITH doctor_examinations AS (
      SELECT
        ma.appointment_id AS id,
        me.exam_id,
        p.pet_id,
        p.pet_name,
        p.species,
        p.breed,
        p.birth_date,
        p.estimated_age::text AS estimated_age,
        p.profile_image_url,
        u.user_id AS owner_id,
        u.full_name AS owner_name,
        u.phone_number AS owner_phone,
        u.email AS owner_email,
        et.exam_type_id,
        et.type_code,
        et.type_name,
        ma.scheduled_at,
        ma.symptom_description,
        ma.internal_note,
        ma.examination_status
      FROM pet_center.medical_appointments ma
      JOIN pet_center.pets p ON ma.pet_id = p.pet_id
      JOIN pet_center.users u ON ma.owner_user_id = u.user_id
      JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
      LEFT JOIN pet_center.medical_exams me ON ma.appointment_id = me.appointment_id
      WHERE ma.appointment_status = 'confirmed'
        AND ma.veterinarian_user_id = $1
        ${innerWhere}
    )
    SELECT *
    FROM doctor_examinations
    WHERE 1=1 ${outerWhere}
  `;

  return { sql, params };
}

export async function getDoctorExaminationsList(doctorUserId: string, filters: DoctorExaminationFilters) {
  const { sql, params } = buildDoctorExaminationBaseSql(doctorUserId, filters, true);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  params.push(limit);
  const limitParam = params.length;
  params.push(offset);
  const offsetParam = params.length;

  const result = await query<DoctorExaminationListRow>(
    `
      ${sql}
      ORDER BY scheduled_at ASC, id ASC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `,
    params
  );

  return result.rows;
}

export async function getDoctorExaminationsCount(doctorUserId: string, filters: DoctorExaminationFilters) {
  const { sql, params } = buildDoctorExaminationBaseSql(doctorUserId, filters, true);

  const result = await query<DoctorExaminationCountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM (${sql}) counted_examinations
    `,
    params
  );

  return parseInt(result.rows[0]?.total ?? "0", 10);
}

export async function getDoctorExaminationsStats(doctorUserId: string) {
  const { sql, params } = buildDoctorExaminationBaseSql(doctorUserId, {}, false);

  const result = await query<DoctorExaminationStatsRow>(
    `
      SELECT
        COUNT(*)::text AS total_count,
        COUNT(*) FILTER (WHERE examination_status = 'waiting')::text AS waiting_count,
        COUNT(*) FILTER (WHERE examination_status = 'examining')::text AS examining_count,
        COUNT(*) FILTER (WHERE examination_status = 'completed')::text AS completed_count,
        COUNT(*) FILTER (WHERE examination_status = 'follow_up')::text AS follow_up_count
      FROM (${sql}) stats_examinations
    `,
    params
  );

  return result.rows[0];
}

export async function getDoctorExaminationsTabStats(doctorUserId: string, filters: DoctorExaminationFilters) {
  const filtersWithoutTab = { ...filters, tab: undefined, status: undefined };
  const { sql, params } = buildDoctorExaminationBaseSql(doctorUserId, filtersWithoutTab, false);

  const result = await query<DoctorExaminationStatsRow>(
    `
      SELECT
        COUNT(*)::text AS total_count,
        COUNT(*) FILTER (WHERE examination_status = 'waiting')::text AS waiting_count,
        COUNT(*) FILTER (WHERE examination_status = 'examining')::text AS examining_count,
        COUNT(*) FILTER (WHERE examination_status = 'completed')::text AS completed_count,
        COUNT(*) FILTER (WHERE examination_status = 'follow_up')::text AS follow_up_count
      FROM (${sql}) tab_stats_examinations
    `,
    params
  );

  return result.rows[0];
}

export async function findDoctorExaminationDetail(doctorUserId: string, appointmentId: string) {
  const sql = `
    SELECT
      ma.appointment_id AS id,
      me.exam_id,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.birth_date,
      p.estimated_age::text AS estimated_age,
      p.profile_image_url,
      p.gender,
      p.weight_kg::text AS weight_kg,
      u.user_id AS owner_id,
      u.full_name AS owner_name,
      u.phone_number AS owner_phone,
      u.email AS owner_email,
      et.exam_type_id,
      et.type_code,
      et.type_name,
      ma.scheduled_at,
      ma.symptom_description,
      ma.internal_note,
      d.user_id AS doctor_id,
      d.full_name AS doctor_name,
      ma.examination_status,
      me.diagnosis,
      me.conclusion,
      me.health_note,
      me.exam_status,
      me.exam_date::text AS exam_date
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users u ON ma.owner_user_id = u.user_id
    LEFT JOIN pet_center.users d ON ma.veterinarian_user_id = d.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    LEFT JOIN pet_center.medical_exams me ON ma.appointment_id = me.appointment_id
    WHERE ma.appointment_status = 'confirmed'
      AND ma.appointment_id = $1
    LIMIT 1
  `;

  const result = await query<DoctorExaminationDetailRow>(sql, [appointmentId]);
  return result.rows[0] || null;
}

export async function findDoctorExaminationForUpdate(
  doctorUserId: string,
  appointmentId: string,
  client: PoolClient
) {
  const sql = `
    SELECT
      ma.appointment_id,
      ma.pet_id,
      ma.exam_type_id,
      ma.veterinarian_user_id,
      ma.appointment_status,
      me.exam_id
    FROM pet_center.medical_appointments ma
    LEFT JOIN pet_center.medical_exams me ON ma.appointment_id = me.appointment_id
    WHERE ma.appointment_id = $1
      AND ma.veterinarian_user_id = $2
      AND ma.appointment_status = 'confirmed'
    FOR UPDATE OF ma
  `;

  const result = await client.query<{
    appointment_id: string;
    pet_id: string;
    exam_type_id: string;
    veterinarian_user_id: string;
    appointment_status: string;
    exam_id: string | null;
  }>(sql, [appointmentId, doctorUserId]);

  return result.rows[0] || null;
}

export async function createMedicalExamForAppointment(
  examId: string,
  appointmentId: string,
  doctorUserId: string,
  client: PoolClient
) {
  const sql = `
    INSERT INTO pet_center.medical_exams (
      exam_id,
      appointment_id,
      examined_by_veterinarian_id
    )
    VALUES ($1, $2, $3)
  `;

  await client.query(sql, [examId, appointmentId, doctorUserId]);
}

export async function updateMedicalExamLifecycle(
  examId: string,
  doctorUserId: string,
  status: "waiting" | "examining",
  client: PoolClient
) {
  await client.query(
    "UPDATE pet_center.medical_exams SET examined_by_veterinarian_id = $1, exam_status = $2 WHERE exam_id = $3",
    [doctorUserId, status, examId]
  );
}

export async function ensureStandardExamFieldDefinitions(examTypeId: string, typeCode: string) {
  const expectedFields = [...commonClinicalFields, ...(typeSpecificFields[typeCode] ?? [])];
  if (expectedFields.length === 0) return;

  const existingResult = await query<{
    field_name: string;
    max_display_order: string | null;
  }>(
    `
      SELECT field_name, MAX(display_order) OVER ()::text AS max_display_order
      FROM pet_center.exam_field_definitions
      WHERE exam_type_id = $1
    `,
    [examTypeId]
  );

  const existingNames = new Set(existingResult.rows.map((row) => row.field_name));
  let nextDisplayOrder = Number(existingResult.rows[0]?.max_display_order ?? 0) + 1;

  for (const field of expectedFields) {
    if (existingNames.has(field.fieldName)) continue;

    await query(
      `
        INSERT INTO pet_center.exam_field_definitions (
          field_definition_id,
          exam_type_id,
          field_name,
          field_label,
          field_type,
          is_required,
          display_order,
          option_source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (exam_type_id, field_name) DO NOTHING
      `,
      [
        await createId("efd"),
        examTypeId,
        field.fieldName,
        field.fieldLabel,
        field.fieldType,
        field.isRequired,
        nextDisplayOrder++,
        field.optionSource ?? null,
      ]
    );
  }
}

export async function getDoctorExaminationFieldDefinitions(examTypeId: string) {
  const result = await query<DoctorExaminationFieldDefinitionRow>(
    `
      SELECT
        field_definition_id,
        field_name,
        field_label,
        field_type,
        is_required,
        display_order,
        option_source
      FROM pet_center.exam_field_definitions
      WHERE exam_type_id = $1
        AND field_status = 'active'
      ORDER BY display_order ASC, field_definition_id ASC
    `,
    [examTypeId]
  );

  return result.rows;
}

export async function getDoctorExaminationFieldValues(examId: string | null) {
  if (!examId) return [];

  const result = await query<DoctorExaminationFieldValueRow>(
    `
      SELECT
        field_definition_id,
        value_text,
        value_number::text AS value_number,
        value_date::text AS value_date,
        file_url
      FROM pet_center.medical_exam_field_values
      WHERE exam_id = $1
    `,
    [examId]
  );

  return result.rows;
}

export async function completeMedicalExam(
  examId: string,
  diagnosis: string,
  conclusion: string,
  healthNote: string | undefined,
  examStatus: string,
  client: PoolClient
) {
  await client.query(
    `
      UPDATE pet_center.medical_exams
      SET
        diagnosis = $1,
        conclusion = $2,
        health_note = $3,
        exam_status = $4,
        exam_date = CURRENT_DATE
      WHERE exam_id = $5
    `,
    [diagnosis, conclusion, healthNote || null, examStatus, examId]
  );
}

export async function replaceMedicalExamFieldValues(
  examId: string,
  fieldValues: CompleteDoctorExaminationFieldValueBody[],
  client: PoolClient
) {
  await client.query("DELETE FROM pet_center.medical_exam_field_values WHERE exam_id = $1", [examId]);

  for (const fieldValue of fieldValues) {
    await client.query(
      `
        INSERT INTO pet_center.medical_exam_field_values (
          field_value_id,
          exam_id,
          field_definition_id,
          value_text,
          value_number,
          value_date,
          file_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        await createId("efv", client),
        examId,
        fieldValue.fieldDefinitionId,
        fieldValue.valueText ?? null,
        fieldValue.valueNumber ?? null,
        fieldValue.valueDate ?? null,
        fieldValue.fileUrl ?? null,
      ]
    );
  }
}

export async function saveMedicalExamDraft(
  examId: string,
  diagnosis: string | undefined,
  conclusion: string | undefined,
  healthNote: string | undefined,
  client: PoolClient
) {
  await client.query(
    `
      UPDATE pet_center.medical_exams
      SET
        diagnosis = COALESCE($1, diagnosis),
        conclusion = COALESCE($2, conclusion),
        health_note = COALESCE($3, health_note)
      WHERE exam_id = $4
    `,
    [diagnosis ?? null, conclusion ?? null, healthNote ?? null, examId]
  );
}

export async function getDoctorExaminationHistory(petId: string, currentAppointmentId: string) {
  const result = await query<DoctorExaminationHistoryRow>(
    `
      SELECT
        me.exam_id,
        ma.appointment_id,
        ma.pet_id,
        ma.scheduled_at,
        et.type_name,
        me.diagnosis
      FROM pet_center.medical_exams me
      JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
      JOIN pet_center.exam_types et ON et.exam_type_id = ma.exam_type_id
      WHERE ma.pet_id = $1
        AND ma.appointment_id <> $2
        AND NULLIF(BTRIM(COALESCE(me.diagnosis, '')), '') IS NOT NULL
      ORDER BY ma.scheduled_at DESC
      LIMIT 3
    `,
    [petId, currentAppointmentId]
  );

  return result.rows;
}

export async function getActiveMedicineOptions() {
  const result = await query<DoctorMedicineOptionRow>(
    `
      SELECT medicine_id, medicine_name, unit, medicine_status
      FROM pet_center.medicines
      WHERE medicine_status = 'active'
      ORDER BY medicine_name ASC, medicine_id ASC
    `
  );

  return result.rows;
}

export async function getPrescriptionByExamId(examId: string | null) {
  if (!examId) return null;

  const prescriptionResult = await query<DoctorPrescriptionRow>(
    `
      SELECT prescription_id, prescribed_at::text AS prescribed_at, general_note
      FROM pet_center.prescriptions
      WHERE exam_id = $1
      LIMIT 1
    `,
    [examId]
  );

  const prescription = prescriptionResult.rows[0];
  if (!prescription) return null;

  const itemsResult = await query<DoctorPrescriptionItemRow>(
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
    [prescription.prescription_id]
  );

  return {
    ...prescription,
    items: itemsResult.rows,
  };
}

export async function getVaccinationByExamId(examId: string | null) {
  if (!examId) return null;

  const result = await query<DoctorVaccinationRow>(
    `
      SELECT vaccination_id, vaccine_name, vaccination_date::text AS vaccination_date, note
      FROM pet_center.vaccinations
      WHERE exam_id = $1
      ORDER BY vaccination_date DESC, vaccination_id DESC
      LIMIT 1
    `,
    [examId]
  );

  return result.rows[0] ?? null;
}

export async function getFollowUpByExamId(examId: string | null) {
  if (!examId) return null;

  const result = await query<DoctorFollowUpInstructionRow>(
    `
      SELECT follow_up_id, follow_up_date::text AS follow_up_date, reason, owner_note
      FROM pet_center.follow_up_instructions
      WHERE exam_id = $1
      LIMIT 1
    `,
    [examId]
  );

  return result.rows[0] ?? null;
}

export async function getRecheckContext(petId: string, currentAppointmentId: string) {
  const result = await query<DoctorRecheckContextRow>(
    `
      SELECT
        me.exam_id AS previous_exam_id,
        ma.appointment_id AS previous_appointment_id,
        me.diagnosis AS previous_diagnosis,
        fui.reason AS follow_up_reason
      FROM pet_center.medical_exams me
      JOIN pet_center.medical_appointments ma ON ma.appointment_id = me.appointment_id
      LEFT JOIN pet_center.follow_up_instructions fui ON fui.exam_id = me.exam_id
      WHERE ma.pet_id = $1
        AND ma.appointment_id <> $2
        AND NULLIF(BTRIM(COALESCE(me.diagnosis, '')), '') IS NOT NULL
      ORDER BY ma.scheduled_at DESC
      LIMIT 1
    `,
    [petId, currentAppointmentId]
  );

  return result.rows[0] ?? null;
}

async function getActiveMedicineIds(medicineIds: string[], client: PoolClient) {
  if (medicineIds.length === 0) return new Set<string>();

  const result = await client.query<{ medicine_id: string }>(
    `
      SELECT medicine_id
      FROM pet_center.medicines
      WHERE medicine_id = ANY($1::varchar[])
        AND medicine_status = 'active'
    `,
    [medicineIds]
  );

  return new Set(result.rows.map((row) => row.medicine_id));
}

export async function replacePrescription(
  examId: string,
  items: DoctorPrescriptionItemBody[] | undefined,
  client: PoolClient
) {
  await client.query("DELETE FROM pet_center.prescriptions WHERE exam_id = $1", [examId]);

  const validItems = (items ?? []).filter((item) => item.medicineId);
  if (validItems.length === 0) return false;

  const activeMedicineIds = await getActiveMedicineIds(validItems.map((item) => item.medicineId), client);
  const prescriptionId = await createId("rx", client);

  await client.query(
    `
      INSERT INTO pet_center.prescriptions (prescription_id, exam_id)
      VALUES ($1, $2)
    `,
    [prescriptionId, examId]
  );

  for (const item of validItems) {
    if (!activeMedicineIds.has(item.medicineId)) continue;

    await client.query(
      `
        INSERT INTO pet_center.prescription_items (
          prescription_item_id,
          prescription_id,
          medicine_id,
          quantity,
          dosage,
          frequency,
          duration,
          usage_instruction,
          note
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        await createId("rxi", client),
        prescriptionId,
        item.medicineId,
        item.quantity ?? 1,
        item.dosage,
        item.frequency,
        item.duration,
        item.usageInstruction,
        item.note ?? null,
      ]
    );
  }

  return true;
}

export async function replaceVaccination(
  examId: string,
  petId: string,
  vaccination: DoctorVaccinationBody | undefined,
  client: PoolClient
) {
  await client.query("DELETE FROM pet_center.vaccinations WHERE exam_id = $1", [examId]);
  if (!vaccination) return;

  await client.query(
    `
      INSERT INTO pet_center.vaccinations (
        vaccination_id,
        pet_id,
        exam_id,
        vaccine_name,
        vaccination_date,
        note
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      await createId("vac", client),
      petId,
      examId,
      vaccination.vaccineName,
      vaccination.vaccinationDate,
      vaccination.note ?? null,
    ]
  );
}

export async function replaceFollowUpInstruction(
  examId: string,
  followUp: DoctorFollowUpInstructionBody | undefined,
  client: PoolClient
) {
  await client.query("DELETE FROM pet_center.follow_up_instructions WHERE exam_id = $1", [examId]);
  if (!followUp) return false;

  await client.query(
    `
      INSERT INTO pet_center.follow_up_instructions (
        follow_up_id,
        exam_id,
        follow_up_date,
        reason,
        owner_note
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [await createId("fui", client), examId, followUp.followUpDate, followUp.reason, followUp.ownerNote ?? null]
  );

  return true;
}

export async function updateMedicalExamStatus(examId: string, status: string, client: PoolClient) {
  await client.query("UPDATE pet_center.medical_exams SET exam_status = $1 WHERE exam_id = $2", [status, examId]);
}

export async function updateAppointmentExaminationStatus(
  appointmentId: string,
  examinationStatus: "waiting" | "examining" | "completed" | "follow_up",
  client: PoolClient
) {
  await client.query(
    "UPDATE pet_center.medical_appointments SET examination_status = $1 WHERE appointment_id = $2",
    [examinationStatus, appointmentId]
  );
}
