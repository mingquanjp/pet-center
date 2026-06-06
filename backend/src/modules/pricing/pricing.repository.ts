import { query } from "../../db/query.js";
import type {
  AdminPricingQueryDto,
  CreateAdminPriceRuleBody,
  UpdateAdminPriceRuleBody,
} from "./pricing.types.js";

const vietnameseAccentChars =
  "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
const vietnamesePlainChars =
  "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

export interface AdminPriceRuleRow {
  price_rule_id: string;
  service_id: string;
  service_name: string;
  service_category: string;
  pricing_condition: string;
  price_amount: string | number;
  effective_from: string;
  price_status: string;
}

export interface AdminPricingServiceOptionRow {
  service_id: string;
  service_name: string;
  service_category: string;
  base_price: string | number;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function normalizedPricingSearchExpression() {
  return `
    translate(
      lower(concat_ws(' ', spr.price_rule_id, spr.pricing_condition, s.service_id, s.service_name)),
      '${vietnameseAccentChars}',
      '${vietnamesePlainChars}'
    )
  `;
}

function appendFilters(sql: string, params: unknown[], filters: AdminPricingQueryDto) {
  let nextSql = sql;
  let paramIndex = params.length + 1;

  if (filters.search?.trim()) {
    nextSql += ` AND ${normalizedPricingSearchExpression()} LIKE $${paramIndex}`;
    params.push(`%${normalizeSearchText(filters.search)}%`);
    paramIndex++;
  }

  if (filters.category && filters.category !== "ALL") {
    nextSql += ` AND s.service_category = $${paramIndex}`;
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.status && filters.status !== "ALL") {
    nextSql += ` AND spr.price_status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.serviceId) {
    nextSql += ` AND spr.service_id = $${paramIndex}`;
    params.push(filters.serviceId);
  }

  return nextSql;
}

export async function findAdminPriceRules(params: AdminPricingQueryDto): Promise<AdminPriceRuleRow[]> {
  const { page = 1, limit = 10 } = params;
  const queryParams: unknown[] = [];
  let sql = `
    SELECT
      spr.price_rule_id,
      spr.service_id,
      s.service_name,
      s.service_category,
      spr.pricing_condition,
      spr.price_amount,
      spr.effective_from::text,
      spr.price_status
    FROM pet_center.service_price_rules spr
    JOIN pet_center.services s ON s.service_id = spr.service_id
    WHERE 1=1
  `;

  sql = appendFilters(sql, queryParams, params);
  sql += `
    ORDER BY
      CASE WHEN spr.price_status = 'active' THEN 0 ELSE 1 END,
      spr.effective_from DESC,
      s.service_name ASC,
      spr.pricing_condition ASC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;
  queryParams.push(limit, (page - 1) * limit);

  const result = await query<AdminPriceRuleRow>(sql, queryParams);
  return result.rows;
}

export async function countAdminPriceRules(params: AdminPricingQueryDto): Promise<number> {
  const queryParams: unknown[] = [];
  let sql = `
    SELECT COUNT(*) AS total
    FROM pet_center.service_price_rules spr
    JOIN pet_center.services s ON s.service_id = spr.service_id
    WHERE 1=1
  `;
  sql = appendFilters(sql, queryParams, params);
  const result = await query<{ total: string }>(sql, queryParams);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

export async function getAdminPricingStats() {
  const result = await query<{
    total_rules: string;
    active_rules: string;
    inactive_rules: string;
    average_price: string;
    service_count: string;
  }>(`
    SELECT
      COUNT(*) AS total_rules,
      COUNT(*) FILTER (WHERE price_status = 'active') AS active_rules,
      COUNT(*) FILTER (WHERE price_status = 'inactive') AS inactive_rules,
      COALESCE(ROUND(AVG(price_amount)), 0) AS average_price,
      COUNT(DISTINCT service_id) AS service_count
    FROM pet_center.service_price_rules
  `);
  const row = result.rows[0];
  return {
    totalRules: parseInt(row?.total_rules ?? "0", 10),
    activeRules: parseInt(row?.active_rules ?? "0", 10),
    inactiveRules: parseInt(row?.inactive_rules ?? "0", 10),
    averagePrice: Number(row?.average_price ?? 0),
    serviceCount: parseInt(row?.service_count ?? "0", 10),
  };
}

export async function findPricingServiceOptions(): Promise<AdminPricingServiceOptionRow[]> {
  const result = await query<AdminPricingServiceOptionRow>(`
    SELECT service_id, service_name, service_category, base_price
    FROM pet_center.services
    WHERE service_status = 'active'
    ORDER BY service_category ASC, service_name ASC
  `);
  return result.rows;
}

export async function findPriceRuleById(priceRuleId: string): Promise<AdminPriceRuleRow | null> {
  const result = await query<AdminPriceRuleRow>(`
    SELECT
      spr.price_rule_id,
      spr.service_id,
      s.service_name,
      s.service_category,
      spr.pricing_condition,
      spr.price_amount,
      spr.effective_from::text,
      spr.price_status
    FROM pet_center.service_price_rules spr
    JOIN pet_center.services s ON s.service_id = spr.service_id
    WHERE spr.price_rule_id = $1
  `, [priceRuleId]);
  return result.rows[0] ?? null;
}

export async function serviceExists(serviceId: string): Promise<boolean> {
  const result = await query(`SELECT 1 FROM pet_center.services WHERE service_id = $1 LIMIT 1`, [serviceId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function checkPriceRuleUnique(payload: {
  serviceId: string;
  pricingCondition: string;
  effectiveFrom: string;
  excludePriceRuleId?: string;
}): Promise<boolean> {
  const params: unknown[] = [payload.serviceId, payload.pricingCondition, payload.effectiveFrom];
  let sql = `
    SELECT 1
    FROM pet_center.service_price_rules
    WHERE service_id = $1
      AND LOWER(pricing_condition) = LOWER($2)
      AND effective_from = $3::date
  `;
  if (payload.excludePriceRuleId) {
    params.push(payload.excludePriceRuleId);
    sql += ` AND price_rule_id != $${params.length}`;
  }
  sql += ` LIMIT 1`;
  const result = await query(sql, params);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function getNextPriceRuleId(): Promise<string> {
  const result = await query<{ price_rule_id: string }>(`
    SELECT price_rule_id
    FROM pet_center.service_price_rules
    WHERE price_rule_id ILIKE 'spr_admin_%'
    ORDER BY NULLIF(REGEXP_REPLACE(price_rule_id, '\\D', '', 'g'), '')::bigint DESC NULLS LAST
    LIMIT 1
  `);
  if (result.rows.length === 0) return "spr_admin_0001";
  const latest = result.rows[0]!.price_rule_id;
  const num = parseInt(latest.replace(/\D/g, ""), 10);
  if (Number.isNaN(num)) return `spr_admin_${Date.now()}`;
  return `spr_admin_${(num + 1).toString().padStart(4, "0")}`;
}

export async function createAdminPriceRule(priceRuleId: string, payload: CreateAdminPriceRuleBody): Promise<void> {
  await query(`
    INSERT INTO pet_center.service_price_rules (
      price_rule_id, service_id, pricing_condition, price_amount, effective_from, price_status
    ) VALUES ($1, $2, $3, $4, $5::date, $6)
  `, [
    priceRuleId,
    payload.serviceId,
    payload.pricingCondition,
    payload.priceAmount,
    payload.effectiveFrom,
    payload.status ?? "active",
  ]);
}

export async function updateAdminPriceRule(priceRuleId: string, payload: UpdateAdminPriceRuleBody): Promise<void> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (payload.serviceId !== undefined) {
    updates.push(`service_id = $${paramIndex++}`);
    params.push(payload.serviceId);
  }
  if (payload.pricingCondition !== undefined) {
    updates.push(`pricing_condition = $${paramIndex++}`);
    params.push(payload.pricingCondition);
  }
  if (payload.priceAmount !== undefined) {
    updates.push(`price_amount = $${paramIndex++}`);
    params.push(payload.priceAmount);
  }
  if (payload.effectiveFrom !== undefined) {
    updates.push(`effective_from = $${paramIndex++}::date`);
    params.push(payload.effectiveFrom);
  }
  if (payload.status !== undefined) {
    updates.push(`price_status = $${paramIndex++}`);
    params.push(payload.status);
  }

  if (updates.length === 0) return;
  params.push(priceRuleId);
  await query(`UPDATE pet_center.service_price_rules SET ${updates.join(", ")} WHERE price_rule_id = $${paramIndex}`, params);
}

export async function deleteAdminPriceRule(priceRuleId: string): Promise<void> {
  await query(`DELETE FROM pet_center.service_price_rules WHERE price_rule_id = $1`, [priceRuleId]);
}
