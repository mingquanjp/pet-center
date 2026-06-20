import { query } from "../../db/query.js";
import type { 
  AdminMedicinesQueryDto, 
  CreateAdminMedicineBody, 
  MedicineStatus, 
  UpdateAdminMedicineBody 
} from "./medicines.types.js";

interface AdminMedicineRow {
  medicine_id: string;
  medicine_name: string;
  unit: string;
  description: string | null;
  usage_note: string | null;
  unit_price: number;
  stock_quantity: number;
  medicine_status: string;
  prescription_usage_count: number;
}

export async function findAdminMedicines(params: AdminMedicinesQueryDto): Promise<AdminMedicineRow[]> {
  const { search, unit, status, page = 1, limit = 10 } = params;
  
  let sql = `
    SELECT
      m.medicine_id,
      m.medicine_name,
      m.unit,
      m.description,
      m.usage_note,
      m.unit_price,
      m.stock_quantity,
      m.medicine_status,
      COALESCE(COUNT(pi.prescription_item_id), 0)::int AS prescription_usage_count
    FROM pet_center.medicines m
    LEFT JOIN pet_center.prescription_items pi ON pi.medicine_id = m.medicine_id
    WHERE 1=1
  `;
  
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (search && search.trim() !== "") {
    sql += ` AND (
      m.medicine_id ILIKE $${paramIndex} OR 
      m.medicine_name ILIKE $${paramIndex} OR 
      m.description ILIKE $${paramIndex} OR 
      m.usage_note ILIKE $${paramIndex}
    )`;
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (unit && unit !== "ALL") {
    sql += ` AND m.unit = $${paramIndex}`;
    queryParams.push(unit);
    paramIndex++;
  }

  if (status && status !== "ALL") {
    sql += ` AND m.medicine_status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  sql += `
    GROUP BY
      m.medicine_id,
      m.medicine_name,
      m.unit,
      m.description,
      m.usage_note,
      m.unit_price,
      m.stock_quantity,
      m.medicine_status
    ORDER BY
      CASE WHEN m.medicine_status = 'active' THEN 0 ELSE 1 END,
      NULLIF(REGEXP_REPLACE(m.medicine_id, '\\D', '', 'g'), '')::bigint DESC NULLS LAST
  `;

  const offset = (page - 1) * limit;
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  const result = await query<AdminMedicineRow>(sql, queryParams);
  return result.rows;
}

export async function countAdminMedicines(params: AdminMedicinesQueryDto): Promise<number> {
  const { search, unit, status } = params;
  
  let sql = `SELECT COUNT(*) AS total FROM pet_center.medicines m WHERE 1=1`;
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (search && search.trim() !== "") {
    sql += ` AND (
      m.medicine_id ILIKE $${paramIndex} OR 
      m.medicine_name ILIKE $${paramIndex} OR 
      m.description ILIKE $${paramIndex} OR 
      m.usage_note ILIKE $${paramIndex}
    )`;
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (unit && unit !== "ALL") {
    sql += ` AND m.unit = $${paramIndex}`;
    queryParams.push(unit);
    paramIndex++;
  }

  if (status && status !== "ALL") {
    sql += ` AND m.medicine_status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  const result = await query<{ total: string }>(sql, queryParams);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

export async function getAdminMedicineStats(): Promise<{ totalMedicines: number; activeMedicines: number; inactiveMedicines: number }> {
  const sql = `
    SELECT
      COUNT(*) AS total_medicines,
      COUNT(*) FILTER (WHERE medicine_status = 'active') AS active_medicines,
      COUNT(*) FILTER (WHERE medicine_status = 'inactive') AS inactive_medicines
    FROM pet_center.medicines
  `;
  const result = await query<{ total_medicines: string; active_medicines: string; inactive_medicines: string }>(sql);
  
  const row = result.rows[0];
  if (!row) {
    return { totalMedicines: 0, activeMedicines: 0, inactiveMedicines: 0 };
  }

  return {
    totalMedicines: parseInt(row.total_medicines ?? "0", 10),
    activeMedicines: parseInt(row.active_medicines ?? "0", 10),
    inactiveMedicines: parseInt(row.inactive_medicines ?? "0", 10),
  };
}

export async function findMedicineById(medicineId: string): Promise<boolean> {
  const sql = `SELECT 1 FROM pet_center.medicines WHERE medicine_id = $1 LIMIT 1`;
  const result = await query(sql, [medicineId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function findMedicineDetailById(medicineId: string): Promise<AdminMedicineRow | null> {
  const sql = `
    SELECT
      m.medicine_id,
      m.medicine_name,
      m.unit,
      m.description,
      m.usage_note,
      m.unit_price,
      m.stock_quantity,
      m.medicine_status,
      COALESCE(COUNT(pi.prescription_item_id), 0)::int AS prescription_usage_count
    FROM pet_center.medicines m
    LEFT JOIN pet_center.prescription_items pi ON pi.medicine_id = m.medicine_id
    WHERE m.medicine_id = $1
    GROUP BY
      m.medicine_id,
      m.medicine_name,
      m.unit,
      m.description,
      m.usage_note,
      m.unit_price,
      m.stock_quantity,
      m.medicine_status
  `;
  const result = await query<AdminMedicineRow>(sql, [medicineId]);
  return result.rows[0] ?? null;
}

export async function checkMedicineNameExists(name: string, excludeMedicineId?: string): Promise<boolean> {
  let sql = `SELECT 1 FROM pet_center.medicines WHERE LOWER(medicine_name) = LOWER($1)`;
  const params: unknown[] = [name];
  
  if (excludeMedicineId) {
    sql += ` AND medicine_id != $2`;
    params.push(excludeMedicineId);
  }
  
  sql += ` LIMIT 1`;
  
  const result = await query(sql, params);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function createAdminMedicine(medicineId: string, payload: CreateAdminMedicineBody): Promise<void> {
  const sql = `
    INSERT INTO pet_center.medicines (
      medicine_id, medicine_name, unit, description, usage_note, unit_price, stock_quantity, medicine_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  await query(sql, [
    medicineId,
    payload.medicineName,
    payload.unit,
    payload.description ?? null,
    payload.usageNote ?? null,
    payload.unitPrice,
    payload.stockQuantity ?? 0,
    payload.medicineStatus ?? "active"
  ]);
}

export async function updateAdminMedicine(medicineId: string, payload: UpdateAdminMedicineBody): Promise<void> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (payload.medicineName !== undefined) {
    updates.push(`medicine_name = $${paramIndex++}`);
    params.push(payload.medicineName);
  }
  if (payload.unit !== undefined) {
    updates.push(`unit = $${paramIndex++}`);
    params.push(payload.unit);
  }
  if (payload.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(payload.description);
  }
  if (payload.usageNote !== undefined) {
    updates.push(`usage_note = $${paramIndex++}`);
    params.push(payload.usageNote);
  }
  if (payload.unitPrice !== undefined) {
    updates.push(`unit_price = $${paramIndex++}`);
    params.push(payload.unitPrice);
  }
  if (payload.stockQuantity !== undefined) {
    updates.push(`stock_quantity = $${paramIndex++}`);
    params.push(payload.stockQuantity);
  }
  if (payload.medicineStatus !== undefined) {
    updates.push(`medicine_status = $${paramIndex++}`);
    params.push(payload.medicineStatus);
  }

  if (updates.length === 0) return;

  const sql = `
    UPDATE pet_center.medicines
    SET ${updates.join(", ")}
    WHERE medicine_id = $${paramIndex}
  `;
  params.push(medicineId);

  await query(sql, params);
}

export async function updateMedicineStatus(medicineId: string, status: MedicineStatus): Promise<void> {
  const sql = `UPDATE pet_center.medicines SET medicine_status = $1 WHERE medicine_id = $2`;
  await query(sql, [status, medicineId]);
}

export async function countPrescriptionUsageByMedicineId(medicineId: string): Promise<number> {
  const sql = `SELECT COUNT(*) AS usage_count FROM pet_center.prescription_items WHERE medicine_id = $1`;
  const result = await query<{ usage_count: string }>(sql, [medicineId]);
  return parseInt(result.rows[0]?.usage_count ?? "0", 10);
}

export async function deleteMedicine(medicineId: string): Promise<void> {
  const sql = `DELETE FROM pet_center.medicines WHERE medicine_id = $1`;
  await query(sql, [medicineId]);
}

export async function getMedicineUnits(): Promise<string[]> {
  const sql = `SELECT DISTINCT unit FROM pet_center.medicines ORDER BY unit ASC`;
  const result = await query<{ unit: string }>(sql);
  return result.rows.map(r => r.unit);
}
