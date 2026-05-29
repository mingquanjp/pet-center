import { query } from "../../db/query.js";
import type {
  StaffAppointmentListRow,
  StaffAppointmentStatsRow,
  StaffAppointmentCountRow,
} from "./appointments.types.js";

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
    where += ` AND DATE(ma.scheduled_at) = $${params.length}::date`;
  }

  // Tab filter (overrides status if both exist conceptually, but FE sends tab separately)
  if (filters.tab && filters.tab !== "ALL") {
    params.push(filters.tab.toLowerCase());
    where += ` AND ma.appointment_status = $${params.length}`;
  }

  return { where, params };
}

export async function getStaffAppointmentsList(filters: any) {
  const { where, params } = buildFilterClauses(filters);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  // Data query
  params.push(limit);
  const limitParam = params.length;
  params.push(offset);
  const offsetParam = params.length;

  const sql = `
    SELECT
      ma.appointment_id AS id,
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.profile_image_url,
      u.user_id AS owner_id,
      u.full_name AS owner_name,
      u.phone_number AS owner_phone,
      u.email AS owner_email,
      et.exam_type_id,
      et.type_code,
      et.type_name,
      ma.scheduled_at,
      ma.appointment_status,
      ma.symptom_description
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users u ON ma.owner_user_id = u.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    WHERE 1=1 ${where}
    ORDER BY ma.scheduled_at DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const result = await query<StaffAppointmentListRow>(sql, params);
  return result.rows;
}

export async function getStaffAppointmentsCount(filters: any) {
  const { where, params } = buildFilterClauses(filters);

  const sql = `
    SELECT COUNT(*)::text AS total
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users u ON ma.owner_user_id = u.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    WHERE 1=1 ${where}
  `;

  const result = await query<StaffAppointmentCountRow>(sql, params);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

/**
 * Stats are calculated with the same search/date/serviceType/status filters
 * but WITHOUT the tab filter, so that tab counts remain stable.
 */
export async function getStaffAppointmentsStats(filters: any) {
  // Build filters WITHOUT tab
  const filtersWithoutTab = { ...filters, tab: undefined };
  const { where, params } = buildFilterClauses(filtersWithoutTab);

  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE ma.appointment_status = 'pending')::text    AS pending_count,
      COUNT(*) FILTER (WHERE ma.appointment_status = 'confirmed')::text  AS confirmed_count,
      COUNT(*) FILTER (WHERE ma.appointment_status = 'rejected')::text   AS rejected_count,
      COUNT(*) FILTER (WHERE ma.appointment_status = 'cancelled')::text  AS cancelled_count,
      COUNT(*) FILTER (WHERE DATE(ma.scheduled_at) = CURRENT_DATE)::text AS today_total_count
    FROM pet_center.medical_appointments ma
    JOIN pet_center.pets p ON ma.pet_id = p.pet_id
    JOIN pet_center.users u ON ma.owner_user_id = u.user_id
    JOIN pet_center.exam_types et ON ma.exam_type_id = et.exam_type_id
    WHERE 1=1 ${where}
  `;

  const result = await query<StaffAppointmentStatsRow>(sql, params);
  return result.rows[0];
}
