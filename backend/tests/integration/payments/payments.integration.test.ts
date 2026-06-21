import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { pool } from "../../../src/db/pool.js";

// Mock signature verification to always succeed in integration tests
vi.mock("../../../src/modules/payments/vnpay.service.js", async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    verifyVnpaySignature: () => true,
    getPaymentResultRedirectUrl: (status: string, attemptId: string | null) => 
      `http://localhost:3000/payment-result?status=${status}&attemptId=${attemptId}`
  };
});

describe("payments happy path API integration", () => {
  const testInvoiceId = "it_inv_001";
  const testAttemptId = "it_opa_001";
  const testTxnRef = "20260621120000_123456";

  beforeEach(async () => {
    await seedIntegrationTestData();

    // Insert a test invoice
    await pool.query(`
      INSERT INTO pet_center.invoices (
        invoice_id, owner_user_id, pet_id, issued_at, subtotal_amount,
        discount_amount, surcharge_amount, total_amount, payment_option, invoice_status
      ) VALUES (
        $1, $2, $3, CURRENT_DATE, 100000, 0, 0, 100000, 'online', 'pending_payment'
      )
    `, [testInvoiceId, integrationTestIds.ownerUserId, integrationTestIds.petId]);

    // Insert a pending payment attempt
    await pool.query(`
      INSERT INTO pet_center.online_payment_attempts (
        payment_attempt_id, invoice_id, provider_txn_ref, amount, attempt_status, expires_at
      ) VALUES (
        $1, $2, $3, 100000, 'pending', now() + interval '15 minutes'
      )
    `, [testAttemptId, testInvoiceId, testTxnRef]);
  });

  afterAll(cleanupIntegrationTestData);

  it("INTX-PAYMENTS-271 - GET /payments/vnpay/return processes successful callback and redirects to frontend", async () => {
    const response = await request(app)
      .get("/api/v1/payments/vnpay/return")
      .query({
        vnp_TxnRef: testTxnRef,
        vnp_Amount: "10000000", // vnpay amount is *100
        vnp_ResponseCode: "00",
        vnp_TransactionStatus: "00",
        vnp_SecureHash: "dummyhash"
      });

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("status=success");
    expect(response.headers.location).toContain(`attemptId=${testAttemptId}`);
  });

  it("INTX-PAYMENTS-273 - GET /payments/vnpay/ipn processes successful callback and updates database", async () => {
    const response = await request(app)
      .get("/api/v1/payments/vnpay/ipn")
      .query({
        vnp_TxnRef: testTxnRef,
        vnp_Amount: "10000000",
        vnp_ResponseCode: "00",
        vnp_TransactionStatus: "00",
        vnp_TransactionNo: "12345678",
        vnp_SecureHash: "dummyhash"
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ RspCode: "00", Message: "Confirm Success" });

    // Verify invoice is paid
    const invRes = await pool.query("SELECT invoice_status FROM pet_center.invoices WHERE invoice_id = $1", [testInvoiceId]);
    expect(invRes.rows[0].invoice_status).toBe("paid");

    // Verify attempt is success
    const attemptRes = await pool.query("SELECT attempt_status FROM pet_center.online_payment_attempts WHERE payment_attempt_id = $1", [testAttemptId]);
    expect(attemptRes.rows[0].attempt_status).toBe("success");
  });
});
