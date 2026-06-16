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

export async function createBoardingInvoice(params: {
  invoiceId: string;
  ownerId: string;
  petId: string;
  totalAmount: number;
}, client: PoolClient) {
  const sql = `
    INSERT INTO pet_center.invoices (
      invoice_id, owner_user_id, pet_id, issued_at,
      subtotal_amount, discount_amount, surcharge_amount, total_amount,
      payment_option, payment_due_at, invoice_status
    )
    VALUES (
      $1, $2, $3, CURRENT_DATE,
      $4, 0, 0, $4,
      'counter', NOW(), 'paid'
    )
  `;
  await client.query(sql, [
    params.invoiceId,
    params.ownerId,
    params.petId,
    params.totalAmount
  ]);
}

export async function createBoardingInvoiceLine(params: {
  invoiceLineId: string;
  invoiceId: string;
  boardingRecordId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}, client: PoolClient) {
  const sql = `
    INSERT INTO pet_center.invoice_lines (
      invoice_line_id, invoice_id, service_id, source_type, source_id,
      description, quantity, unit_price, line_discount_amount, line_amount
    )
    VALUES (
      $1, $2, NULL, 'boarding', $3,
      $4, $5, $6, 0, $7
    )
  `;
  await client.query(sql, [
    params.invoiceLineId,
    params.invoiceId,
    params.boardingRecordId,
    params.description,
    params.quantity,
    params.unitPrice,
    params.lineAmount
  ]);
}

export async function createBoardingPayment(params: {
  paymentId: string;
  invoiceId: string;
  paidAmount: number;
}, client: PoolClient) {
  const sql = `
    INSERT INTO pet_center.payments (
      payment_id, invoice_id, payment_method, transaction_code,
      paid_amount, paid_at, payment_status, receipt_code, receipt_url
    )
    VALUES (
      $1, $2, 'at_counter', NULL,
      $3, NOW(), 'success', NULL, NULL
    )
  `;
  await client.query(sql, [
    params.paymentId,
    params.invoiceId,
    params.paidAmount
  ]);
}

