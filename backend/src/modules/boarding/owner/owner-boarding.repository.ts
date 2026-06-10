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
import { findActiveRoomTypesWithAvailability } from '../boarding-room.repository.js';

const ownerVisibleBoardingStatuses = ['pending', 'confirmed', 'staying', 'checked_out', 'cancelled', 'rejected'] as const;

function buildBoardingRecordWhere(filters: BoardingRecordListFilters): { clauses: string[]; params: unknown[] } {
  const clauses = [
    "br.owner_user_id = $1",
    "br.boarding_status = ANY($2)"
  ];
  const params: unknown[] = [filters.ownerUserId, ownerVisibleBoardingStatuses];

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
    [ownerUserId, boardingRecordId, ownerVisibleBoardingStatuses]
  );

  return result.rows[0] ?? null;
}

export async function updateBoardingRecordStatus(
  boardingRecordId: string,
  status: string
): Promise<void> {
  await query(
    `UPDATE pet_center.boarding_records
     SET boarding_status = $1
     WHERE boarding_record_id = $2`,
    [status, boardingRecordId]
  );
}

export async function findOwnerBookingPets(ownerUserId: string): Promise<BoardingBookingPetRow[]> {
  const result = await query<BoardingBookingPetRow>(
    `SELECT pet_id, pet_name, species, weight_kg, profile_image_url
     FROM pet_center.pets
     WHERE owner_user_id = $1
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
     LIMIT 1`,
    [ownerUserId, petId]
  );

  return result.rows[0] ?? null;
}

export async function countOverlappingBoardingRecordsByPet(
  petId: string,
  plannedCheckInAt: Date,
  plannedCheckOutAt: Date,
  client?: PoolClient
): Promise<number> {
  const sql = `
    SELECT COUNT(*)::int AS total
    FROM pet_center.boarding_records br
    WHERE br.pet_id = $1
      AND br.boarding_status IN ('pending_payment', 'pending', 'confirmed', 'staying')
      AND br.planned_check_in_at < $2
      AND br.planned_check_out_at > $3
  `;
  const values = [petId, plannedCheckOutAt, plannedCheckInAt];
  const result = client
    ? await client.query<CountRow>(sql, values)
    : await query<CountRow>(sql, values);

  return Number(result.rows[0]?.total ?? 0);
}

export async function createBoardingRecord(input: CreateBoardingRecordInput): Promise<BoardingRecordCreatedDto> {
  return withTransaction(async (client) => {
    await client.query("lock table pet_center.boarding_records in share row exclusive mode");

    const roomTypes = await findActiveRoomTypesWithAvailability(
      input.plannedCheckInAt,
      input.plannedCheckOutAt,
      client
    );
    const roomType = roomTypes.find((room: BoardingRoomTypeAvailabilityRow) => room.room_type_id === input.roomType.roomTypeId);

    const overlappingPetRecords = await countOverlappingBoardingRecordsByPet(
      input.pet.petId,
      input.plannedCheckInAt,
      input.plannedCheckOutAt,
      client
    );

    if (overlappingPetRecords > 0) {
      throw new Error("BOARDING_PET_TIME_CONFLICT");
    }

    if (!roomType || Number(roomType.booked_units) >= Number(roomType.capacity)) {
      throw new Error("BOARDING_ROOM_FULL");
    }

    const boardingRecordId = await createId("brd", client);
    const invoiceId = await createId("inv", client);
    const invoiceLineId = await createId("inl", client);
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
export async function autoProcessExpiredBoardingRecords() {
  return withTransaction(async (client) => {
    const rejectRes = await client.query(`
      UPDATE pet_center.boarding_records
      SET boarding_status = 'rejected',
          rejection_reason = 'Quá thời gian xác nhận tự động'
      WHERE boarding_status IN ('pending', 'pending_payment')
        AND planned_check_in_at < NOW()
      RETURNING boarding_record_id
    `);

    const cancelRes = await client.query(`
      UPDATE pet_center.boarding_records
      SET boarding_status = 'cancelled',
          rejection_reason = 'Quá thời gian check-in tự động'
      WHERE boarding_status = 'confirmed'
        AND NOW() > planned_check_in_at + INTERVAL '3 hours'
      RETURNING boarding_record_id
    `);

    return {
      rejectedCount: rejectRes.rowCount ?? 0,
      cancelledCount: cancelRes.rowCount ?? 0,
    };
  });
}
