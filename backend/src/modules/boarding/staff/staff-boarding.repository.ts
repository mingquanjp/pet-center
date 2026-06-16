import type { PoolClient } from 'pg';
import { query } from '../../../db/query.js';
import { withTransaction } from '../../../db/transactions.js';
import { createId } from '../../../shared/utils/id.js';
import type {
  BoardingBookingPetRow,
  BoardingRecordCreatedDto,
  BoardingRecordDetailRow,
  BoardingRecordListFilters,
  BoardingRecordListRow,
  BoardingUpdateRow,
  BoardingRoomTypeAvailabilityRow,
  CountRow,
  CreateBoardingRecordInput
} from '../boarding.types.js';

export function toAttachmentUrlArray(params: { attachmentUrl?: string | string[] | null; attachmentUrls?: string[] | null }) {
  if (Array.isArray(params.attachmentUrls)) return params.attachmentUrls;
  if (Array.isArray(params.attachmentUrl)) return params.attachmentUrl;
  if (params.attachmentUrl) return [params.attachmentUrl];
  return [];
}

function buildStaffBoardingFilters(filters: {
  search?: string;
  roomType?: string;
  timeRange?: string;
  tab?: string;
  status?: string;
}) {
  const clauses: string[] = ["1=1"];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`(br.boarding_record_id ILIKE $${params.length} OR p.pet_name ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.phone_number ILIKE $${params.length})`);
  }

  const status = filters.status && filters.status !== "ALL" ? filters.status : filters.tab;
  if (status && status !== "ALL") {
    params.push(status.toLowerCase());
    clauses.push(`br.boarding_status = $${params.length}`);
  }

  if (filters.roomType && filters.roomType !== "ALL") {
    if (filters.roomType === "VIP") {
      clauses.push("rt.room_type_name ILIKE '%VIP%'");
    } else if (filters.roomType === "STANDARD") {
      clauses.push("rt.room_type_name NOT ILIKE '%VIP%'");
    } else if (filters.roomType === "UNASSIGNED") {
      clauses.push("1=0");
    } else {
      params.push(filters.roomType);
      clauses.push(`br.room_type_id = $${params.length}`);
    }
  }

  if (filters.timeRange && filters.timeRange !== "ALL") {
    if (filters.timeRange === "TODAY") {
      clauses.push("br.planned_check_in_at::date = CURRENT_DATE");
    } else if (filters.timeRange === "THIS_WEEK") {
      clauses.push("br.planned_check_in_at >= date_trunc('week', CURRENT_DATE) AND br.planned_check_in_at < date_trunc('week', CURRENT_DATE) + interval '1 week'");
    } else if (filters.timeRange === "THIS_MONTH") {
      clauses.push("br.planned_check_in_at >= date_trunc('month', CURRENT_DATE) AND br.planned_check_in_at < date_trunc('month', CURRENT_DATE) + interval '1 month'");
    }
  }

  return { clauses, params };
}

const staffBoardingSelectSql = `
  SELECT
    br.boarding_record_id,
    br.pet_id,
    br.owner_user_id,
    br.room_type_id,
    br.planned_check_in_at,
    br.planned_check_out_at,
    br.actual_check_in_at,
    br.actual_check_out_at,
    br.care_request,
    br.estimated_total,
    br.boarding_status,
    br.created_at,
    br.rejection_reason,
    br.handled_by_staff_id,
    p.pet_name,
    p.species,
    p.breed,
    p.birth_date,
    p.estimated_age,
    p.profile_image_url,
    CASE
      WHEN p.birth_date IS NOT NULL THEN concat(GREATEST(0, date_part('year', age(CURRENT_DATE, p.birth_date))::int), ' tuổi')
      WHEN p.estimated_age IS NOT NULL THEN concat(trim(to_char(p.estimated_age, 'FM999999990.##')), ' tuổi')
      ELSE NULL
    END AS age_text,
    u.user_id AS owner_id,
    u.full_name AS owner_name,
    u.phone_number AS owner_phone,
    u.email AS owner_email,
    staff.full_name AS handled_by_staff_name,
    rt.room_type_name,
    inv.invoice_id,
    inv.payment_option,
    inv.invoice_status,
    inv.total_amount AS final_amount,
    EXISTS (
      SELECT 1
      FROM pet_center.payments pay
      WHERE pay.invoice_id = inv.invoice_id
        AND pay.payment_status = 'success'
    ) AS has_success_payment,
    latest_update.updated_at AS latest_update_at,
    latest_update.alert_level AS latest_alert_level,
    status_update.updated_at AS status_update_at
  FROM pet_center.boarding_records br
  JOIN pet_center.pets p ON p.pet_id = br.pet_id
  JOIN pet_center.users u ON u.user_id = br.owner_user_id
  LEFT JOIN pet_center.users staff ON staff.user_id = br.handled_by_staff_id
  LEFT JOIN pet_center.room_types rt ON rt.room_type_id = br.room_type_id
  LEFT JOIN LATERAL (
    SELECT i.invoice_id, i.payment_option, i.invoice_status, i.total_amount, i.issued_at
    FROM pet_center.invoice_lines il
    JOIN pet_center.invoices i ON i.invoice_id = il.invoice_id
    WHERE il.source_type = 'boarding'
      AND il.source_id = br.boarding_record_id
    ORDER BY i.issued_at DESC, i.invoice_id DESC
    LIMIT 1
  ) inv ON true
  LEFT JOIN LATERAL (
    SELECT bu.updated_at, bu.alert_level
    FROM pet_center.boarding_updates bu
    WHERE bu.boarding_record_id = br.boarding_record_id
      AND bu.visibility_status = 'published'
    ORDER BY bu.updated_at DESC
    LIMIT 1
  ) latest_update ON true
  LEFT JOIN LATERAL (
    SELECT bu.updated_at
    FROM pet_center.boarding_updates bu
    WHERE bu.boarding_record_id = br.boarding_record_id
      AND bu.visibility_status = 'published'
      AND (
        (br.boarding_status = 'confirmed' AND bu.update_note LIKE '[SYSTEM_CONFIRM]%')
        OR (br.boarding_status = 'staying' AND bu.update_note LIKE '[SYSTEM_CHECKIN]%')
        OR (br.boarding_status = 'checked_out' AND bu.update_note LIKE '[SYSTEM_CHECKOUT]%')
        OR (br.boarding_status = 'rejected' AND bu.update_note LIKE '[SYSTEM_REJECT]%')
      )
    ORDER BY bu.updated_at DESC
    LIMIT 1
  ) status_update ON true
`;

export async function findStaffBoardingList(filters: {
  search?: string;
  status?: string;
  roomType?: string;
  timeRange?: string;
  tab?: string;
  limit: number;
  offset: number;
}) {
  const { clauses, params } = buildStaffBoardingFilters(filters);
  params.push(filters.limit, filters.offset);

  const sql = `
    ${staffBoardingSelectSql}
    WHERE ${clauses.join(" AND ")}
    ORDER BY
      CASE br.boarding_status
        WHEN 'pending' THEN 1
        WHEN 'confirmed' THEN 2
        WHEN 'staying' THEN 3
        WHEN 'checked_out' THEN 4
        ELSE 5
      END,
      (status_update.updated_at IS NOT NULL) DESC,
      status_update.updated_at DESC NULLS LAST,
      COALESCE(latest_update.updated_at, br.created_at) DESC,
      br.boarding_record_id DESC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `;

  const result = await query(sql, params);
  return result.rows;
}

export async function countStaffBoardingList(filters: {
  search?: string;
  status?: string;
  roomType?: string;
  timeRange?: string;
  tab?: string;
}) {
  const { clauses, params } = buildStaffBoardingFilters(filters);

  const sql = `
    SELECT COUNT(*)::int AS total
    FROM pet_center.boarding_records br
    JOIN pet_center.pets p ON p.pet_id = br.pet_id
    JOIN pet_center.users u ON u.user_id = br.owner_user_id
    LEFT JOIN pet_center.room_types rt ON rt.room_type_id = br.room_type_id
    WHERE ${clauses.join(" AND ")}
  `;

  const result = await query(sql, params);
  return Number(result.rows[0]?.total ?? 0);
}

export async function countStaffBoardingStats(filters: {
  search?: string;
  roomType?: string;
  timeRange?: string;
}) {
  const { clauses, params } = buildStaffBoardingFilters(filters);

  const sql = `
    SELECT
      COUNT(*)::int AS "allCount",
      COUNT(*) FILTER (WHERE br.boarding_status = 'pending')::int AS "pendingCount",
      COUNT(*) FILTER (WHERE br.boarding_status = 'confirmed')::int AS "confirmedCount",
      COUNT(*) FILTER (WHERE br.boarding_status = 'staying')::int AS "stayingCount",
      COUNT(*) FILTER (WHERE br.boarding_status = 'checked_out')::int AS "checkedOutCount",
      COUNT(*) FILTER (WHERE br.boarding_status = 'rejected')::int AS "rejectedCount",
      COUNT(*) FILTER (WHERE br.boarding_status = 'cancelled')::int AS "cancelledCount"
    FROM pet_center.boarding_records br
    JOIN pet_center.pets p ON p.pet_id = br.pet_id
    JOIN pet_center.users u ON u.user_id = br.owner_user_id
    LEFT JOIN pet_center.room_types rt ON rt.room_type_id = br.room_type_id
    WHERE ${clauses.join(" AND ")}
  `;

  const result = await query(sql, params);
  return result.rows[0];
}

export async function findStaffBoardingDetailById(boardingId: string) {
  const sql = `
    ${staffBoardingSelectSql}
    WHERE br.boarding_record_id = $1
    LIMIT 1
  `;
  const result = await query(sql, [boardingId]);
  return result.rows[0] || null;
}

export async function updateBoardingToConfirmed(params: { boardingRecordId: string; handledByStaffId?: string; userId?: string }) {
  const sql = `
    UPDATE pet_center.boarding_records
    SET boarding_status = 'confirmed',
        handled_by_staff_id = $2
    WHERE boarding_record_id = $1
      AND boarding_status = 'pending'
    RETURNING *
  `;
  const result = await query(sql, [params.boardingRecordId, params.handledByStaffId ?? params.userId]);
  return result.rows[0];
}

export async function updateBoardingToRejected(params: { boardingRecordId: string; rejectionReason: string; handledByStaffId?: string; userId?: string }) {
  const sql = `
    UPDATE pet_center.boarding_records
    SET boarding_status = 'rejected',
        rejection_reason = $2,
        handled_by_staff_id = $3
    WHERE boarding_record_id = $1
      AND boarding_status = 'pending'
    RETURNING *
  `;
  const result = await query(sql, [params.boardingRecordId, params.rejectionReason, params.handledByStaffId ?? params.userId]);
  return result.rows[0];
}

export async function updateBoardingToStaying(params: { boardingRecordId: string; handledByStaffId?: string; userId?: string }) {
  const sql = `
    UPDATE pet_center.boarding_records
    SET boarding_status = 'staying',
        actual_check_in_at = NOW(),
        handled_by_staff_id = $2
    WHERE boarding_record_id = $1
      AND boarding_status = 'confirmed'
    RETURNING *
  `;
  const result = await query(sql, [params.boardingRecordId, params.handledByStaffId ?? params.userId]);
  return result.rows[0];
}

export async function updateBoardingToCheckedOut(params: { boardingRecordId: string; handledByStaffId?: string; userId?: string; actualCheckOutAt?: Date }) {
  const sql = `
    UPDATE pet_center.boarding_records
    SET actual_check_in_at = CASE
          WHEN actual_check_in_at IS NULL
            OR actual_check_in_at >= COALESCE($3::timestamptz, NOW())
          THEN COALESCE($3::timestamptz, NOW()) - INTERVAL '1 minute'
          ELSE actual_check_in_at
        END,
        boarding_status = 'checked_out',
        actual_check_out_at = COALESCE($3::timestamptz, NOW()),
        handled_by_staff_id = $2
    WHERE boarding_record_id = $1
      AND boarding_status = 'staying'
    RETURNING *
  `;
  const result = await query(sql, [params.boardingRecordId, params.handledByStaffId ?? params.userId, params.actualCheckOutAt ?? null]);
  return result.rows[0];
}

// ==========================================
// STAFF CREATE BOARDING AT COUNTER REPOSITORY FUNCTIONS
// ==========================================

export async function findStaffBoardingCreateOwners(params?: { searchOwner?: string }) {
  const clauses: string[] = ["u.role = 'Owner'"];
  const values: unknown[] = [];

  if (params?.searchOwner) {
    values.push(`%${params.searchOwner}%`);
    clauses.push(`(u.full_name ILIKE $${values.length} OR u.phone_number ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
  }

  const sql = `
    SELECT
      u.user_id as id,
      u.full_name as "fullName",
      u.phone_number as "phoneNumber",
      CASE WHEN u.email::text LIKE '%@petcenter.local' THEN NULL ELSE u.email::text END as email,
      u.address
    FROM pet_center.users u
    WHERE ${clauses.join(" AND ")}
      AND u.account_status = 'active'
    ORDER BY u.created_at DESC
  `;
  const result = await query(sql, values);
  return result.rows;
}

export async function findStaffOwnerByPhoneNumber(phoneNumber: string, client?: PoolClient) {
  const sql = `
    SELECT user_id as id
    FROM pet_center.users
    WHERE role = 'Owner'
      AND account_status = 'active'
      AND phone_number = $1
    LIMIT 1
  `;
  const result = client ? await client.query(sql, [phoneNumber]) : await query(sql, [phoneNumber]);
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email: string, client?: PoolClient) {
  const sql = `
    SELECT user_id as id
    FROM pet_center.users
    WHERE email = $1
    LIMIT 1
  `;
  const result = client ? await client.query(sql, [email]) : await query(sql, [email]);
  return result.rows[0] ?? null;
}

export async function createStaffBoardingOwner(params: {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  passwordHash: string;
  address: string | null;
}, client?: PoolClient) {
  const sql = `
    INSERT INTO pet_center.users (
      user_id,
      full_name,
      email,
      password_hash,
      phone_number,
      address,
      role,
      account_status,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'Owner', 'active', NOW())
    RETURNING
      user_id as id,
      full_name as "fullName",
      phone_number as "phoneNumber",
      CASE WHEN email::text LIKE '%@petcenter.local' THEN NULL ELSE email::text END as email,
      address
  `;
  const values = [
    params.userId,
    params.fullName,
    params.email,
    params.passwordHash,
    params.phoneNumber,
    params.address
  ];
  const result = client ? await client.query(sql, values) : await query(sql, values);
  return result.rows[0];
}

export async function findStaffBoardingCreatePets(ownerIds?: string[]) {
  if (ownerIds && ownerIds.length === 0) return [];

  const clauses: string[] = [];
  const values: unknown[] = [];

  if (ownerIds && ownerIds.length > 0) {
    values.push(ownerIds);
    clauses.push(`p.owner_user_id = ANY($${values.length})`);
  }

  const sql = `
    SELECT p.pet_id as id, p.owner_user_id as "ownerId", p.pet_name as name, 
           p.species, p.breed, p.profile_image_url as "imageUrl", p.identifying_marks as "healthNote",
           CASE
             WHEN p.birth_date IS NOT NULL THEN concat(GREATEST(0, date_part('year', age(CURRENT_DATE, p.birth_date))::int), ' tuổi')
             WHEN p.estimated_age IS NOT NULL THEN concat(trim(to_char(p.estimated_age, 'FM999999990.##')), ' tuổi')
             ELSE NULL
           END AS "ageText",
           CASE
             WHEN p.weight_kg IS NOT NULL THEN concat(trim(to_char(p.weight_kg, 'FM999999990.##')), ' kg')
             ELSE NULL
           END AS "weightText"
    FROM pet_center.pets p
    ${clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""}
  `;
  const result = await query(sql, values);
  return result.rows;
}

export async function createStaffBoardingPet(params: {
  petId: string;
  ownerId: string;
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed: string;
  gender: "male" | "female" | "unknown";
  birthDate: Date | null;
  estimatedAge: number | null;
  furColor: string | null;
  weightKg: number | null;
  profileImageUrl: string | null;
  identifyingMarks: string | null;
}, client?: PoolClient) {
  const sql = `
    INSERT INTO pet_center.pets (
      pet_id,
      owner_user_id,
      pet_name,
      species,
      breed,
      gender,
      birth_date,
      estimated_age,
      fur_color,
      weight_kg,
      profile_image_url,
      identifying_marks
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING
      pet_id as id,
      owner_user_id as "ownerId",
      pet_name as name,
      species,
      breed,
      profile_image_url as "imageUrl",
      identifying_marks as "healthNote",
      CASE
        WHEN birth_date IS NOT NULL THEN concat(GREATEST(0, date_part('year', age(CURRENT_DATE, birth_date))::int), ' tuổi')
        WHEN estimated_age IS NOT NULL THEN concat(trim(to_char(estimated_age, 'FM999999990.##')), ' tuổi')
        ELSE NULL
      END AS "ageText",
      CASE
        WHEN weight_kg IS NOT NULL THEN concat(trim(to_char(weight_kg, 'FM999999990.##')), ' kg')
        ELSE NULL
      END AS "weightText"
  `;
  const values = [
    params.petId,
    params.ownerId,
    params.petName,
    params.species,
    params.breed,
    params.gender,
    params.birthDate,
    params.estimatedAge,
    params.furColor,
    params.weightKg,
    params.profileImageUrl,
    params.identifyingMarks
  ];
  const result = client ? await client.query(sql, values) : await query(sql, values);
  return result.rows[0];
}

export async function verifyOwnerExists(ownerId: string, client?: PoolClient) {
  const sql = `SELECT 1 FROM pet_center.users WHERE user_id = $1 AND role = 'Owner'`;
  const result = client ? await client.query(sql, [ownerId]) : await query(sql, [ownerId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function verifyPetBelongsToOwner(petId: string, ownerId: string, client?: PoolClient) {
  const sql = `SELECT 1 FROM pet_center.pets WHERE pet_id = $1 AND owner_user_id = $2`;
  const result = client ? await client.query(sql, [petId, ownerId]) : await query(sql, [petId, ownerId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function lockBoardingRecordsForAvailability(client: PoolClient) {
  await client.query("LOCK TABLE pet_center.boarding_records IN SHARE ROW EXCLUSIVE MODE");
}

export async function createBoardingRecordAtCounter(params: {
  boardingRecordId: string;
  petId: string;
  ownerId: string;
  roomTypeId: string;
  plannedCheckInAt: Date;
  plannedCheckOutAt: Date;
  careRequest: string | null;
  estimatedTotal: number;
  handledByStaffId: string;
}, client: PoolClient) {
  const sql = `
    INSERT INTO pet_center.boarding_records (
      boarding_record_id, pet_id, owner_user_id, room_type_id,
      planned_check_in_at, planned_check_out_at, actual_check_in_at, care_request,
      estimated_total, boarding_status, handled_by_staff_id, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, 'staying', $9, NOW())
    RETURNING actual_check_in_at
  `;
  const result = await client.query(sql, [
    params.boardingRecordId,
    params.petId,
    params.ownerId,
    params.roomTypeId,
    params.plannedCheckInAt,
    params.plannedCheckOutAt,
    params.careRequest,
    params.estimatedTotal,
    params.handledByStaffId
  ]);
  return result.rows[0];
}

