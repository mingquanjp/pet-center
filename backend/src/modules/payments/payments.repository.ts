import type { PoolClient } from "pg";
import { randomInt, randomUUID } from "node:crypto";
import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import { createId } from "../../shared/utils/id.js";
import { buildVnpayPaymentUrl } from "./vnpay.service.js";

export type CreatePendingVnpayAttemptInput = {
  invoiceId: string;
  amount: number;
  orderInfo: string;
  orderType?: string;
  clientIp: string;
};

export async function createPendingVnpayAttempt(
  client: PoolClient,
  input: CreatePendingVnpayAttemptInput
): Promise<{ paymentAttemptId: string; providerTxnRef: string; paymentUrl: string; expiresAt: Date }> {
  const paymentAttemptId = createPaymentAttemptId();
  const providerTxnRef = createVnpayTxnRef();
  const { paymentUrl, expiresAt } = buildVnpayPaymentUrl({
    txnRef: providerTxnRef,
    amount: input.amount,
    orderInfo: input.orderInfo,
    orderType: input.orderType,
    clientIp: input.clientIp
  });

  await client.query(
    `INSERT INTO pet_center.online_payment_attempts (
       payment_attempt_id, invoice_id, provider_txn_ref,
       amount, attempt_status, payment_url, expires_at
     )
     VALUES ($1, $2, $3, $4, 'pending', $5, $6)`,
    [paymentAttemptId, input.invoiceId, providerTxnRef, input.amount, paymentUrl, expiresAt]
  );

  return {
    paymentAttemptId,
    providerTxnRef,
    paymentUrl,
    expiresAt
  };
}

function createPaymentAttemptId(): string {
  return `opa${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function createVnpayTxnRef(): string {
  const now = new Date();
  const dateTimePart = [
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0")
  ].join("");

  return `${dateTimePart}${randomInt(100000, 1_000_000)}`;
}

export type VnpayAttemptSourceType = "grooming" | "boarding" | "medical_exam" | "prescription";

export type VnpayAttemptRow = {
  payment_attempt_id: string;
  invoice_id: string;
  amount: string;
  attempt_status: "pending" | "success" | "failed" | "cancelled" | "expired";
  invoice_status: string;
  invoice_total_amount: string;
  source_type: VnpayAttemptSourceType | null;
  source_id: string | null;
  source_status: string | null;
};

export type VnpayIpnUpdateInput = {
  providerTxnRef: string;
  providerTransactionNo: string | null;
  responseCode: string;
  transactionStatus: string | null;
  amount: number;
  isSuccessful: boolean;
  payload: Record<string, string>;
};

export type VnpayIpnUpdateResult =
  | { outcome: "not_found" }
  | { outcome: "amount_mismatch"; attempt: VnpayAttemptRow }
  | { outcome: "already_success"; attempt: VnpayAttemptRow }
  | { outcome: "already_final"; attempt: VnpayAttemptRow }
  | { outcome: "updated"; attempt: VnpayAttemptRow; status: "success" | "failed" };

const findVnpayAttemptSql = `
  SELECT
    opa.payment_attempt_id,
    opa.invoice_id,
    opa.amount::text AS amount,
    opa.attempt_status,
    inv.invoice_status,
    inv.total_amount::text AS invoice_total_amount,
    src.source_type,
    src.source_id,
    CASE src.source_type
      WHEN 'grooming' THEN (
        SELECT gt.ticket_status
        FROM pet_center.grooming_tickets gt
        WHERE gt.grooming_ticket_id = src.source_id
      )
      WHEN 'boarding' THEN (
        SELECT br.boarding_status
        FROM pet_center.boarding_records br
        WHERE br.boarding_record_id = src.source_id
      )
      ELSE NULL
    END AS source_status
  FROM pet_center.online_payment_attempts opa
  JOIN pet_center.invoices inv ON inv.invoice_id = opa.invoice_id
  LEFT JOIN LATERAL (
    SELECT il.source_type, il.source_id
    FROM pet_center.invoice_lines il
    WHERE il.invoice_id = opa.invoice_id
    ORDER BY il.invoice_line_id ASC
    LIMIT 1
  ) src ON true
  WHERE opa.provider_txn_ref = $1
`;

export async function findVnpayAttemptByTxnRef(providerTxnRef: string): Promise<VnpayAttemptRow | null> {
  return findVnpayAttemptByTxnRefReadonly(providerTxnRef);
}

export async function applyVnpayIpnUpdate(input: VnpayIpnUpdateInput): Promise<VnpayIpnUpdateResult> {
  return withTransaction(async (client) => {
    const attempt = await findVnpayAttemptByTxnRefForUpdate(client, input.providerTxnRef);

    if (!attempt) {
      return { outcome: "not_found" };
    }

    if (attempt.attempt_status === "success") {
      return { outcome: "already_success", attempt };
    }

    if (
      attempt.attempt_status === "failed" ||
      attempt.attempt_status === "cancelled" ||
      attempt.attempt_status === "expired" ||
      attempt.invoice_status === "cancelled" ||
      attempt.source_status === "cancelled"
    ) {
      return { outcome: "already_final", attempt };
    }

    const expectedAmount = Math.round(Number(attempt.amount) * 100);
    if (expectedAmount !== input.amount) {
      return { outcome: "amount_mismatch", attempt };
    }

    if (!input.isSuccessful) {
      await markAttemptFailed(client, attempt.payment_attempt_id, input);
      await markInvoiceCancelled(client, attempt.invoice_id);
      await markSourceBookingCancelled(client, attempt);
      return { outcome: "updated", attempt, status: "failed" };
    }

    await markAttemptSuccessful(client, attempt.payment_attempt_id, input);
    await markInvoicePaid(client, attempt.invoice_id);
    await createSuccessfulOnlinePayment(client, attempt, input);
    await markSourceBookingConfirmed(client, attempt);

    return { outcome: "updated", attempt, status: "success" };
  });
}

async function findVnpayAttemptByTxnRefForUpdate(
  client: PoolClient,
  providerTxnRef: string
): Promise<VnpayAttemptRow | null> {
  const result = await client.query<VnpayAttemptRow>(
    `${findVnpayAttemptSql} FOR UPDATE OF opa, inv`,
    [providerTxnRef]
  );

  return result.rows[0] ?? null;
}

async function findVnpayAttemptByTxnRefReadonly(providerTxnRef: string): Promise<VnpayAttemptRow | null> {
  const result = await query<VnpayAttemptRow>(findVnpayAttemptSql, [providerTxnRef]);

  return result.rows[0] ?? null;
}

async function markAttemptSuccessful(
  client: PoolClient,
  paymentAttemptId: string,
  input: VnpayIpnUpdateInput
): Promise<void> {
  await client.query(
    `UPDATE pet_center.online_payment_attempts
     SET attempt_status = 'success',
         completed_at = COALESCE(completed_at, now()),
         provider_transaction_no = $2,
         response_code = $3,
         transaction_status = $4,
         raw_ipn_payload = $5::jsonb
     WHERE payment_attempt_id = $1`,
    [
      paymentAttemptId,
      input.providerTransactionNo,
      input.responseCode,
      input.transactionStatus,
      JSON.stringify(input.payload)
    ]
  );
}

async function markAttemptFailed(
  client: PoolClient,
  paymentAttemptId: string,
  input: VnpayIpnUpdateInput
): Promise<void> {
  await client.query(
    `UPDATE pet_center.online_payment_attempts
     SET attempt_status = 'failed',
         completed_at = COALESCE(completed_at, now()),
         provider_transaction_no = $2,
         response_code = $3,
         transaction_status = $4,
         raw_ipn_payload = $5::jsonb
     WHERE payment_attempt_id = $1`,
    [
      paymentAttemptId,
      input.providerTransactionNo,
      input.responseCode,
      input.transactionStatus,
      JSON.stringify(input.payload)
    ]
  );
}

async function markInvoicePaid(client: PoolClient, invoiceId: string): Promise<void> {
  await client.query(
    `UPDATE pet_center.invoices
     SET invoice_status = 'paid'
     WHERE invoice_id = $1
       AND invoice_status <> 'paid'`,
    [invoiceId]
  );
}

async function markInvoiceCancelled(client: PoolClient, invoiceId: string): Promise<void> {
  await client.query(
    `UPDATE pet_center.invoices
     SET invoice_status = 'cancelled'
     WHERE invoice_id = $1
       AND invoice_status = 'pending_payment'`,
    [invoiceId]
  );
}

async function createSuccessfulOnlinePayment(
  client: PoolClient,
  attempt: VnpayAttemptRow,
  input: VnpayIpnUpdateInput
): Promise<void> {
  const paymentId = await createId("pay", client);
  const transactionCode = input.providerTransactionNo ?? input.providerTxnRef;
  const receiptCode = `RCPT-${input.providerTxnRef}`;

  await client.query(
    `INSERT INTO pet_center.payments (
       payment_id, invoice_id, payment_method, transaction_code,
       paid_amount, paid_at, payment_status, receipt_code
     )
     VALUES ($1, $2, 'online', $3, $4, now(), 'success', $5)
     ON CONFLICT DO NOTHING`,
    [paymentId, attempt.invoice_id, transactionCode, Number(attempt.amount), receiptCode]
  );
}

async function markSourceBookingConfirmed(client: PoolClient, attempt: VnpayAttemptRow): Promise<void> {
  if (!attempt.source_type || !attempt.source_id) {
    return;
  }

  if (attempt.source_type === "grooming") {
    await client.query(
      `UPDATE pet_center.grooming_tickets
       SET ticket_status = 'pending'
       WHERE grooming_ticket_id = $1
         AND ticket_status = 'pending_payment'`,
      [attempt.source_id]
    );
    return;
  }

  if (attempt.source_type === "boarding") {
    await client.query(
      `UPDATE pet_center.boarding_records
       SET boarding_status = 'pending'
       WHERE boarding_record_id = $1
         AND boarding_status = 'pending_payment'`,
      [attempt.source_id]
    );
  }
}

async function markSourceBookingCancelled(client: PoolClient, attempt: VnpayAttemptRow): Promise<void> {
  if (!attempt.source_type || !attempt.source_id) {
    return;
  }

  if (attempt.source_type === "grooming") {
    await client.query(
      `UPDATE pet_center.grooming_tickets
       SET ticket_status = 'cancelled'
       WHERE grooming_ticket_id = $1
         AND ticket_status = 'pending_payment'`,
      [attempt.source_id]
    );
    return;
  }

  if (attempt.source_type === "boarding") {
    await client.query(
      `UPDATE pet_center.boarding_records
       SET boarding_status = 'cancelled'
       WHERE boarding_record_id = $1
         AND boarding_status = 'pending_payment'`,
      [attempt.source_id]
    );
  }
}
