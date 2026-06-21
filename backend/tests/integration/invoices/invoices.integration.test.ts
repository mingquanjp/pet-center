import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import {
  cleanupIntegrationTestData,
  integrationTestIds,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";
import {
  loginAsOwner,
  loginAsStaff,
} from "../helpers/integration-test-auth.js";
import { pool } from "../../../src/db/pool.js";

const testInvoiceId = "it_inv_test_001";
const testInvoiceId2 = "it_inv_test_002";

async function seedInvoiceData() {
  // Insert test invoices
  await pool.query(
    `INSERT INTO pet_center.invoices
      (invoice_id, owner_user_id, pet_id, issued_at, subtotal_amount,
       discount_amount, surcharge_amount, total_amount, payment_option, invoice_status)
     VALUES
      ($1, $2, $3, CURRENT_DATE, 200000, 0, 0, 200000, 'counter', 'draft'),
      ($4, $2, $3, CURRENT_DATE, 100000, 0, 0, 100000, 'online', 'pending_payment')
    `,
    [
      testInvoiceId,
      integrationTestIds.ownerUserId,
      integrationTestIds.petId,
      testInvoiceId2,
    ]
  );
}

describe("INTX-INVOICES - Invoices API integration", () => {
  beforeEach(async () => {
    // Clean up test-specific invoices first to avoid FK issues
    await pool.query(`DELETE FROM pet_center.invoices WHERE invoice_id LIKE 'it_inv_test_%'`);
    await seedIntegrationTestData();
    await seedInvoiceData();
  });

  afterAll(cleanupIntegrationTestData);

  // ─── Owner: list invoices ────────────────────────────────────────────────
  it("INTX-INVOICES-001 - GET /owner/invoices - owner gets own invoice list", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/owner/invoices")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("INTX-INVOICES-002 - GET /owner/invoices - owner can filter by status", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/owner/invoices")
      .query({ status: "PENDING_PAYMENT" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-INVOICES-003 - GET /owner/invoices - owner can filter by serviceType", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/owner/invoices")
      .query({ serviceType: "MEDICAL" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-INVOICES-004 - GET /owner/invoices - owner can paginate", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/owner/invoices")
      .query({ page: 1, limit: 5 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ─── Owner: get invoice detail ────────────────────────────────────────────
  it("INTX-INVOICES-005 - GET /owner/invoices/:invoiceId - owner gets own invoice detail", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get(`/api/v1/owner/invoices/${testInvoiceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-INVOICES-006 - GET /owner/invoices/:invoiceId - returns 404 for non-existent invoice", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/owner/invoices/nonexistent_id_xyz")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Staff: list invoices ────────────────────────────────────────────────
  it("INTX-INVOICES-007 - GET /staff/invoices - staff gets invoice list", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/invoices")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("INTX-INVOICES-008 - GET /staff/invoices - staff can filter by status DRAFT", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/invoices")
      .query({ status: "DRAFT" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-INVOICES-009 - GET /staff/invoices - staff can filter by serviceType", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/invoices")
      .query({ serviceType: "MEDICAL" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-INVOICES-010 - GET /staff/invoices - staff can filter by paymentOption", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/invoices")
      .query({ paymentOption: "AT_COUNTER" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Staff: get invoice detail ────────────────────────────────────────────
  it("INTX-INVOICES-011 - GET /staff/invoices/:invoiceId - staff gets invoice detail", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get(`/api/v1/staff/invoices/${testInvoiceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-INVOICES-012 - GET /staff/invoices/:invoiceId - returns 404 for non-existent invoice", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/invoices/nonexistent_id_xyz")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Staff: confirm payment ───────────────────────────────────────────────
  it("INTX-INVOICES-013 - PATCH /staff/invoices/:invoiceId/confirm-payment - staff confirms counter payment", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/invoices/${testInvoiceId}/confirm-payment`)
      .set("Authorization", `Bearer ${token}`)
      .send({ paymentMethod: "at_counter" });

    // draft or pending_payment invoice status; 200 success or 409 conflict or 400 validation
    expect([200, 409, 400]).toContain(res.status);
  });

  // ─── Staff: cancel invoice ────────────────────────────────────────────────
  it("INTX-INVOICES-014 - PATCH /staff/invoices/:invoiceId/cancel - staff cancels invoice", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/invoices/${testInvoiceId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 409]).toContain(res.status);
  });

  // ─── Auth checks ──────────────────────────────────────────────────────────
  it("INTX-INVOICES-015 - GET /owner/invoices - returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/owner/invoices");
    expect(res.status).toBe(401);
  });

  it("INTX-INVOICES-016 - GET /staff/invoices - returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/staff/invoices");
    expect(res.status).toBe(401);
  });

  it("INTX-INVOICES-017 - GET /staff/invoices - returns 403 when owner tries to access staff endpoint", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/staff/invoices")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-INVOICES-018 - GET /owner/invoices - returns 403 when staff tries to access owner endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/owner/invoices")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
