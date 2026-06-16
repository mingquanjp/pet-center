import { query } from "../../db/query.js";
import type {
  AdminServiceCategoriesQueryDto,
  CreateAdminServiceCategoryBody,
  ServiceCategoryStatus,
  UpdateAdminServiceCategoryBody,
} from "./service-categories.types.js";

export interface AdminServiceCategoryRow {
  service_id: string;
  service_name: string;
  service_category: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  base_price: string | number;
  service_status: string;
  usage_count: number;
}

const vietnameseAccentChars =
  "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
const vietnamesePlainChars =
  "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function normalizedServiceSearchExpression() {
  return `
    translate(
      lower(
        concat_ws(
          ' ',
          s.service_id,
          s.service_name,
          coalesce(s.description, '')
        )
      ),
      '${vietnameseAccentChars}',
      '${vietnamesePlainChars}'
    )
  `;
}

function appendFilters(sql: string, params: unknown[], filters: AdminServiceCategoriesQueryDto) {
  let nextSql = sql;
  let paramIndex = params.length + 1;

  if (filters.search && filters.search.trim() !== "") {
    nextSql += ` AND ${normalizedServiceSearchExpression()} LIKE $${paramIndex}`;
    params.push(`%${normalizeSearchText(filters.search)}%`);
    paramIndex++;
  }

  if (filters.category && filters.category !== "ALL") {
    nextSql += ` AND s.service_category = $${paramIndex}`;
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.status && filters.status !== "ALL") {
    nextSql += ` AND s.service_status = $${paramIndex}`;
    params.push(filters.status);
  }

  return nextSql;
}

export async function findAdminServiceCategories(params: AdminServiceCategoriesQueryDto): Promise<AdminServiceCategoryRow[]> {
  const { page = 1, limit = 10 } = params;
  const queryParams: unknown[] = [];
  let sql = `
    SELECT
      s.service_id,
      s.service_name,
      s.service_category,
      s.description,
      s.estimated_duration_minutes,
      s.base_price,
      s.service_status,
      (
        (SELECT COUNT(*) FROM pet_center.exam_types et WHERE et.service_id = s.service_id) +
        (SELECT COUNT(*) FROM pet_center.grooming_ticket_items gti WHERE gti.service_id = s.service_id) +
        (SELECT COUNT(*) FROM pet_center.invoice_lines il WHERE il.service_id = s.service_id)
      )::int AS usage_count
    FROM pet_center.services s
    WHERE 1=1
  `;

  sql = appendFilters(sql, queryParams, params);
  sql += `
    ORDER BY
      CASE WHEN s.service_status = 'active' THEN 0 ELSE 1 END,
      s.service_category ASC,
      s.service_name ASC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;
  queryParams.push(limit, (page - 1) * limit);

  const result = await query<AdminServiceCategoryRow>(sql, queryParams);
  return result.rows;
}

export async function countAdminServiceCategories(params: AdminServiceCategoriesQueryDto): Promise<number> {
  const queryParams: unknown[] = [];
  let sql = `SELECT COUNT(*) AS total FROM pet_center.services s WHERE 1=1`;
  sql = appendFilters(sql, queryParams, params);

  const result = await query<{ total: string }>(sql, queryParams);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

export async function getAdminServiceCategoryStats() {
  const sql = `
    SELECT
      COUNT(*) AS total_services,
      COUNT(*) FILTER (WHERE service_status = 'active') AS active_services,
      COUNT(*) FILTER (WHERE service_status = 'inactive') AS inactive_services,
      COUNT(*) FILTER (WHERE service_category = 'medical') AS medical_services,
      COALESCE(ROUND(AVG(base_price)), 0) AS average_price
    FROM pet_center.services
  `;
  const result = await query<{
    total_services: string;
    active_services: string;
    inactive_services: string;
    medical_services: string;
    average_price: string;
  }>(sql);

  const row = result.rows[0];
  return {
    totalServices: parseInt(row?.total_services ?? "0", 10),
    activeServices: parseInt(row?.active_services ?? "0", 10),
    inactiveServices: parseInt(row?.inactive_services ?? "0", 10),
    medicalServices: parseInt(row?.medical_services ?? "0", 10),
    averagePrice: Number(row?.average_price ?? 0),
  };
}

export async function findServiceCategoryById(serviceId: string): Promise<boolean> {
  const result = await query(`SELECT 1 FROM pet_center.services WHERE service_id = $1 LIMIT 1`, [serviceId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function findServiceCategoryDetailById(serviceId: string): Promise<AdminServiceCategoryRow | null> {
  const result = await query<AdminServiceCategoryRow>(
    `
      SELECT
        s.service_id,
        s.service_name,
        s.service_category,
        s.description,
        s.estimated_duration_minutes,
        s.base_price,
        s.service_status,
        (
          (SELECT COUNT(*) FROM pet_center.exam_types et WHERE et.service_id = s.service_id) +
          (SELECT COUNT(*) FROM pet_center.grooming_ticket_items gti WHERE gti.service_id = s.service_id) +
          (SELECT COUNT(*) FROM pet_center.invoice_lines il WHERE il.service_id = s.service_id)
        )::int AS usage_count
      FROM pet_center.services s
      WHERE s.service_id = $1
    `,
    [serviceId]
  );

  return result.rows[0] ?? null;
}

export async function checkServiceNameExists(name: string, excludeServiceId?: string): Promise<boolean> {
  const params: unknown[] = [name];
  let sql = `SELECT 1 FROM pet_center.services WHERE LOWER(service_name) = LOWER($1)`;

  if (excludeServiceId) {
    sql += ` AND service_id != $2`;
    params.push(excludeServiceId);
  }

  sql += ` LIMIT 1`;
  const result = await query(sql, params);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function createAdminServiceCategory(serviceId: string, payload: CreateAdminServiceCategoryBody): Promise<void> {
  await query(
    `
      INSERT INTO pet_center.services (
        service_id, service_name, service_category, description, estimated_duration_minutes, base_price, service_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      serviceId,
      payload.serviceName,
      payload.category,
      payload.description ?? null,
      payload.durationMinutes ?? null,
      payload.basePrice,
      payload.status ?? "active",
    ]
  );
}

export async function updateAdminServiceCategory(serviceId: string, payload: UpdateAdminServiceCategoryBody): Promise<void> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (payload.serviceName !== undefined) {
    updates.push(`service_name = $${paramIndex++}`);
    params.push(payload.serviceName);
  }
  if (payload.category !== undefined) {
    updates.push(`service_category = $${paramIndex++}`);
    params.push(payload.category);
  }
  if (payload.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(payload.description);
  }
  if (payload.durationMinutes !== undefined) {
    updates.push(`estimated_duration_minutes = $${paramIndex++}`);
    params.push(payload.durationMinutes);
  }
  if (payload.basePrice !== undefined) {
    updates.push(`base_price = $${paramIndex++}`);
    params.push(payload.basePrice);
  }
  if (payload.status !== undefined) {
    updates.push(`service_status = $${paramIndex++}`);
    params.push(payload.status);
  }

  if (updates.length === 0) return;

  params.push(serviceId);
  await query(`UPDATE pet_center.services SET ${updates.join(", ")} WHERE service_id = $${paramIndex}`, params);
}

export async function updateServiceCategoryStatus(serviceId: string, status: ServiceCategoryStatus): Promise<void> {
  await query(`UPDATE pet_center.services SET service_status = $1 WHERE service_id = $2`, [status, serviceId]);
}

export async function deleteServiceCategory(serviceId: string): Promise<void> {
  await query(`DELETE FROM pet_center.services WHERE service_id = $1`, [serviceId]);
}
