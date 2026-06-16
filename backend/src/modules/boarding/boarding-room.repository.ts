import type { PoolClient } from 'pg';
import { query } from '../../db/query.js';
import { withTransaction } from '../../db/transactions.js';
import { createId } from '../../shared/utils/id.js';
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
} from './boarding.types.js';

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

export async function findActiveRoomTypes() {
  const sql = `
    SELECT rt.room_type_id as id, rt.room_type_id as code, rt.room_type_name as name,
           rt.description, rt.boarding_unit_price as "pricePerDay", rt.capacity
    FROM pet_center.room_types rt
    WHERE rt.room_type_status = 'active'
    ORDER BY rt.boarding_unit_price ASC
  `;
  const result = await query(sql);
  return result.rows;
}

export async function findStaffBoardingCreateRoomTypes(checkInAt?: Date, checkOutAt?: Date) {
  let sql = "";
  let values: any[] = [];

  if (checkInAt && checkOutAt) {
    sql = `
      SELECT
        rt.room_type_id,
        rt.room_type_name,
        rt.description,
        rt.capacity,
        rt.boarding_unit_price,
        COALESCE(booked.booked_units, 0)::int AS booked_units
      FROM pet_center.room_types rt
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS booked_units
        FROM pet_center.boarding_records br
        WHERE br.room_type_id = rt.room_type_id
          AND br.boarding_status IN ('pending', 'confirmed', 'staying')
          AND br.planned_check_in_at < $1
          AND br.planned_check_out_at > $2
      ) booked ON true
      WHERE rt.room_type_status = 'active'
      ORDER BY rt.boarding_unit_price ASC, rt.room_type_name ASC
    `;
    values = [checkOutAt, checkInAt];
  } else {
    sql = `
      SELECT
        rt.room_type_id,
        rt.room_type_name,
        rt.description,
        rt.capacity,
        rt.boarding_unit_price,
        0 AS booked_units
      FROM pet_center.room_types rt
      WHERE rt.room_type_status = 'active'
      ORDER BY rt.boarding_unit_price ASC, rt.room_type_name ASC
    `;
  }

  const result = await query(sql, values);
  return result.rows;
}

export async function countBookedUnitsByRoomType(roomTypeId: string, checkInAt: Date, checkOutAt: Date, client?: PoolClient) {
  const sql = `
    SELECT COUNT(*)::int AS booked_units
    FROM pet_center.boarding_records br
    WHERE br.room_type_id = $1
      AND br.boarding_status IN ('pending', 'confirmed', 'staying')
      AND br.planned_check_in_at < $2
      AND br.planned_check_out_at > $3
  `;
  const values = [roomTypeId, checkOutAt, checkInAt];
  const result = client ? await client.query(sql, values) : await query(sql, values);
  return Number(result.rows[0]?.booked_units ?? 0);
}

export async function findRoomTypeById(roomTypeId: string, client?: PoolClient) {
  const sql = `
    SELECT rt.room_type_id as id, rt.capacity, rt.boarding_unit_price as "pricePerDay", rt.room_type_status
    FROM pet_center.room_types rt
    WHERE rt.room_type_id = $1
  `;
  const result = client ? await client.query(sql, [roomTypeId]) : await query(sql, [roomTypeId]);
  return result.rows[0] ?? null;
}

export async function findAdminBoardingRoomsBase(filters: {
  search?: string;
  status?: string;
  priceRange?: string;
}) {
  const clauses = ["1 = 1"];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`(rt.room_type_id ILIKE $${params.length} OR rt.room_type_name ILIKE $${params.length} OR COALESCE(rt.description, '') ILIKE $${params.length})`);
  }

  if (filters.status && filters.status !== "ALL") {
    params.push(filters.status);
    clauses.push(`rt.room_type_status = $${params.length}`);
  }

  if (filters.priceRange && filters.priceRange !== "ALL") {
    if (filters.priceRange === "UNDER_200K") {
      clauses.push(`rt.boarding_unit_price < 200000`);
    } else if (filters.priceRange === "FROM_200K_TO_400K") {
      clauses.push(`rt.boarding_unit_price >= 200000 AND rt.boarding_unit_price <= 400000`);
    } else if (filters.priceRange === "OVER_400K") {
      clauses.push(`rt.boarding_unit_price > 400000`);
    }
  }

  const sql = `
    SELECT
      rt.room_type_id,
      rt.room_type_name,
      rt.description,
      rt.capacity,
      rt.boarding_unit_price,
      rt.room_type_status,
      COALESCE(COUNT(br.boarding_record_id), 0)::int AS current_occupancy
    FROM pet_center.room_types rt
    LEFT JOIN pet_center.boarding_records br
      ON br.room_type_id = rt.room_type_id
      AND br.boarding_status = 'staying'
    WHERE ${clauses.join(" AND ")}
    GROUP BY
      rt.room_type_id,
      rt.room_type_name,
      rt.description,
      rt.capacity,
      rt.boarding_unit_price,
      rt.room_type_status
    ORDER BY
      CASE WHEN rt.room_type_status = 'active' THEN 0 ELSE 1 END,
      rt.room_type_name ASC
  `;

  const result = await query(sql, params);
  return result.rows;
}

export async function findAdminBoardingRoomsStatsBase() {
  const sql = `
    SELECT
      rt.room_type_id,
      rt.capacity,
      rt.room_type_status,
      COALESCE(COUNT(br.boarding_record_id), 0)::int AS current_occupancy
    FROM pet_center.room_types rt
    LEFT JOIN pet_center.boarding_records br
      ON br.room_type_id = rt.room_type_id
      AND br.boarding_status = 'staying'
    GROUP BY rt.room_type_id, rt.capacity, rt.room_type_status
  `;
  const result = await query(sql);
  return result.rows;
}

export async function findAdminBoardingRoomDetailRow(roomTypeId: string) {
  const sql = `
    SELECT
      rt.room_type_id,
      rt.room_type_name,
      rt.description,
      rt.capacity,
      rt.boarding_unit_price,
      rt.room_type_status,
      COALESCE(COUNT(br.boarding_record_id), 0)::int AS current_occupancy
    FROM pet_center.room_types rt
    LEFT JOIN pet_center.boarding_records br
      ON br.room_type_id = rt.room_type_id
      AND br.boarding_status = 'staying'
    WHERE rt.room_type_id = $1
    GROUP BY
      rt.room_type_id,
      rt.room_type_name,
      rt.description,
      rt.capacity,
      rt.boarding_unit_price,
      rt.room_type_status
  `;
  const result = await query(sql, [roomTypeId]);
  return result.rows[0];
}

export async function findAdminBoardingRoomUsageStats(roomTypeId: string) {
  const sql = `
    SELECT
      COUNT(br.boarding_record_id)::int AS total_records,
      COUNT(CASE WHEN br.boarding_status = 'staying' THEN 1 END)::int AS currently_staying,
      COUNT(CASE WHEN br.boarding_status = 'checked_out' THEN 1 END)::int AS checked_out,
      COUNT(CASE WHEN br.boarding_status IN ('cancelled', 'rejected') THEN 1 END)::int AS cancelled_or_rejected,
      COALESCE(SUM(CASE WHEN br.boarding_status IN ('staying', 'checked_out') THEN br.estimated_total ELSE 0 END), 0)::numeric AS estimated_revenue
    FROM pet_center.boarding_records br
    WHERE br.room_type_id = $1
  `;
  const result = await query(sql, [roomTypeId]);
  return result.rows[0];
}

export async function findAdminBoardingRoomUsageHistoryRows(roomTypeId: string, filters: any, offset: number, limit: number) {
  const clauses = ["br.room_type_id = $1"];
  const params: any[] = [roomTypeId];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`(br.boarding_record_id ILIKE $${params.length} OR p.pet_name ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
  }

  if (filters.boardingStatus && filters.boardingStatus !== "ALL") {
    params.push(filters.boardingStatus);
    clauses.push(`br.boarding_status = $${params.length}`);
  }

  if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
    if (filters.paymentStatus === "paid") {
      clauses.push(`i.invoice_status = 'paid'`);
    } else if (filters.paymentStatus === "unpaid") {
      clauses.push(`(i.invoice_status IS NULL OR i.invoice_status <> 'paid')`);
    }
  }

  if (filters.timeRange && filters.timeRange !== "ALL") {
    if (filters.timeRange === "TODAY") {
      clauses.push(`br.created_at >= CURRENT_DATE AND br.created_at < CURRENT_DATE + INTERVAL '1 day'`);
    } else if (filters.timeRange === "THIS_WEEK") {
      clauses.push(`br.created_at >= date_trunc('week', CURRENT_DATE) AND br.created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'`);
    } else if (filters.timeRange === "THIS_MONTH") {
      clauses.push(`br.created_at >= date_trunc('month', CURRENT_DATE) AND br.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`);
    }
  }

  const sql = `
    SELECT
      br.boarding_record_id,
      br.room_type_id,
      br.planned_check_in_at,
      br.planned_check_out_at,
      br.actual_check_in_at,
      br.actual_check_out_at,
      br.boarding_status,
      COALESCE(br.estimated_total, 0) AS estimated_total,
      p.pet_name,
      p.species AS pet_species,
      u.full_name AS owner_name,
      i.invoice_status,
      COALESCE(i.total_amount, 0) AS invoice_total
    FROM pet_center.boarding_records br
    JOIN pet_center.pets p ON br.pet_id = p.pet_id
    JOIN pet_center.users u ON p.owner_user_id = u.user_id
    LEFT JOIN pet_center.invoice_lines il ON il.source_id = br.boarding_record_id AND il.source_type = 'boarding'
    LEFT JOIN pet_center.invoices i ON il.invoice_id = i.invoice_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY br.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const result = await query(sql, [...params, limit, offset]);
  return result.rows;
}

export async function countAdminBoardingRoomUsageHistory(roomTypeId: string, filters: any) {
  const clauses = ["br.room_type_id = $1"];
  const params: any[] = [roomTypeId];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`(br.boarding_record_id ILIKE $${params.length} OR p.pet_name ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
  }

  if (filters.boardingStatus && filters.boardingStatus !== "ALL") {
    params.push(filters.boardingStatus);
    clauses.push(`br.boarding_status = $${params.length}`);
  }

  if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
    if (filters.paymentStatus === "paid") {
      clauses.push(`i.invoice_status = 'paid'`);
    } else if (filters.paymentStatus === "unpaid") {
      clauses.push(`(i.invoice_status IS NULL OR i.invoice_status <> 'paid')`);
    }
  }

  if (filters.timeRange && filters.timeRange !== "ALL") {
    if (filters.timeRange === "TODAY") {
      clauses.push(`br.created_at >= CURRENT_DATE AND br.created_at < CURRENT_DATE + INTERVAL '1 day'`);
    } else if (filters.timeRange === "THIS_WEEK") {
      clauses.push(`br.created_at >= date_trunc('week', CURRENT_DATE) AND br.created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'`);
    } else if (filters.timeRange === "THIS_MONTH") {
      clauses.push(`br.created_at >= date_trunc('month', CURRENT_DATE) AND br.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`);
    }
  }

  const sql = `
    SELECT COUNT(*)::int AS total
    FROM pet_center.boarding_records br
    JOIN pet_center.pets p ON br.pet_id = p.pet_id
    JOIN pet_center.users u ON p.owner_user_id = u.user_id
    LEFT JOIN pet_center.invoice_lines il ON il.source_id = br.boarding_record_id AND il.source_type = 'boarding'
    LEFT JOIN pet_center.invoices i ON il.invoice_id = i.invoice_id
    WHERE ${clauses.join(" AND ")}
  `;
  const result = await query(sql, params);
  return result.rows[0].total;
}

export async function countStayingPetsByRoomType(roomTypeId: string) {
  const result = await query(
    `SELECT COUNT(*)::int AS total FROM pet_center.boarding_records WHERE room_type_id = $1 AND boarding_status = 'staying'`,
    [roomTypeId]
  );
  return result.rows[0].total;
}

export async function countBoardingRecordsByRoomType(roomTypeId: string) {
  const result = await query(
    `SELECT COUNT(*)::int AS total FROM pet_center.boarding_records WHERE room_type_id = $1`,
    [roomTypeId]
  );
  return result.rows[0].total;
}

export async function checkRoomTypeNameExists(name: string, excludeRoomTypeId?: string) {
  const params: any[] = [name];
  let sql = `SELECT 1 FROM pet_center.room_types WHERE LOWER(room_type_name) = LOWER($1)`;
  if (excludeRoomTypeId) {
    params.push(excludeRoomTypeId);
    sql += ` AND room_type_id != $2`;
  }
  const result = await query(sql, params);
  return (result.rowCount ?? 0) > 0;
}

export async function createAdminBoardingRoom(roomTypeId: string, payload: any) {
  const sql = `
    INSERT INTO pet_center.room_types (room_type_id, room_type_name, description, capacity, boarding_unit_price, room_type_status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await query(sql, [
    roomTypeId,
    payload.name,
    payload.description || null,
    payload.capacity,
    payload.boardingUnitPrice,
    payload.status || "active"
  ]);
  return result.rows[0];
}

export async function updateAdminBoardingRoom(roomTypeId: string, payload: any) {
  const sets = [];
  const params = [roomTypeId];
  if (payload.name !== undefined) {
    params.push(payload.name);
    sets.push(`room_type_name = $${params.length}`);
  }
  if (payload.description !== undefined) {
    params.push(payload.description || null);
    sets.push(`description = $${params.length}`);
  }
  if (payload.capacity !== undefined) {
    params.push(payload.capacity);
    sets.push(`capacity = $${params.length}`);
  }
  if (payload.boardingUnitPrice !== undefined) {
    params.push(payload.boardingUnitPrice);
    sets.push(`boarding_unit_price = $${params.length}`);
  }
  if (payload.status !== undefined) {
    params.push(payload.status);
    sets.push(`room_type_status = $${params.length}`);
  }
  const sql = `UPDATE pet_center.room_types SET ${sets.join(", ")} WHERE room_type_id = $1 RETURNING *`;
  const result = await query(sql, params);
  return result.rows[0];
}

export async function updateAdminBoardingRoomStatus(roomTypeId: string, status: string) {
  const result = await query(
    `UPDATE pet_center.room_types SET room_type_status = $2 WHERE room_type_id = $1 RETURNING *`,
    [roomTypeId, status]
  );
  return result.rows[0];
}

export async function deleteAdminBoardingRoom(roomTypeId: string) {
  await query(`DELETE FROM pet_center.room_types WHERE room_type_id = $1`, [roomTypeId]);
}

