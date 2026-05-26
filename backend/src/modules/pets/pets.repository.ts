import type { PoolClient, QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import { createId } from "../../shared/utils/id.js";
import { normalizeSearchText } from "../../shared/utils/search.js";
import type { CreatePetPayload, UpdatePetPayload } from "./pets.schema.js";
import type { PetDetailDto, PetDisplayStatus, PetDto, PetListFilters, PetSpecies } from "./pets.types.js";

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

type CountRow = QueryResultRow & {
  total: string;
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

function mapPetDetail(row: PetDetailRow): PetDetailDto {
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
    }
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
  const result = await query<PetDetailRow>(
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
  );

  return result.rows[0] ? mapPetDetail(result.rows[0]) : null;
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
