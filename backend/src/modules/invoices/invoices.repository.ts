import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import type { PoolClient } from "pg";
import type { StaffInvoiceDetailRow, StaffInvoiceListItemRow, StaffInvoiceLineRow } from "./invoices.types.js";
import { createId } from "../../shared/utils/id.js";

export async function getStaffInvoicesList(filters: any) {
  const params: any[] = [];
  let sql = `
    SELECT 
      i.invoice_id AS id,
      i.invoice_id AS invoice_code,
      i.issued_at,
      i.payment_option,
      i.invoice_status,
      i.payment_due_at,
      i.total_amount,
      p.pet_id,
      p.pet_name,
      u.user_id AS owner_id,
      u.full_name AS owner_name,
      (
        SELECT description FROM pet_center.invoice_lines il 
        WHERE il.invoice_id = i.invoice_id 
        ORDER BY il.invoice_line_id ASC LIMIT 1
      ) as first_line_desc,
      (
        SELECT source_type FROM pet_center.invoice_lines il 
        WHERE il.invoice_id = i.invoice_id 
        ORDER BY il.invoice_line_id ASC LIMIT 1
      ) as first_line_source,
      (
        SELECT 
          CASE il.source_type
            WHEN 'grooming' THEN (SELECT scheduled_at FROM pet_center.grooming_tickets gt WHERE gt.grooming_ticket_id = il.source_id)
            WHEN 'medical_exam' THEN (
              SELECT ma.scheduled_at 
              FROM pet_center.medical_exams me 
              JOIN pet_center.medical_appointments ma ON me.appointment_id = ma.appointment_id 
              WHERE me.exam_id = il.source_id
            )
            WHEN 'boarding' THEN (SELECT planned_check_in_at FROM pet_center.boarding_records br WHERE br.boarding_record_id = il.source_id)
            WHEN 'prescription' THEN (SELECT prescribed_at::timestamptz FROM pet_center.prescriptions p WHERE p.prescription_id = il.source_id)
            ELSE i.issued_at::timestamptz
          END
        FROM pet_center.invoice_lines il 
        WHERE il.invoice_id = i.invoice_id 
        ORDER BY il.invoice_line_id ASC LIMIT 1
      ) as service_time
    FROM pet_center.invoices i
    JOIN pet_center.pets p ON i.pet_id = p.pet_id
    JOIN pet_center.users u ON i.owner_user_id = u.user_id
    WHERE 1=1
  `;

  if (filters.search) {
    params.push(`%${filters.search}%`);
    sql += ` AND (i.invoice_id ILIKE $${params.length} 
             OR p.pet_name ILIKE $${params.length} 
             OR u.full_name ILIKE $${params.length}
             OR EXISTS (SELECT 1 FROM pet_center.invoice_lines il WHERE il.invoice_id = i.invoice_id AND il.description ILIKE $${params.length})
             )`;
  }

  if (filters.status) {
    if (filters.status === "OVERDUE") {
      sql += ` AND i.invoice_status = 'pending_payment' AND i.payment_option = 'counter' AND i.payment_due_at < NOW()`;
    } else if (filters.status === "PENDING_PAYMENT") {
      sql += ` AND i.invoice_status = 'pending_payment' AND i.payment_option = 'counter' AND (i.payment_due_at IS NULL OR i.payment_due_at >= NOW())`;
    } else if (filters.status === "PAID") {
      sql += ` AND (i.invoice_status = 'paid' OR i.payment_option = 'online')`;
    } else {
      params.push(filters.status.toLowerCase());
      sql += ` AND i.invoice_status = $${params.length}`;
    }
  }

  if (filters.paymentOption) {
    params.push(filters.paymentOption === "ONLINE" ? "online" : "counter");
    sql += ` AND i.payment_option = $${params.length}`;
  }

  if (filters.timeRange && filters.timeRange !== "ALL") {
    if (filters.timeRange === "TODAY") {
      sql += ` AND i.issued_at::date = CURRENT_DATE`;
    } else if (filters.timeRange === "THIS_WEEK") {
      sql += ` AND i.issued_at::date >= date_trunc('week', CURRENT_DATE)::date AND i.issued_at::date <= CURRENT_DATE`;
    } else if (filters.timeRange === "THIS_MONTH") {
      sql += ` AND i.issued_at::date >= date_trunc('month', CURRENT_DATE)::date AND i.issued_at::date <= CURRENT_DATE`;
    }
  }

  // Add cursor pagination based on invoice_id DESC
  if (filters.cursor) {
    params.push(filters.cursor);
    sql += ` AND i.invoice_id < $${params.length}`;
  }

  if (filters.serviceType) {
    let sourceType = "other";
    if (filters.serviceType === "MEDICAL") sourceType = "medical_exam";
    else if (filters.serviceType === "GROOMING") sourceType = "grooming";
    else if (filters.serviceType === "BOARDING") sourceType = "boarding";
    else if (filters.serviceType === "PRESCRIPTION") sourceType = "prescription";

    params.push(sourceType);
    sql += ` AND EXISTS (SELECT 1 FROM pet_center.invoice_lines il WHERE il.invoice_id = i.invoice_id AND il.source_type = $${params.length})`;
  }

  params.push(filters.limit);
  sql += ` ORDER BY i.invoice_id DESC LIMIT $${params.length}`;

  const result = await query<StaffInvoiceListItemRow>(sql, params);
  return result.rows;
}

export async function getInvoiceDetail(invoiceId: string) {
  const sql = `
    SELECT 
      i.invoice_id AS id,
      i.invoice_id AS invoice_code,
      i.invoice_status,
      i.payment_option,
      i.issued_at,
      i.payment_due_at,
      i.subtotal_amount,
      i.discount_amount,
      i.surcharge_amount,
      i.total_amount,
      p.pet_id,
      p.pet_name,
      u.user_id AS owner_id,
      u.full_name AS owner_name,
      pay.paid_at
    FROM pet_center.invoices i
    JOIN pet_center.pets p ON i.pet_id = p.pet_id
    JOIN pet_center.users u ON i.owner_user_id = u.user_id
    LEFT JOIN pet_center.payments pay ON i.invoice_id = pay.invoice_id AND pay.payment_status = 'success'
    WHERE i.invoice_id = $1
  `;
  const res = await query<StaffInvoiceDetailRow>(sql, [invoiceId]);
  return res.rows[0];
}

export async function getInvoiceLines(invoiceId: string) {
  const sql = `
    SELECT 
      invoice_line_id AS id,
      description,
      source_type AS service_type,
      quantity,
      unit_price,
      line_discount_amount AS discount_amount,
      line_amount
    FROM pet_center.invoice_lines
    WHERE invoice_id = $1
    ORDER BY invoice_line_id ASC
  `;
  const res = await query<StaffInvoiceLineRow>(sql, [invoiceId]);
  return res.rows;
}

export async function confirmPayment(invoiceId: string, paymentMethod: string, totalAmount: number) {
  return withTransaction(async (client: PoolClient) => {
    // Insert payment
    const paymentId = createId("pay");
    const sqlInsert = `
      INSERT INTO pet_center.payments (
        payment_id, invoice_id, payment_method, paid_amount, paid_at, payment_status
      ) VALUES ($1, $2, $3, $4, NOW(), 'success')
    `;
    await client.query(sqlInsert, [paymentId, invoiceId, paymentMethod, totalAmount]);

    // Update invoice status
    const sqlUpdate = `
      UPDATE pet_center.invoices
      SET invoice_status = 'paid'
      WHERE invoice_id = $1
    `;
    await client.query(sqlUpdate, [invoiceId]);
  });
}

export async function markInvoiceOverdue(invoiceId: string) {
  const sql = `
    UPDATE pet_center.invoices
    SET payment_due_at = NOW() - interval '1 day'
    WHERE invoice_id = $1
  `;
  await query(sql, [invoiceId]);
}
