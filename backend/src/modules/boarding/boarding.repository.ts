import { query } from "../../db/query.js";
import type { BoardingRecordListFilters, BoardingRecordListRow, CountRow } from "./boarding.types.js";

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
      to_char(br.planned_check_in_at, 'YYYY-MM-DD') AS planned_check_in_date,
      to_char(br.planned_check_out_at, 'YYYY-MM-DD') AS planned_check_out_date,
      to_char(br.planned_check_in_at, 'DD/MM/YYYY') || ' - ' || to_char(br.planned_check_out_at, 'DD/MM/YYYY') AS planned_date_range_text,
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
