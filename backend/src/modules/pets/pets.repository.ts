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
  PetVaccinationStatus,
  StaffOwnerCandidateDto,
  StaffPetDetailDto,
  StaffPetDto,
  StaffPetListFilters
} from "./pets.types.js";
import { mapPet, mapStaffOwnerCandidate, mapStaffPet, mapStaffPetDetail, mapPetDetail, mapPetActivityLog, toDateInput, mapPetMedicalExam, mapPrescriptionItem, mapPetMedicalExamFieldValue, mapPetVaccination, mapPetSpaHistory } from "./pets.mapper.js";

export type PetRow = QueryResultRow & {
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
};

export type PetDetailRow = PetRow & {
  medical_history: string | null;
  allergy_notes: string | null;
  chronic_condition_notes: string | null;
  food_type: string | null;
  feeding_portion: string | null;
  special_care_notes: string | null;
  health_profile_updated_at: string | null;
};

export type StaffPetRow = PetRow & {
  owner_user_id: string;
  owner_name: string;
  owner_phone_number: string | null;
};

export type StaffPetDetailRow = PetDetailRow & {
  owner_user_id: string;
  owner_name: string;
  owner_phone_number: string | null;
  owner_email: string | null;
  owner_address: string | null;
};

export type StaffOwnerCandidateRow = QueryResultRow & {
  user_id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
};

export type PetActivityLogRow = QueryResultRow & {
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

export type CountRow = QueryResultRow & {
  total: string;
};

export type PetMedicalExamRow = QueryResultRow & {
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

export type PetMedicalExamDetailRow = PetMedicalExamRow &
  PetRow & {
    follow_up_id: string | null;
    follow_up_owner_note: string | null;
  };

export type PetMedicalExamFieldValueRow = QueryResultRow & {
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

export type PrescriptionRow = QueryResultRow & {
  prescription_id: string;
  prescribed_at: string;
  general_note: string | null;
};

export type PrescriptionItemRow = QueryResultRow & {
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
};

export type PetVaccinationRow = QueryResultRow & {
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

export type PetSpaHistoryRow = QueryResultRow & {
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

  if (filters.gender) {
    params.push(filters.gender);
    conditions.push(`p.gender = $${params.length}`);
  }

  return {
    whereSql: conditions.join(" and "),
    params
  };
}

function buildStaffListWhere(filters: StaffPetListFilters): { whereSql: string; params: unknown[] } {
  const params: unknown[] = [];
  const conditions = ["true"];

  if (filters.q) {
    params.push(`%${normalizeSearchText(filters.q)}%`);
    const paramIndex = params.length;
    conditions.push(`(
      ${normalizedSql("p.pet_id")} like $${paramIndex}
      or ${normalizedSql("p.pet_name")} like $${paramIndex}
      or ${normalizedSql("p.breed")} like $${paramIndex}
      or ${normalizedSql("u.user_id")} like $${paramIndex}
      or ${normalizedSql("u.full_name")} like $${paramIndex}
      or ${normalizedSql("u.phone_number")} like $${paramIndex}
    )`);
  }

  if (filters.species) {
    params.push(filters.species);
    conditions.push(`p.species = $${params.length}`);
  }

  if (filters.gender) {
    params.push(filters.gender);
    conditions.push(`p.gender = $${params.length}`);
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
  p.identifying_marks
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

export async function findOwnerCandidates(q: string, limit = 5): Promise<StaffOwnerCandidateDto[]> {
  const normalizedQuery = `%${normalizeSearchText(q)}%`;
  const result = await query<StaffOwnerCandidateRow>(
    `select u.user_id,
       u.full_name,
       u.email::text as email,
       u.phone_number,
       u.address
     from pet_center.users u
     where u.role = 'Owner'
       and u.account_status = 'active'
       and (
         ${normalizedSql("u.user_id")} like $1
         or ${normalizedSql("u.full_name")} like $1
         or ${normalizedSql("u.email::text")} like $1
         or ${normalizedSql("u.phone_number")} like $1
       )
     order by u.full_name asc, u.user_id asc
     limit $2`,
    [normalizedQuery, limit]
  );

  return result.rows.map(mapStaffOwnerCandidate);
}

export async function findOwnerById(ownerUserId: string): Promise<StaffOwnerCandidateDto | null> {
  const result = await query<StaffOwnerCandidateRow>(
    `select u.user_id,
       u.full_name,
       u.email::text as email,
       u.phone_number,
       u.address
     from pet_center.users u
     where u.user_id = $1
       and u.role = 'Owner'
       and u.account_status = 'active'
     limit 1`,
    [ownerUserId]
  );

  return result.rows[0] ? mapStaffOwnerCandidate(result.rows[0]) : null;
}

export async function findOwnerByEmail(email: string): Promise<StaffOwnerCandidateDto | null> {
  const result = await query<StaffOwnerCandidateRow>(
    `select u.user_id,
       u.full_name,
       u.email::text as email,
       u.phone_number,
       u.address
     from pet_center.users u
     where u.email = $1
     limit 1`,
    [email]
  );

  return result.rows[0] ? mapStaffOwnerCandidate(result.rows[0]) : null;
}

export async function findOwnerByPhoneNumber(phoneNumber: string): Promise<StaffOwnerCandidateDto | null> {
  const result = await query<StaffOwnerCandidateRow>(
    `select u.user_id,
       u.full_name,
       u.email::text as email,
       u.phone_number,
       u.address
     from pet_center.users u
     where u.phone_number = $1
       and u.role = 'Owner'
     limit 1`,
    [phoneNumber]
  );

  return result.rows[0] ? mapStaffOwnerCandidate(result.rows[0]) : null;
}

export async function createStaffOwner(input: {
  userId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  address?: string | null;
}): Promise<StaffOwnerCandidateDto> {
  const result = await query<StaffOwnerCandidateRow>(
    `insert into pet_center.users (user_id, full_name, email, password_hash, phone_number, address, role)
     values ($1, $2, $3, $4, $5, $6, 'Owner')
     returning user_id, full_name, email::text as email, phone_number, address`,
    [input.userId, input.fullName, input.email, input.passwordHash, input.phoneNumber, input.address ?? null]
  );

  return mapStaffOwnerCandidate(result.rows[0]);
}

export async function findStaffPets(filters: StaffPetListFilters): Promise<{ pets: StaffPetDto[]; total: number }> {
  const { whereSql, params } = buildStaffListWhere(filters);
  const orderSql = filters.sort === "petName:desc" ? "p.pet_name desc, p.pet_id desc" : "p.pet_name asc, p.pet_id asc";
  const listParams = [...params, filters.limit, filters.offset];

  const [listResult, countResult] = await Promise.all([
    query<StaffPetRow>(
      `select ${petSelectSql},
         u.user_id as owner_user_id,
         u.full_name as owner_name,
         u.phone_number as owner_phone_number
       from pet_center.pets p
       inner join pet_center.users u on u.user_id = p.owner_user_id
       where ${whereSql}
       order by ${orderSql}
       limit $${params.length + 1} offset $${params.length + 2}`,
      listParams
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.pets p
       inner join pet_center.users u on u.user_id = p.owner_user_id
       where ${whereSql}`,
      params
    )
  ]);

  return {
    pets: listResult.rows.map(mapStaffPet),
    total: Number(countResult.rows[0]?.total ?? 0)
  };
}

export async function findStaffPetById(petId: string): Promise<StaffPetDetailDto | null> {
  const petResult = await query<StaffPetDetailRow>(
    `select ${petSelectSql},
       php.medical_history,
       php.allergy_notes,
       php.chronic_condition_notes,
       php.food_type,
       php.feeding_portion,
       php.special_care_notes,
       php.updated_at::text as health_profile_updated_at,
       u.user_id as owner_user_id,
       u.full_name as owner_name,
       u.phone_number as owner_phone_number,
       u.email::text as owner_email,
       u.address as owner_address
     from pet_center.pets p
     inner join pet_center.users u on u.user_id = p.owner_user_id
     left join pet_center.pet_health_profiles php on php.pet_id = p.pet_id
     where p.pet_id = $1
     limit 1`,
    [petId]
  );

  const petRow = petResult.rows[0];

  if (!petRow) return null;

  const activities = await findRecentPetActivities(petRow.owner_user_id, petId, 4);

  return mapStaffPetDetail(petRow, activities);
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
  const conditions = [
    "ma.owner_user_id = $1",
    "ma.pet_id = $2",
    "me.exam_status IN ('result_recorded', 'prescribed', 'follow_up_required')"
  ];

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
         ma.exam_type_id,
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
       inner join pet_center.exam_types et on et.exam_type_id = ma.exam_type_id
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
       inner join pet_center.exam_types et on et.exam_type_id = ma.exam_type_id
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
       ma.exam_type_id,
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
     inner join pet_center.exam_types et on et.exam_type_id = ma.exam_type_id
     inner join pet_center.users u on u.user_id = me.examined_by_veterinarian_id
     inner join pet_center.pets p on p.pet_id = ma.pet_id
     left join pet_center.follow_up_instructions fui on fui.exam_id = me.exam_id
     where ma.owner_user_id = $1
       and ma.pet_id = $2
       and me.exam_id = $3
       and me.exam_status in ('result_recorded', 'prescribed', 'follow_up_required')
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
         m.unit as medicine_unit,
         pi.quantity::text as quantity,
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
  const petId = await withTransaction(async (client) => {
    const nextPetId = await createId("pet", client);

    await client.query(
      `insert into pet_center.pets (
         pet_id, owner_user_id, pet_name, species, breed, gender, birth_date, estimated_age,
         fur_color, weight_kg, profile_image_url, identifying_marks
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        nextPetId,
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
      await upsertHealthProfile(client, nextPetId, payload.healthProfile);
    }

    return nextPetId;
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
      await createId("hp", client),
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
