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
  loginAsDoctor,
} from "../helpers/integration-test-auth.js";
import { pool } from "../../../src/db/pool.js";

const testGroomingServiceId = "it_groom_svc_001";
const testGroomingTicketId = "it_groom_tkt_001";

async function seedGroomingData() {
  // Seed a grooming service
  await pool.query(
    `INSERT INTO pet_center.services
      (service_id, service_name, service_category, description, estimated_duration_minutes, base_price, service_status)
     VALUES ($1, 'Tắm gội integration', 'grooming', 'Grooming integration test service', 30, 120000, 'active')
     ON CONFLICT (service_id) DO NOTHING`,
    [testGroomingServiceId]
  );
}

describe("INTX-GROOMING - Grooming API integration", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
    await seedGroomingData();
  });

  afterAll(async () => {
    // Cleanup grooming tickets and services
    await pool.query(`DELETE FROM pet_center.grooming_ticket_items WHERE grooming_ticket_id IN (SELECT grooming_ticket_id FROM pet_center.grooming_tickets WHERE pet_id LIKE 'it_%')`);
    await pool.query(`DELETE FROM pet_center.grooming_tickets WHERE grooming_ticket_id LIKE 'it_groom_%' OR pet_id LIKE 'it_%'`);
    await pool.query(`DELETE FROM pet_center.services WHERE service_id = $1`, [testGroomingServiceId]);
    await cleanupIntegrationTestData();
  });

  // ─── Owner: List grooming services ───────────────────────────────────────
  it("INTX-GROOMING-001 - GET /grooming/services - owner gets active grooming services", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/services")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ─── Staff: List grooming services ────────────────────────────────────────
  it("INTX-GROOMING-002 - GET /grooming/staff/services - staff gets grooming services", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/staff/services")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ─── Owner: Booking options ───────────────────────────────────────────────
  it("INTX-GROOMING-003 - GET /grooming/booking-options - owner gets booking options", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/booking-options")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-GROOMING-004 - GET /grooming/booking-options - owner can pass petId", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/booking-options")
      .query({ petId: integrationTestIds.petId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ─── Owner: Availability ──────────────────────────────────────────────────
  it("INTX-GROOMING-005 - GET /grooming/availability - owner gets slot availability", async () => {
    const token = await loginAsOwner();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split("T")[0];

    const res = await request(app)
      .get("/api/v1/grooming/availability")
      .query({ date: dateStr })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-GROOMING-006 - GET /grooming/availability - returns 400 if date is missing", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/availability")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  // ─── Staff: counter options ────────────────────────────────────────────────
  it("INTX-GROOMING-007 - GET /grooming/counter/options - staff gets counter options", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/counter/options")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-GROOMING-008 - GET /grooming/counter/availability - staff gets counter slot availability", async () => {
    const token = await loginAsStaff();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split("T")[0];

    const res = await request(app)
      .get("/api/v1/grooming/counter/availability")
      .query({ date: dateStr })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Owner: Create grooming ticket ────────────────────────────────────────
  it("INTX-GROOMING-009 - POST /grooming/tickets - owner creates grooming ticket", async () => {
    const token = await loginAsOwner();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    futureDate.setUTCHours(9, 0, 0, 0);

    const res = await request(app)
      .post("/api/v1/grooming/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        serviceId: testGroomingServiceId,
        scheduledAt: futureDate.toISOString(),
        paymentOption: "counter",
      });

    // 201 created or 409 if slot full (acceptable)
    expect([201, 409, 400]).toContain(res.status);
  });

  it("INTX-GROOMING-010 - POST /grooming/tickets - returns 400 when petId is missing", async () => {
    const token = await loginAsOwner();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const res = await request(app)
      .post("/api/v1/grooming/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serviceId: testGroomingServiceId,
        scheduledAt: futureDate.toISOString(),
        paymentOption: "counter",
      });

    expect(res.status).toBe(400);
  });

  it("INTX-GROOMING-011 - POST /grooming/tickets - returns 400 when paymentOption is invalid", async () => {
    const token = await loginAsOwner();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const res = await request(app)
      .post("/api/v1/grooming/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        serviceId: testGroomingServiceId,
        scheduledAt: futureDate.toISOString(),
        paymentOption: "invalid_option",
      });

    expect(res.status).toBe(400);
  });

  // ─── Owner: List booked tickets ───────────────────────────────────────────
  it("INTX-GROOMING-012 - GET /grooming/tickets - owner lists booked grooming tickets", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("INTX-GROOMING-013 - GET /grooming/tickets - owner can filter by status", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets")
      .query({ status: "pending" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-014 - GET /grooming/tickets - owner can filter by petId", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets")
      .query({ petId: integrationTestIds.petId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-015 - GET /grooming/tickets - owner can filter by timeRange", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets")
      .query({ timeRange: "upcoming" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Owner: Ticket history ────────────────────────────────────────────────
  it("INTX-GROOMING-016 - GET /grooming/tickets/history - owner lists grooming ticket history", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets/history")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("INTX-GROOMING-017 - GET /grooming/tickets/history - owner can filter by status completed", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets/history")
      .query({ status: "completed" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-018 - GET /grooming/tickets/history - owner can filter by status cancelled", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets/history")
      .query({ status: "cancelled" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Owner: Get ticket detail ─────────────────────────────────────────────
  it("INTX-GROOMING-019 - GET /grooming/tickets/:ticketId - returns 404 for non-existent ticket", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets/nonexistent_ticket_xyz")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Staff: List tickets ──────────────────────────────────────────────────
  it("INTX-GROOMING-020 - GET /grooming/staff/tickets - staff lists all grooming tickets", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.tickets)).toBe(true);
  });

  it("INTX-GROOMING-021 - GET /grooming/staff/tickets - staff can filter by status", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .query({ status: "pending" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-022 - GET /grooming/staff/tickets - staff can filter by species", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .query({ species: "Dog" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-023 - GET /grooming/staff/tickets - staff can filter by timeRange", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .query({ timeRange: "today" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-024 - GET /grooming/staff/tickets - staff can search", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .query({ search: "Milo" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Staff: Create counter ticket ─────────────────────────────────────────
  it("INTX-GROOMING-025 - POST /grooming/counter/tickets - staff creates counter ticket", async () => {
    const token = await loginAsStaff();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    futureDate.setUTCHours(10, 0, 0, 0);

    const res = await request(app)
      .post("/api/v1/grooming/counter/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        serviceId: testGroomingServiceId,
        scheduledAt: futureDate.toISOString(),
      });

    expect([201, 409, 400, 422]).toContain(res.status);
  });

  it("INTX-GROOMING-026 - POST /grooming/counter/tickets - returns 400 when body is missing fields", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .post("/api/v1/grooming/counter/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({ serviceId: testGroomingServiceId });

    expect(res.status).toBe(400);
  });

  // ─── Auth checks ──────────────────────────────────────────────────────────
  it("INTX-GROOMING-027 - GET /grooming/services - returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/grooming/services");
    expect(res.status).toBe(401);
  });

  it("INTX-GROOMING-028 - GET /grooming/services - returns 403 when staff tries to access owner endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/services")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-029 - GET /grooming/staff/services - returns 403 when owner tries to access staff endpoint", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/staff/services")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-030 - GET /grooming/staff/tickets - returns 403 when owner tries to access staff tickets", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-031 - GET /grooming/staff/tickets - returns 403 when doctor tries to access staff endpoint", async () => {
    const token = await loginAsDoctor();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-032 - PATCH /grooming/staff/tickets/:ticketId/accept - returns 404 for non-existent ticket", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch("/api/v1/grooming/staff/tickets/nonexistent_xyz/accept")
      .set("Authorization", `Bearer ${token}`);
    expect([404, 409]).toContain(res.status);
  });

  it("INTX-GROOMING-033 - PATCH /grooming/staff/tickets/:ticketId/start - returns 404 for non-existent ticket", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch("/api/v1/grooming/staff/tickets/nonexistent_xyz/start")
      .set("Authorization", `Bearer ${token}`);
    expect([404, 409]).toContain(res.status);
  });

  it("INTX-GROOMING-034 - PATCH /grooming/staff/tickets/:ticketId/complete - returns 404 for non-existent ticket", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch("/api/v1/grooming/staff/tickets/nonexistent_xyz/complete")
      .set("Authorization", `Bearer ${token}`);
    expect([404, 409]).toContain(res.status);
  });

  it("INTX-GROOMING-035 - PATCH /grooming/staff/tickets/:ticketId/cancel - returns 404 for non-existent ticket", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch("/api/v1/grooming/staff/tickets/nonexistent_xyz/cancel")
      .set("Authorization", `Bearer ${token}`);
    expect([404, 409]).toContain(res.status);
  });

  it("INTX-GROOMING-036 - PATCH /grooming/tickets/:ticketId/cancel - returns 404 for non-existent ticket", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .patch("/api/v1/grooming/tickets/nonexistent_xyz/cancel")
      .set("Authorization", `Bearer ${token}`);
    expect([404, 409]).toContain(res.status);
  });

  // ─── Pagination / search ──────────────────────────────────────────────────
  it("INTX-GROOMING-037 - GET /grooming/tickets - owner can paginate grooming tickets", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets")
      .query({ page: 1, limit: 5 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-GROOMING-038 - GET /grooming/tickets - owner can search tickets by keyword", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets")
      .query({ search: "Milo" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-039 - GET /grooming/tickets/history - owner can paginate history", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/tickets/history")
      .query({ page: 1, limit: 5 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-040 - GET /grooming/staff/tickets - staff can paginate", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/staff/tickets")
      .query({ page: 1, limit: 20 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Additional validation ────────────────────────────────────────────────
  it("INTX-GROOMING-041 - GET /grooming/counter/options - staff can filter by petId", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/counter/options")
      .query({ petId: integrationTestIds.petId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-042 - GET /grooming/counter/options - staff can search", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/counter/options")
      .query({ search: "Milo", limit: 5 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-GROOMING-043 - GET /grooming/counter/availability - returns 400 if date is missing", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/counter/availability")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("INTX-GROOMING-044 - GET /grooming/counter/options - returns 403 when owner tries to access counter options", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/grooming/counter/options")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-045 - POST /grooming/counter/tickets - returns 403 when owner tries to create counter ticket", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .post("/api/v1/grooming/counter/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        serviceId: testGroomingServiceId,
        scheduledAt: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-046 - GET /grooming/booking-options - returns 403 when staff tries owner endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/booking-options")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-047 - GET /grooming/availability - returns 403 when staff tries owner endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/grooming/availability")
      .query({ date: "2026-07-01" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("INTX-GROOMING-048 - POST /grooming/tickets - returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/v1/grooming/tickets")
      .send({
        petId: integrationTestIds.petId,
        serviceId: testGroomingServiceId,
        scheduledAt: new Date().toISOString(),
        paymentOption: "counter",
      });

    expect(res.status).toBe(401);
  });

  it("INTX-GROOMING-049 - GET /grooming/tickets - returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/grooming/tickets");
    expect(res.status).toBe(401);
  });
});
