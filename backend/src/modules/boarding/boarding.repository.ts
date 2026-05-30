import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import { createId } from "../../shared/utils/id.js";
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
} from "./boarding.types.js";

const activeBoardingStatuses = ["pending", "confirmed", "staying", "checked_out"] as const;

function buildBoardingRecordWhere(filters: BoardingRecordListFilters): { clauses: string[]; params: unknown[] } {
  const clauses = [
    "br.owner_user_id = $1",
    "br.boarding_status = ANY($2)"
  ];
  const params: unknown[] = [filters.ownerUserId, activeBoardingStatuses];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`(br.boarding_record_id ILIKE $${params.length} OR p.pet_name ILIKE $${params.length})`);
  }

  if (filters.status !== "all") {
    params.push(filters.status);
    clauses.push(`br.boarding_status = $${params.length}`);
  }

  if (filters.roomTypeId) {
    params.push(filters.roomTypeId);
    clauses.push(`br.room_type_id = $${params.length}`);
  }

  if (filters.timeRange === "upcoming") {
    clauses.push("br.boarding_status IN ('pending', 'confirmed')");
    clauses.push("br.planned_check_in_at::date >= CURRENT_DATE");
  } else if (filters.timeRange === "current") {
    clauses.push("br.boarding_status = 'staying'");
  } else if (filters.timeRange === "past") {
    clauses.push("br.boarding_status = 'checked_out'");
  }

  return { clauses, params };
}

export async function findOwnerBoardingRecords(filters: BoardingRecordListFilters): Promise<BoardingRecordListRow[]> {
  const { clauses, params } = buildBoardingRecordWhere(filters);
  params.push(filters.limit, filters.offset);

  const sql = `
    SELECT
      br.boarding_record_id,
      p.pet_id,
      p.pet_name,
      p.profile_image_url,
      rt.room_type_id,
      rt.room_type_name,
      br.planned_check_in_at,
      br.planned_check_out_at,
      to_char(br.planned_check_in_at::date, 'YYYY-MM-DD') AS planned_check_in_date,
      to_char(br.planned_check_out_at::date, 'YYYY-MM-DD') AS planned_check_out_date,
      to_char(br.planned_check_in_at::date, 'DD/MM/YYYY') || ' - ' || to_char(br.planned_check_out_at::date, 'DD/MM/YYYY') AS planned_date_range_text,
      (br.planned_check_out_at::date - br.planned_check_in_at::date)::int AS stay_days,
      br.boarding_status,
      br.estimated_total,
      inv.invoice_id,
      inv.payment_option,
      inv.invoice_status,
      EXISTS (
        SELECT 1
        FROM pet_center.payments pay
        WHERE pay.invoice_id = inv.invoice_id
          AND pay.payment_status = 'success'
      ) AS has_success_payment,
      latest_update.updated_at AS last_update_at,
      latest_update.alert_level
    FROM pet_center.boarding_records br
    JOIN pet_center.pets p ON p.pet_id = br.pet_id
    JOIN pet_center.room_types rt ON rt.room_type_id = br.room_type_id
    LEFT JOIN LATERAL (
      SELECT i.invoice_id, i.payment_option, i.invoice_status, i.issued_at
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
    WHERE ${clauses.join(" AND ")}
    ORDER BY
      CASE br.boarding_status
        WHEN 'staying' THEN 1
        WHEN 'confirmed' THEN 2
        WHEN 'pending' THEN 3
        WHEN 'checked_out' THEN 4
        ELSE 5
      END,
      br.planned_check_in_at DESC,
      br.boarding_record_id DESC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `;

  const result = await query<BoardingRecordListRow>(sql, params);

  return result.rows;
}

export async function countOwnerBoardingRecords(filters: BoardingRecordListFilters): Promise<number> {
  const { clauses, params } = buildBoardingRecordWhere(filters);
  const sql = `
    SELECT COUNT(*)::text AS total
    FROM pet_center.boarding_records br
    JOIN pet_center.pets p ON p.pet_id = br.pet_id
    WHERE ${clauses.join(" AND ")}
  `;
  const result = await query<CountRow>(sql, params);

  return Number(result.rows[0]?.total ?? 0);
}

export async function findOwnerBoardingRecordDetail(
  ownerUserId: string,
  boardingRecordId: string
): Promise<BoardingRecordDetailRow | null> {
  const result = await query<BoardingRecordDetailRow>(
    `
      SELECT
        br.boarding_record_id,
        p.pet_id,
        p.pet_name,
        p.species,
        p.weight_kg,
        p.profile_image_url,
        rt.room_type_id,
        rt.room_type_name,
        rt.description AS room_description,
        br.planned_check_in_at,
        br.planned_check_out_at,
        br.actual_check_in_at,
        br.actual_check_out_at,
        br.care_request,
        to_char(br.planned_check_in_at::date, 'YYYY-MM-DD') AS planned_check_in_date,
        to_char(br.planned_check_out_at::date, 'YYYY-MM-DD') AS planned_check_out_date,
        to_char(br.planned_check_in_at::date, 'DD/MM/YYYY') || ' - ' || to_char(br.planned_check_out_at::date, 'DD/MM/YYYY') AS planned_date_range_text,
        (br.planned_check_out_at::date - br.planned_check_in_at::date)::int AS stay_days,
        br.boarding_status,
        br.estimated_total,
        inv.invoice_id,
        inv.payment_option,
        inv.invoice_status,
        pay.receipt_code,
        pay.receipt_url,
        (pay.payment_id IS NOT NULL) AS has_success_payment,
        latest_update.updated_at AS last_update_at,
        latest_update.alert_level
      FROM pet_center.boarding_records br
      JOIN pet_center.pets p ON p.pet_id = br.pet_id
      JOIN pet_center.room_types rt ON rt.room_type_id = br.room_type_id
      LEFT JOIN LATERAL (
        SELECT i.invoice_id, i.payment_option, i.invoice_status, i.issued_at
        FROM pet_center.invoice_lines il
        JOIN pet_center.invoices i ON i.invoice_id = il.invoice_id
        WHERE il.source_type = 'boarding'
          AND il.source_id = br.boarding_record_id
        ORDER BY i.issued_at DESC, i.invoice_id DESC
        LIMIT 1
      ) inv ON true
      LEFT JOIN LATERAL (
        SELECT payment_id, receipt_code, receipt_url
        FROM pet_center.payments payment
        WHERE payment.invoice_id = inv.invoice_id
          AND payment.payment_status = 'success'
        ORDER BY payment.paid_at DESC NULLS LAST, payment.payment_id DESC
        LIMIT 1
      ) pay ON true
      LEFT JOIN LATERAL (
        SELECT bu.updated_at, bu.alert_level
        FROM pet_center.boarding_updates bu
        WHERE bu.boarding_record_id = br.boarding_record_id
          AND bu.visibility_status = 'published'
        ORDER BY bu.updated_at DESC
        LIMIT 1
      ) latest_update ON true
      WHERE br.owner_user_id = $1
        AND br.boarding_record_id = $2
        AND br.boarding_status = ANY($3)
      LIMIT 1
    `,
    [ownerUserId, boardingRecordId, activeBoardingStatuses]
  );

  return result.rows[0] ?? null;
}

export async function findPublishedBoardingUpdates(boardingRecordId: string): Promise<BoardingUpdateRow[]> {
  const result = await query<BoardingUpdateRow>(
    `SELECT
       boarding_update_id,
       updated_at,
       update_note,
       attachment_url,
       alert_level
     FROM pet_center.boarding_updates
     WHERE boarding_record_id = $1
       AND visibility_status = 'published'
     ORDER BY updated_at DESC, boarding_update_id DESC`,
    [boardingRecordId]
  );

  return result.rows;
}

export async function updateBoardingRecordStatus(
  boardingRecordId: string,
  status: string
): Promise<void> {
  await query(
    `UPDATE pet_center.boarding_records
     SET boarding_status = $1, updated_at = NOW()
     WHERE boarding_record_id = $2`,
    [status, boardingRecordId]
  );
}

export async function findOwnerBookingPets(ownerUserId: string): Promise<BoardingBookingPetRow[]> {
  const result = await query<BoardingBookingPetRow>(
    `SELECT pet_id, pet_name, species, weight_kg, profile_image_url
     FROM pet_center.pets
     WHERE owner_user_id = $1
       AND pet_status = 'active'
     ORDER BY pet_name ASC, pet_id ASC`,
    [ownerUserId]
  );

  return result.rows;
}

export async function findOwnerBookingPet(
  ownerUserId: string,
  petId: string
): Promise<BoardingBookingPetRow | null> {
  const result = await query<BoardingBookingPetRow>(
    `SELECT pet_id, pet_name, species, weight_kg, profile_image_url
     FROM pet_center.pets
     WHERE owner_user_id = $1
       AND pet_id = $2
       AND pet_status = 'active'
     LIMIT 1`,
    [ownerUserId, petId]
  );

  return result.rows[0] ?? null;
}

export async function findActiveRoomTypesWithAvailability(
  plannedCheckInAt?: Date,
  plannedCheckOutAt?: Date,
  client?: PoolClient
): Promise<BoardingRoomTypeAvailabilityRow[]> {
  const params: unknown[] = [];
  const bookedUnitsSql =
    plannedCheckInAt && plannedCheckOutAt
      ? `
        SELECT COUNT(*)::int
        FROM pet_center.boarding_records br
        WHERE br.room_type_id = rt.room_type_id
          AND br.boarding_status IN ('pending', 'confirmed', 'staying')
          AND br.planned_check_in_at < $1
          AND br.planned_check_out_at > $2
      `
      : "SELECT 0::int";

  if (plannedCheckInAt && plannedCheckOutAt) {
    params.push(plannedCheckOutAt, plannedCheckInAt);
  }

  const sql = `SELECT
     rt.room_type_id,
     rt.room_type_name,
     rt.capacity,
     rt.boarding_unit_price,
     rt.description,
     (${bookedUnitsSql}) AS booked_units
   FROM pet_center.room_types rt
   WHERE rt.room_type_status = 'active'
   ORDER BY rt.boarding_unit_price ASC, rt.room_type_name ASC`;
  const result = client
    ? await client.query<BoardingRoomTypeAvailabilityRow>(sql, params)
    : await query<BoardingRoomTypeAvailabilityRow>(sql, params);

  return result.rows;
}

async function hasOverlappingActiveBoardingForPet(
  client: PoolClient,
  petId: string,
  plannedCheckInAt: Date,
  plannedCheckOutAt: Date
): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM pet_center.boarding_records br
       WHERE br.pet_id = $1
         AND br.boarding_status IN ('pending', 'confirmed', 'staying')
         AND br.planned_check_in_at < $2
         AND br.planned_check_out_at > $3
     ) AS "exists"`,
    [petId, plannedCheckOutAt, plannedCheckInAt]
  );

  return result.rows[0]?.exists ?? false;
}

function createBoardingCode(date: Date): string {
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");

  return `BRD-${datePart}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createBoardingRecord(input: CreateBoardingRecordInput): Promise<BoardingRecordCreatedDto> {
  return withTransaction(async (client) => {
    await client.query("lock table pet_center.boarding_records in share row exclusive mode");

    const roomTypes = await findActiveRoomTypesWithAvailability(
      input.plannedCheckInAt,
      input.plannedCheckOutAt,
      client
    );
    const roomType = roomTypes.find((room) => room.room_type_id === input.roomType.roomTypeId);

    if (!roomType || Number(roomType.booked_units) >= Number(roomType.capacity)) {
      throw new Error("BOARDING_ROOM_FULL");
    }

    const petHasOverlappingBooking = await hasOverlappingActiveBoardingForPet(
      client,
      input.pet.petId,
      input.plannedCheckInAt,
      input.plannedCheckOutAt
    );

    if (petHasOverlappingBooking) {
      throw new Error("BOARDING_PET_TIME_CONFLICT");
    }

    const boardingRecordId = createBoardingCode(input.plannedCheckInAt);
    const invoiceId = createId("inv");
    const invoiceLineId = createId("inl");
    const boardingStatus = input.paymentOption === "online" ? "pending_payment" : "pending";
    const invoiceStatus = "pending_payment";
    const unitPrice = input.roomType.unitPrice;
    const totalAmount = input.stayDays * unitPrice;

    await client.query(
      `INSERT INTO pet_center.boarding_records (
         boarding_record_id, pet_id, owner_user_id, room_type_id,
         planned_check_in_at, planned_check_out_at, care_request,
         estimated_total, boarding_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        boardingRecordId,
        input.pet.petId,
        input.ownerUserId,
        input.roomType.roomTypeId,
        input.plannedCheckInAt,
        input.plannedCheckOutAt,
        input.careRequest ?? null,
        totalAmount,
        boardingStatus
      ]
    );

    await client.query(
      `INSERT INTO pet_center.invoices (
         invoice_id, owner_user_id, pet_id, subtotal_amount, discount_amount,
         surcharge_amount, total_amount, payment_option, invoice_status
       )
       VALUES ($1, $2, $3, $4, 0, 0, $4, $5, $6)`,
      [invoiceId, input.ownerUserId, input.pet.petId, totalAmount, input.paymentOption, invoiceStatus]
    );

    await client.query(
      `INSERT INTO pet_center.invoice_lines (
         invoice_line_id, invoice_id, source_type, source_id, description,
         quantity, unit_price, line_discount_amount, line_amount
       )
       VALUES ($1, $2, 'boarding', $3, $4, $5, $6, 0, $7)`,
      [
        invoiceLineId,
        invoiceId,
        boardingRecordId,
        input.roomType.roomTypeName,
        input.stayDays,
        unitPrice,
        totalAmount
      ]
    );

    return {
      boardingRecordId,
      boardingCode: boardingRecordId,
      invoiceId,
      paymentOption: input.paymentOption,
      boardingStatus,
      invoiceStatus,
      totalAmount,
      paymentUrl: null,
      petName: input.pet.petName,
      roomTypeName: input.roomType.roomTypeName,
      plannedCheckInAt: input.plannedCheckInAt.toISOString(),
      plannedCheckOutAt: input.plannedCheckOutAt.toISOString(),
      stayDays: input.stayDays
    };
  });
}

// ==========================================
// STAFF BOARDING REPOSITORY FUNCTIONS
// ==========================================

function toAttachmentUrlArray(params: { attachmentUrl?: string | string[] | null; attachmentUrls?: string[] | null }) {
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
    latest_update.alert_level AS latest_alert_level
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
      GREATEST(COALESCE(latest_update.updated_at, '1970-01-01'::timestamptz), COALESCE(br.updated_at, '1970-01-01'::timestamptz), br.created_at) DESC,
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

export async function findBoardingUpdatesByBoardingRecordId(
  boardingRecordId: string,
  options: { visibilityStatus?: "draft" | "published" } = {}
) {
  const params: unknown[] = [boardingRecordId];
  const clauses = ["bu.boarding_record_id = $1"];

  if (options.visibilityStatus) {
    params.push(options.visibilityStatus);
    clauses.push(`bu.visibility_status = $${params.length}`);
  }

  const sql = `
    SELECT
      bu.boarding_update_id,
      bu.boarding_record_id,
      bu.created_by_user_id,
      staff.full_name AS created_by_full_name,
      bu.updated_at,
      bu.update_note,
      bu.attachment_url,
      bu.alert_level,
      bu.visibility_status
    FROM pet_center.boarding_updates bu
    LEFT JOIN pet_center.users staff ON staff.user_id = bu.created_by_user_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY bu.updated_at DESC
  `;
  const result = await query(sql, params);
  return result.rows;
}

export async function findLatestDraftUpdateByBoardingIdAndUserId(boardingRecordId: string, userId: string) {
  const sql = `
    SELECT
      bu.boarding_update_id,
      bu.boarding_record_id,
      bu.created_by_user_id,
      staff.full_name AS created_by_full_name,
      bu.updated_at,
      bu.update_note,
      bu.attachment_url,
      bu.alert_level,
      bu.visibility_status
    FROM pet_center.boarding_updates bu
    LEFT JOIN pet_center.users staff ON staff.user_id = bu.created_by_user_id
    WHERE bu.boarding_record_id = $1
      AND bu.created_by_user_id = $2
      AND bu.visibility_status = 'draft'
    ORDER BY bu.updated_at DESC
    LIMIT 1
  `;
  const result = await query(sql, [boardingRecordId, userId]);
  return result.rows[0] || null;
}

export async function insertBoardingUpdate(params: {
  boardingUpdateId?: string;
  boardingRecordId: string;
  createdByUserId?: string;
  userId?: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
  visibilityStatus: "draft" | "published";
}) {
  const sql = `
    INSERT INTO pet_center.boarding_updates (
      boarding_update_id,
      boarding_record_id,
      created_by_user_id,
      update_note,
      attachment_url,
      alert_level,
      visibility_status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await query(sql, [
    params.boardingUpdateId ?? createId("bup"),
    params.boardingRecordId,
    params.createdByUserId ?? params.userId,
    params.updateNote ?? params.description,
    toAttachmentUrlArray(params),
    params.alertLevel,
    params.visibilityStatus
  ]);
  return result.rows[0];
}

export async function insertBoardingUpdateIfNotDuplicate(params: {
  boardingUpdateId?: string;
  boardingRecordId: string;
  createdByUserId?: string;
  userId?: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
  visibilityStatus: "draft" | "published";
}) {
  return withTransaction(async (client) => {
    const createdByUserId = params.createdByUserId ?? params.userId;
    const updateNote = params.updateNote ?? params.description;

    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
      [params.boardingRecordId, createdByUserId ?? "anonymous"]
    );

    if (params.visibilityStatus === "published") {
      const duplicate = await client.query(
        `SELECT *
         FROM pet_center.boarding_updates
         WHERE boarding_record_id = $1
           AND created_by_user_id IS NOT DISTINCT FROM $2
           AND update_note = $3
           AND alert_level = $4
           AND visibility_status = 'published'
           AND updated_at >= NOW() - INTERVAL '2 minutes'
         ORDER BY updated_at DESC
         LIMIT 1`,
        [params.boardingRecordId, createdByUserId, updateNote, params.alertLevel]
      );

      if (duplicate.rows[0]) {
        return duplicate.rows[0];
      }
    }

    const result = await client.query(
      `INSERT INTO pet_center.boarding_updates (
        boarding_update_id,
        boarding_record_id,
        created_by_user_id,
        update_note,
        attachment_url,
        alert_level,
        visibility_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        params.boardingUpdateId ?? createId("bup"),
        params.boardingRecordId,
        createdByUserId,
        updateNote,
        toAttachmentUrlArray(params),
        params.alertLevel,
        params.visibilityStatus
      ]
    );

    return result.rows[0];
  });
}

export async function updateBoardingUpdate(params: {
  boardingUpdateId: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
  visibilityStatus: "draft" | "published";
}) {
  const sql = `
    UPDATE pet_center.boarding_updates
    SET update_note = $2,
        attachment_url = $3,
        alert_level = $4,
        visibility_status = $5,
        updated_at = NOW()
    WHERE boarding_update_id = $1
    RETURNING *
  `;
  const result = await query(sql, [
    params.boardingUpdateId,
    params.updateNote ?? params.description,
    toAttachmentUrlArray(params),
    params.alertLevel,
    params.visibilityStatus
  ]);
  return result.rows[0];
}

export async function publishDraftBoardingUpdate(params: {
  boardingUpdateId: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
}) {
  return updateBoardingUpdate({
    boardingUpdateId: params.boardingUpdateId,
    updateNote: params.updateNote,
    description: params.description,
    attachmentUrl: params.attachmentUrl,
    attachmentUrls: params.attachmentUrls,
    alertLevel: params.alertLevel,
    visibilityStatus: "published"
  });
}

export async function deleteDraftBoardingUpdate(boardingRecordId: string, userId: string) {
  const sql = `
    DELETE FROM pet_center.boarding_updates
    WHERE boarding_update_id = (
      SELECT boarding_update_id
      FROM pet_center.boarding_updates
      WHERE boarding_record_id = $1
        AND created_by_user_id = $2
        AND visibility_status = 'draft'
      ORDER BY updated_at DESC
      LIMIT 1
    )
  `;
  await query(sql, [boardingRecordId, userId]);
}

export async function updateBoardingToConfirmed(params: { boardingRecordId: string; handledByStaffId?: string; userId?: string }) {
  const sql = `
    UPDATE pet_center.boarding_records
    SET boarding_status = 'confirmed',
        handled_by_staff_id = $2,
        updated_at = NOW()
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
        handled_by_staff_id = $3,
        updated_at = NOW()
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
        handled_by_staff_id = $2,
        updated_at = NOW()
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
    SET boarding_status = 'checked_out',
        actual_check_out_at = COALESCE($3::timestamptz, NOW()),
        handled_by_staff_id = $2,
        updated_at = NOW()
    WHERE boarding_record_id = $1
      AND boarding_status = 'staying'
    RETURNING *
  `;
  const result = await query(sql, [params.boardingRecordId, params.handledByStaffId ?? params.userId, params.actualCheckOutAt ?? null]);
  return result.rows[0];
}
