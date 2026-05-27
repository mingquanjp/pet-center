import type { PoolClient, QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import { createId } from "../../shared/utils/id.js";
import { normalizeSearchText } from "../../shared/utils/search.js";
import type { CreatePetPayload, UpdatePetPayload } from "./pets.schema.js";
import type {
  PetActivityCategory,
  PetActivityLogDto,
  PetActivitySourceType,
  PetActivityStatus,
  PetDetailDto,
  PetDisplayStatus,
  PetDto,
  PetListFilters,
  PetMedicalExamDetailDto,
  PetMedicalExamDto,
  PetMedicalExamFieldValueDto,
  PetMedicalExamFilters,
  PetPrescriptionDto,
  PetPrescriptionItemDto,
  PetSpecies,
  PetSpaHistoryDto,
  PetSpaHistoryFilters,
  PetVaccinationDto,
  PetVaccinationFilters,
  PetVaccinationStatus
} from "./pets.types.js";

type PetRow = QueryResultRow & {
  pet_id: string;
  pet_name: string;
  species: PetSpecies;
  breed: string | null;
  gender: "male" | "female" | "unknown" | null;
  birth_date: string | null;
  estimated_age: string | number | null;
  fur_color: string | null;
  weight_kg: string | number | null;
  profile_image_url: string | null;
  identifying_marks: string | null;
  pet_status: "active" | "inactive" | "deceased";
  has_active_boarding: boolean;
  needs_attention: boolean;
};

type PetDetailRow = PetRow & {
  medical_history: string | null;
  allergy_notes: string | null;
  chronic_condition_notes: string | null;
  food_type: string | null;
  feeding_portion: string | null;
  special_care_notes: string | null;
  health_profile_updated_at: string | null;
};

type PetActivityLogRow = QueryResultRow & {
  activity_log_id: string;
  pet_id: string;
  owner_user_id: string;
  actor_user_id: string | null;
  actor_name: string | null;
  activity_category: PetActivityCategory;
  activity_type: string;
  activity_status: PetActivityStatus;
  occurred_at: string;
  title: string;
  summary: string | null;
  source_type: PetActivitySourceType;
  source_id: string;
  metadata: Record<string, unknown> | string | null;
};

type CountRow = QueryResultRow & {
  total: string;
};

type PetMedicalExamRow = QueryResultRow & {
  exam_id: string;
  appointment_id: string;
  pet_id: string;
  exam_type_id: string;
  type_code: PetMedicalExamDto["examTypeCode"];
  type_name: string;
  scheduled_at: string;
  exam_date: string;
  veterinarian_user_id: string;
  veterinarian_name: string;
  diagnosis: string | null;
  conclusion: string | null;
  health_note: string | null;
  exam_status: PetMedicalExamDto["examStatus"];
  symptom_description: string | null;
  has_prescription: boolean;
  has_follow_up: boolean;
  follow_up_date: string | null;
  follow_up_reason: string | null;
};

type PetMedicalExamDetailRow = PetMedicalExamRow &
  PetRow & {
    follow_up_id: string | null;
    follow_up_owner_note: string | null;
  };

type PetMedicalExamFieldValueRow = QueryResultRow & {
  field_value_id: string;
  field_definition_id: string;
  field_name: string;
  field_label: string;
  field_type: PetMedicalExamFieldValueDto["fieldType"];
  value_text: string | null;
  value_number: string | number | null;
  value_date: string | null;
  file_url: string | null;
  created_at: string;
};

type PrescriptionRow = QueryResultRow & {
  prescription_id: string;
  prescribed_at: string;
  general_note: string | null;
};

type PrescriptionItemRow = QueryResultRow & {
  prescription_item_id: string;
  medicine_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  usage_instruction: string | null;
  note: string | null;
};

type PetVaccinationRow = QueryResultRow & {
  vaccination_id: string;
  pet_id: string;
  exam_id: string | null;
  appointment_id: string | null;
  vaccine_name: string;
  vaccination_date: string;
  next_reminder_date: string;
  status: PetVaccinationStatus;
  note: string | null;
  veterinarian_user_id: string | null;
  veterinarian_name: string | null;
};

type PetSpaHistoryRow = QueryResultRow & {
  grooming_ticket_id: string;
  pet_id: string;
  service_name: string;
  service_type_name: string;
  scheduled_at: string;
  scheduled_date: string;
  scheduled_time: string;
  ticket_status: PetSpaHistoryDto["ticketStatus"];
  special_request: string | null;
  total_amount: string | number;
  included_services: string;
};

function toDateInput(value?: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toNumber(value: string | number | null): number | null {
  if (value === null) return null;
  return Number(value);
}

function getSpeciesLabel(species: PetSpecies): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác"
  } as const;

  return labels[species];
}

function getGenderLabel(gender: PetRow["gender"]): string {
  const labels = {
    male: "Đực",
    female: "Cái",
    unknown: "Chưa rõ"
  } as const;

  return gender ? labels[gender] : "Chưa cập nhật";
}

function getAgeLabel(row: PetRow): string {
  if (row.birth_date) {
    const birthDate = new Date(row.birth_date);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday =
      now.getMonth() > birthDate.getMonth() ||
      (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());

    if (!hasHadBirthday) years -= 1;

    return years > 0 ? `${years} năm tuổi` : "Dưới 1 năm tuổi";
  }

  const estimatedAge = toNumber(row.estimated_age);

  if (estimatedAge === null) return "Chưa cập nhật";
  if (estimatedAge < 1) return "Dưới 1 năm tuổi";

  return `${Math.floor(estimatedAge)} năm tuổi`;
}

function getDisplayStatus(row: PetRow): PetDisplayStatus {
  if (row.pet_status === "inactive") return "inactive";
  if (row.pet_status === "deceased") return "deceased";
  if (row.has_active_boarding) return "boarding";
  if (row.needs_attention) return "watching";

  return "healthy";
}

function getDisplayStatusLabel(displayStatus: PetDisplayStatus): string {
  const labels = {
    healthy: "Khỏe mạnh",
    watching: "Cần theo dõi",
    boarding: "Đang lưu trú",
    inactive: "Ngưng theo dõi",
    deceased: "Đã mất"
  } as const;

  return labels[displayStatus];
}

function mapPet(row: PetRow): PetDto {
  const displayStatus = getDisplayStatus(row);

  return {
    petId: row.pet_id,
    petName: row.pet_name,
    species: row.species,
    speciesLabel: getSpeciesLabel(row.species),
    breed: row.breed,
    gender: row.gender,
    genderLabel: getGenderLabel(row.gender),
    birthDate: row.birth_date,
    estimatedAge: toNumber(row.estimated_age),
    ageLabel: getAgeLabel(row),
    furColor: row.fur_color,
    weightKg: toNumber(row.weight_kg),
    profileImageUrl: row.profile_image_url,
    identifyingMarks: row.identifying_marks,
    petStatus: row.pet_status,
    displayStatus,
    displayStatusLabel: getDisplayStatusLabel(displayStatus)
  };
}

function mapPetDetail(row: PetDetailRow, recentActivities: PetActivityLogDto[] = []): PetDetailDto {
  return {
    ...mapPet(row),
    healthProfile: {
      medicalHistory: row.medical_history,
      allergyNotes: row.allergy_notes,
      chronicConditionNotes: row.chronic_condition_notes,
      foodType: row.food_type,
      feedingPortion: row.feeding_portion,
      specialCareNotes: row.special_care_notes,
      updatedAt: row.health_profile_updated_at
    },
    recentActivities
  };
}

function normalizeMetadata(value: PetActivityLogRow["metadata"]): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  return value;
}

function mapPetActivityLog(row: PetActivityLogRow): PetActivityLogDto {
  return {
    activityLogId: row.activity_log_id,
    petId: row.pet_id,
    ownerUserId: row.owner_user_id,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    activityCategory: row.activity_category,
    activityType: row.activity_type,
    activityStatus: row.activity_status,
    occurredAt: row.occurred_at,
    title: row.title,
    summary: row.summary,
    sourceType: row.source_type,
    sourceId: row.source_id,
    metadata: normalizeMetadata(row.metadata)
  };
}

function mapPetMedicalExam(row: PetMedicalExamRow): PetMedicalExamDto {
  return {
    examId: row.exam_id,
    appointmentId: row.appointment_id,
    petId: row.pet_id,
    examTypeId: row.exam_type_id,
    examTypeCode: row.type_code,
    examTypeName: row.type_name,
    scheduledAt: row.scheduled_at,
    examDate: row.exam_date,
    veterinarianUserId: row.veterinarian_user_id,
    veterinarianName: row.veterinarian_name,
    diagnosis: row.diagnosis,
    conclusion: row.conclusion,
    healthNote: row.health_note,
    examStatus: row.exam_status,
    symptomDescription: row.symptom_description,
    hasPrescription: row.has_prescription,
    hasFollowUp: row.has_follow_up,
    followUpDate: row.follow_up_date,
    followUpReason: row.follow_up_reason
  };
}

function mapPetMedicalExamFieldValue(row: PetMedicalExamFieldValueRow): PetMedicalExamFieldValueDto {
  return {
    fieldValueId: row.field_value_id,
    fieldDefinitionId: row.field_definition_id,
    fieldName: row.field_name,
    fieldLabel: row.field_label,
    fieldType: row.field_type,
    valueText: row.value_text,
    valueNumber: toNumber(row.value_number),
    valueDate: row.value_date,
    fileUrl: row.file_url,
    createdAt: row.created_at
  };
}

function mapPrescriptionItem(row: PrescriptionItemRow): PetPrescriptionItemDto {
  return {
    prescriptionItemId: row.prescription_item_id,
    medicineId: row.medicine_id,
    medicineName: row.medicine_name,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    usageInstruction: row.usage_instruction,
    note: row.note
  };
}

function mapPetVaccination(row: PetVaccinationRow): PetVaccinationDto {
  return {
    vaccinationId: row.vaccination_id,
    petId: row.pet_id,
    examId: row.exam_id,
    appointmentId: row.appointment_id,
    vaccineName: row.vaccine_name,
    vaccinationDate: row.vaccination_date,
    nextReminderDate: row.next_reminder_date,
    status: row.status,
    note: row.note,
    veterinarianUserId: row.veterinarian_user_id,
    veterinarianName: row.veterinarian_name
  };
}

function getSpaTicketStatusLabel(status: PetSpaHistoryDto["ticketStatus"]): string {
  const labels = {
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
  } as const;

  return labels[status];
}

function mapPetSpaHistory(row: PetSpaHistoryRow): PetSpaHistoryDto {
  return {
    groomingTicketId: row.grooming_ticket_id,
    petId: row.pet_id,
    serviceName: row.service_name,
    serviceTypeName: row.service_type_name,
    scheduledAt: row.scheduled_at,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    ticketStatus: row.ticket_status,
    ticketStatusLabel: getSpaTicketStatusLabel(row.ticket_status),
    specialRequest: row.special_request,
    totalAmount: Number(row.total_amount),
    includedServices: row.included_services
  };
}

function buildListWhere(filters: PetListFilters): { whereSql: string; params: unknown[] } {
  const params: unknown[] = [filters.ownerUserId];
  const conditions = ["p.owner_user_id = $1"];

  if (filters.q) {
    params.push(`%${normalizeSearchText(filters.q)}%`);
    conditions.push(`${normalizedSql("p.pet_name")} like $${params.length}`);
  }

  if (filters.species) {
    params.push(filters.species);
    conditions.push(`p.species = $${params.length}`);
  }

  return {
    whereSql: conditions.join(" and "),
    params
  };
}

function normalizedSql(column: string): string {
  return `translate(
    lower(coalesce(${column}, '')),
    'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
  )`;
}

const petSelectSql = `
  p.pet_id,
  p.pet_name,
  p.species,
  p.breed,
  p.gender,
  p.birth_date::text as birth_date,
  p.estimated_age,
  p.fur_color,
  p.weight_kg,
  p.profile_image_url,
  p.identifying_marks,
  p.pet_status,
  exists (
    select 1 from pet_center.boarding_records br
    where br.pet_id = p.pet_id and br.boarding_status = 'staying'
  ) as has_active_boarding,
  exists (
    select 1 from pet_center.pet_health_profiles php
    where php.pet_id = p.pet_id
      and (
        nullif(trim(coalesce(php.allergy_notes, '')), '') is not null
        or nullif(trim(coalesce(php.chronic_condition_notes, '')), '') is not null
        or nullif(trim(coalesce(php.special_care_notes, '')), '') is not null
      )
  ) as needs_attention
`;

export async function findPets(filters: PetListFilters): Promise<{ pets: PetDto[]; total: number }> {
  const { whereSql, params } = buildListWhere(filters);
  const orderSql = filters.sort === "petName:desc" ? "p.pet_name desc, p.pet_id desc" : "p.pet_name asc, p.pet_id asc";
  const listParams = [...params, filters.limit, filters.offset];

  const [listResult, countResult] = await Promise.all([
    query<PetRow>(
      `select ${petSelectSql}
       from pet_center.pets p
       where ${whereSql}
       order by ${orderSql}
       limit $${params.length + 1} offset $${params.length + 2}`,
      listParams
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.pets p
       where ${whereSql}`,
      params
    )
  ]);

  return {
    pets: listResult.rows.map(mapPet),
    total: Number(countResult.rows[0]?.total ?? 0)
  };
}

export async function findPetById(ownerUserId: string, petId: string): Promise<PetDetailDto | null> {
  const [petResult, activities] = await Promise.all([
    query<PetDetailRow>(
      `select ${petSelectSql},
         php.medical_history,
         php.allergy_notes,
         php.chronic_condition_notes,
         php.food_type,
         php.feeding_portion,
         php.special_care_notes,
         php.updated_at::text as health_profile_updated_at
       from pet_center.pets p
       left join pet_center.pet_health_profiles php on php.pet_id = p.pet_id
       where p.owner_user_id = $1 and p.pet_id = $2
       limit 1`,
      [ownerUserId, petId]
    ),
    findRecentPetActivities(ownerUserId, petId, 3)
  ]);

  return petResult.rows[0] ? mapPetDetail(petResult.rows[0], activities) : null;
}

export async function findRecentPetActivities(ownerUserId: string, petId: string, limit = 3): Promise<PetActivityLogDto[]> {
  const result = await query<PetActivityLogRow>(
    `select
       pal.activity_log_id,
       pal.pet_id,
       pal.owner_user_id,
       pal.actor_user_id,
       actor.full_name as actor_name,
       pal.activity_category,
       pal.activity_type,
       pal.activity_status,
       pal.occurred_at::text as occurred_at,
       pal.title,
       pal.summary,
       pal.source_type,
       pal.source_id,
       pal.metadata
     from pet_center.pet_activity_logs pal
     left join pet_center.users actor on actor.user_id = pal.actor_user_id
     where pal.owner_user_id = $1
       and pal.pet_id = $2
       and pal.visibility_status = 'visible'
     order by pal.occurred_at desc, pal.activity_log_id desc
     limit $3`,
    [ownerUserId, petId, limit]
  );

  return result.rows.map(mapPetActivityLog);
}

function buildMedicalExamsWhere(filters: PetMedicalExamFilters): { whereSql: string; params: unknown[] } {
  const params: unknown[] = [filters.ownerUserId, filters.petId];
  const conditions = ["ma.owner_user_id = $1", "ma.pet_id = $2"];

  if (filters.examType) {
    params.push(filters.examType);
    conditions.push(`et.type_code = $${params.length}`);
  }

  if (filters.from) {
    params.push(toDateInput(filters.from));
    conditions.push(`me.exam_date >= $${params.length}`);
  }

  if (filters.to) {
    params.push(toDateInput(filters.to));
    conditions.push(`me.exam_date <= $${params.length}`);
  }

  if (filters.q) {
    params.push(`%${normalizeSearchText(filters.q)}%`);
    const paramIndex = params.length;
    conditions.push(`(
      ${normalizedSql("et.type_name")} like $${paramIndex}
      or ${normalizedSql("u.full_name")} like $${paramIndex}
      or ${normalizedSql("me.diagnosis")} like $${paramIndex}
      or ${normalizedSql("me.conclusion")} like $${paramIndex}
      or ${normalizedSql("me.health_note")} like $${paramIndex}
      or ${normalizedSql("ma.symptom_description")} like $${paramIndex}
    )`);
  }

  return {
    whereSql: conditions.join(" and "),
    params
  };
}

export async function findPetMedicalExams(
  filters: PetMedicalExamFilters
): Promise<{ exams: PetMedicalExamDto[]; total: number }> {
  const { whereSql, params } = buildMedicalExamsWhere(filters);
  const listParams = [...params, filters.limit, filters.offset];

  const [listResult, countResult] = await Promise.all([
    query<PetMedicalExamRow>(
      `select
         me.exam_id,
         me.appointment_id,
         ma.pet_id,
         me.exam_type_id,
         et.type_code,
         et.type_name,
         ma.scheduled_at::text as scheduled_at,
         me.exam_date::text as exam_date,
         me.examined_by_veterinarian_id as veterinarian_user_id,
         u.full_name as veterinarian_name,
         me.diagnosis,
         me.conclusion,
         me.health_note,
         me.exam_status,
         ma.symptom_description,
         exists (
           select 1 from pet_center.prescriptions pr
           where pr.exam_id = me.exam_id
         ) as has_prescription,
         exists (
           select 1 from pet_center.follow_up_instructions fui
           where fui.exam_id = me.exam_id
         ) as has_follow_up,
         fui.follow_up_date::text as follow_up_date,
         fui.reason as follow_up_reason
       from pet_center.medical_exams me
       inner join pet_center.medical_appointments ma on ma.appointment_id = me.appointment_id
       inner join pet_center.exam_types et on et.exam_type_id = me.exam_type_id
       inner join pet_center.users u on u.user_id = me.examined_by_veterinarian_id
       left join pet_center.follow_up_instructions fui on fui.exam_id = me.exam_id
       where ${whereSql}
       order by me.exam_date desc, ma.scheduled_at desc, me.exam_id desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      listParams
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.medical_exams me
       inner join pet_center.medical_appointments ma on ma.appointment_id = me.appointment_id
       inner join pet_center.exam_types et on et.exam_type_id = me.exam_type_id
       inner join pet_center.users u on u.user_id = me.examined_by_veterinarian_id
       where ${whereSql}`,
      params
    )
  ]);

  return {
    exams: listResult.rows.map(mapPetMedicalExam),
    total: Number(countResult.rows[0]?.total ?? 0)
  };
}

export async function findPetMedicalExamDetail(
  ownerUserId: string,
  petId: string,
  examId: string
): Promise<PetMedicalExamDetailDto | null> {
  const examResult = await query<PetMedicalExamDetailRow>(
    `select
       me.exam_id,
       me.appointment_id,
       ma.pet_id,
       me.exam_type_id,
       et.type_code,
       et.type_name,
       ma.scheduled_at::text as scheduled_at,
       me.exam_date::text as exam_date,
       me.examined_by_veterinarian_id as veterinarian_user_id,
       u.full_name as veterinarian_name,
       me.diagnosis,
       me.conclusion,
       me.health_note,
       me.exam_status,
       ma.symptom_description,
       exists (
         select 1 from pet_center.prescriptions pr
         where pr.exam_id = me.exam_id
       ) as has_prescription,
       exists (
         select 1 from pet_center.follow_up_instructions fui_exists
         where fui_exists.exam_id = me.exam_id
       ) as has_follow_up,
       fui.follow_up_id,
       fui.follow_up_date::text as follow_up_date,
       fui.reason as follow_up_reason,
       fui.owner_note as follow_up_owner_note,
       ${petSelectSql}
     from pet_center.medical_exams me
     inner join pet_center.medical_appointments ma on ma.appointment_id = me.appointment_id
     inner join pet_center.exam_types et on et.exam_type_id = me.exam_type_id
     inner join pet_center.users u on u.user_id = me.examined_by_veterinarian_id
     inner join pet_center.pets p on p.pet_id = ma.pet_id
     left join pet_center.follow_up_instructions fui on fui.exam_id = me.exam_id
     where ma.owner_user_id = $1
       and ma.pet_id = $2
       and me.exam_id = $3
     limit 1`,
    [ownerUserId, petId, examId]
  );

  const examRow = examResult.rows[0];

  if (!examRow) return null;

  const [fieldValuesResult, prescriptionResult] = await Promise.all([
    query<PetMedicalExamFieldValueRow>(
      `select
         efv.field_value_id,
         efd.field_definition_id,
         efd.field_name,
         efd.field_label,
         efd.field_type,
         efv.value_text,
         efv.value_number,
         efv.value_date::text as value_date,
         efv.file_url,
         efv.created_at::text as created_at
       from pet_center.medical_exam_field_values efv
       inner join pet_center.exam_field_definitions efd on efd.field_definition_id = efv.field_definition_id
       where efv.exam_id = $1
       order by efd.display_order asc, efv.field_value_id asc`,
      [examId]
    ),
    query<PrescriptionRow>(
      `select
         pr.prescription_id,
         pr.prescribed_at::text as prescribed_at,
         pr.general_note
       from pet_center.prescriptions pr
       where pr.exam_id = $1
       order by pr.prescribed_at desc, pr.prescription_id desc
       limit 1`,
      [examId]
    )
  ]);

  const prescriptionRow = prescriptionResult.rows[0];
  let prescription: PetPrescriptionDto | null = null;

  if (prescriptionRow) {
    const itemsResult = await query<PrescriptionItemRow>(
      `select
         pi.prescription_item_id,
         pi.medicine_id,
         m.medicine_name,
         pi.dosage,
         pi.frequency,
         pi.duration,
         pi.usage_instruction,
         pi.note
       from pet_center.prescription_items pi
       inner join pet_center.medicines m on m.medicine_id = pi.medicine_id
       where pi.prescription_id = $1
       order by pi.prescription_item_id asc`,
      [prescriptionRow.prescription_id]
    );

    prescription = {
      prescriptionId: prescriptionRow.prescription_id,
      prescribedAt: prescriptionRow.prescribed_at,
      generalNote: prescriptionRow.general_note,
      items: itemsResult.rows.map(mapPrescriptionItem)
    };
  }

  return {
    ...mapPetMedicalExam(examRow),
    pet: mapPet(examRow),
    fieldValues: fieldValuesResult.rows.map(mapPetMedicalExamFieldValue),
    prescription,
    followUp: examRow.follow_up_id
      ? {
          followUpId: examRow.follow_up_id,
          followUpDate: examRow.follow_up_date ?? "",
          reason: examRow.follow_up_reason ?? "",
          ownerNote: examRow.follow_up_owner_note
        }
      : null
  };
}

function vaccinationStatusSql(): string {
  return `case
    when (v.vaccination_date + interval '1 year')::date < current_date then 'overdue'
    when (v.vaccination_date + interval '1 year')::date <= current_date + interval '30 days' then 'due-soon'
    else 'completed'
  end`;
}

function buildVaccinationsWhere(filters: PetVaccinationFilters): { whereSql: string; params: unknown[] } {
  const params: unknown[] = [filters.ownerUserId, filters.petId];
  const conditions = ["p.owner_user_id = $1", "v.pet_id = $2"];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`${vaccinationStatusSql()} = $${params.length}`);
  }

  if (filters.q) {
    params.push(`%${normalizeSearchText(filters.q)}%`);
    const paramIndex = params.length;
    conditions.push(`(
      ${normalizedSql("v.vaccine_name")} like $${paramIndex}
      or ${normalizedSql("v.note")} like $${paramIndex}
      or ${normalizedSql("u.full_name")} like $${paramIndex}
    )`);
  }

  return {
    whereSql: conditions.join(" and "),
    params
  };
}

export async function findPetVaccinations(
  filters: PetVaccinationFilters
): Promise<{ vaccinations: PetVaccinationDto[]; total: number }> {
  const { whereSql, params } = buildVaccinationsWhere(filters);
  const listParams = [...params, filters.limit, filters.offset];
  const statusSql = vaccinationStatusSql();

  const [listResult, countResult] = await Promise.all([
    query<PetVaccinationRow>(
      `select
         v.vaccination_id,
         v.pet_id,
         v.exam_id,
         me.appointment_id,
         v.vaccine_name,
         v.vaccination_date::text as vaccination_date,
         (v.vaccination_date + interval '1 year')::date::text as next_reminder_date,
         ${statusSql} as status,
         v.note,
         me.examined_by_veterinarian_id as veterinarian_user_id,
         u.full_name as veterinarian_name
       from pet_center.vaccinations v
       inner join pet_center.pets p on p.pet_id = v.pet_id
       left join pet_center.medical_exams me on me.exam_id = v.exam_id
       left join pet_center.users u on u.user_id = me.examined_by_veterinarian_id
       where ${whereSql}
       order by v.vaccination_date desc, v.vaccination_id desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      listParams
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.vaccinations v
       inner join pet_center.pets p on p.pet_id = v.pet_id
       left join pet_center.medical_exams me on me.exam_id = v.exam_id
       left join pet_center.users u on u.user_id = me.examined_by_veterinarian_id
       where ${whereSql}`,
      params
    )
  ]);

  return {
    vaccinations: listResult.rows.map(mapPetVaccination),
    total: Number(countResult.rows[0]?.total ?? 0)
  };
}

function buildSpaHistoryWhere(filters: PetSpaHistoryFilters): { whereSql: string; params: unknown[] } {
  const params: unknown[] = [filters.ownerUserId, filters.petId];
  const conditions = [
    "gt.owner_user_id = $1",
    "gt.pet_id = $2",
    "gt.ticket_status in ('completed', 'cancelled')"
  ];

  if (filters.from) {
    params.push(toDateInput(filters.from));
    conditions.push(`(gt.scheduled_at at time zone 'Asia/Ho_Chi_Minh')::date >= $${params.length}::date`);
  }

  if (filters.to) {
    params.push(toDateInput(filters.to));
    conditions.push(`(gt.scheduled_at at time zone 'Asia/Ho_Chi_Minh')::date <= $${params.length}::date`);
  }

  if (filters.serviceType) {
    params.push(`%${normalizeSearchText(filters.serviceType)}%`);
    const paramIndex = params.length;
    conditions.push(`exists (
      select 1
      from pet_center.grooming_ticket_items service_filter_gti
      join pet_center.services service_filter_s on service_filter_s.service_id = service_filter_gti.service_id
      where service_filter_gti.grooming_ticket_id = gt.grooming_ticket_id
        and (
          ${normalizedSql("service_filter_s.service_name")} like $${paramIndex}
          or ${normalizedSql("service_filter_s.description")} like $${paramIndex}
        )
    )`);
  }

  if (filters.q) {
    params.push(`%${normalizeSearchText(filters.q)}%`);
    const paramIndex = params.length;
    conditions.push(`(
      ${normalizedSql("gt.grooming_ticket_id")} like $${paramIndex}
      or ${normalizedSql("gt.special_request")} like $${paramIndex}
      or exists (
        select 1
        from pet_center.grooming_ticket_items search_gti
        join pet_center.services search_s on search_s.service_id = search_gti.service_id
        where search_gti.grooming_ticket_id = gt.grooming_ticket_id
          and (
            ${normalizedSql("search_s.service_name")} like $${paramIndex}
            or ${normalizedSql("search_s.description")} like $${paramIndex}
          )
      )
    )`);
  }

  return {
    whereSql: conditions.join(" and "),
    params
  };
}

export async function findPetSpaHistory(
  filters: PetSpaHistoryFilters
): Promise<{ records: PetSpaHistoryDto[]; total: number }> {
  const { whereSql, params } = buildSpaHistoryWhere(filters);
  const listParams = [...params, filters.limit, filters.offset];

  const [listResult, countResult] = await Promise.all([
    query<PetSpaHistoryRow>(
      `select
         gt.grooming_ticket_id,
         gt.pet_id,
         coalesce(string_agg(s.service_name, ', ' order by s.service_name), 'Dịch vụ spa') as service_name,
         coalesce((array_agg(s.service_name order by s.service_name))[1], 'Dịch vụ spa') as service_type_name,
         gt.scheduled_at::text as scheduled_at,
         to_char(gt.scheduled_at at time zone 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY') as scheduled_date,
         to_char(gt.scheduled_at at time zone 'Asia/Ho_Chi_Minh', 'HH24:MI') as scheduled_time,
         gt.ticket_status,
         gt.special_request,
         gt.estimated_total as total_amount,
         coalesce(string_agg(coalesce(s.description, s.service_name), ', ' order by s.service_name), 'Dịch vụ spa') as included_services
       from pet_center.grooming_tickets gt
       join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
       join pet_center.services s on s.service_id = gti.service_id
       where ${whereSql}
       group by
         gt.grooming_ticket_id,
         gt.pet_id,
         gt.scheduled_at,
         gt.ticket_status,
         gt.special_request,
         gt.estimated_total
       order by gt.scheduled_at desc, gt.grooming_ticket_id desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      listParams
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.grooming_tickets gt
       where ${whereSql}`,
      params
    )
  ]);

  return {
    records: listResult.rows.map(mapPetSpaHistory),
    total: Number(countResult.rows[0]?.total ?? 0)
  };
}

export async function createPet(ownerUserId: string, payload: CreatePetPayload): Promise<PetDetailDto> {
  const petId = createId("pet");

  await withTransaction(async (client) => {
    await client.query(
      `insert into pet_center.pets (
         pet_id, owner_user_id, pet_name, species, breed, gender, birth_date, estimated_age,
         fur_color, weight_kg, profile_image_url, identifying_marks
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        petId,
        ownerUserId,
        payload.petName,
        payload.species,
        payload.breed ?? null,
        payload.gender ?? null,
        toDateInput(payload.birthDate),
        payload.estimatedAge ?? null,
        payload.furColor ?? null,
        payload.weightKg ?? null,
        payload.profileImageUrl ?? null,
        payload.identifyingMarks ?? null
      ]
    );

    if (payload.healthProfile) {
      await upsertHealthProfile(client, petId, payload.healthProfile);
    }
  });

  return (await findPetById(ownerUserId, petId))!;
}

export async function updatePet(ownerUserId: string, petId: string, payload: UpdatePetPayload): Promise<PetDetailDto | null> {
  const existingPet = await findPetById(ownerUserId, petId);

  if (!existingPet) return null;

  await withTransaction(async (client) => {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    const addField = (column: string, value: unknown) => {
      params.push(value);
      setClauses.push(`${column} = $${params.length}`);
    };

    if ("petName" in payload) addField("pet_name", payload.petName);
    if ("species" in payload) addField("species", payload.species);
    if ("breed" in payload) addField("breed", payload.breed ?? null);
    if ("gender" in payload) addField("gender", payload.gender ?? null);
    if ("birthDate" in payload) addField("birth_date", toDateInput(payload.birthDate));
    if ("estimatedAge" in payload) addField("estimated_age", payload.estimatedAge ?? null);
    if ("furColor" in payload) addField("fur_color", payload.furColor ?? null);
    if ("weightKg" in payload) addField("weight_kg", payload.weightKg ?? null);
    if ("profileImageUrl" in payload) addField("profile_image_url", payload.profileImageUrl ?? null);
    if ("identifyingMarks" in payload) addField("identifying_marks", payload.identifyingMarks ?? null);
    if ("petStatus" in payload) addField("pet_status", payload.petStatus);

    if (setClauses.length > 0) {
      params.push(ownerUserId, petId);
      await client.query(
        `update pet_center.pets
         set ${setClauses.join(", ")}
         where owner_user_id = $${params.length - 1} and pet_id = $${params.length}`,
        params
      );
    }

    if (payload.healthProfile) {
      await upsertHealthProfile(client, petId, payload.healthProfile);
    }
  });

  return findPetById(ownerUserId, petId);
}

async function upsertHealthProfile(
  client: PoolClient,
  petId: string,
  healthProfile: NonNullable<CreatePetPayload["healthProfile"]>
): Promise<void> {
  await client.query(
    `insert into pet_center.pet_health_profiles (
       health_profile_id, pet_id, medical_history, allergy_notes, chronic_condition_notes,
       food_type, feeding_portion, special_care_notes, updated_at
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, now())
     on conflict (pet_id) do update set
       medical_history = excluded.medical_history,
       allergy_notes = excluded.allergy_notes,
       chronic_condition_notes = excluded.chronic_condition_notes,
       food_type = excluded.food_type,
       feeding_portion = excluded.feeding_portion,
       special_care_notes = excluded.special_care_notes,
       updated_at = now()`,
    [
      createId("hp"),
      petId,
      healthProfile.medicalHistory ?? null,
      healthProfile.allergyNotes ?? null,
      healthProfile.chronicConditionNotes ?? null,
      healthProfile.foodType ?? null,
      healthProfile.feedingPortion ?? null,
      healthProfile.specialCareNotes ?? null
    ]
  );
}
