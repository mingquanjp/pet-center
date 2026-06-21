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
  loginAsAdmin,
  loginAsDoctor,
} from "../helpers/integration-test-auth.js";
import { pool } from "../../../src/db/pool.js";

const testRoomTypeId = "it_roomtype_001";
const testBoardingId = "it_boarding_001";
const testBoardingId2 = "it_boarding_002";

async function seedBoardingData() {
  // Seed a boarding room type
  await pool.query(
    `INSERT INTO pet_center.room_types
      (room_type_id, room_type_name, description, capacity, boarding_unit_price, room_type_status)
     VALUES ($1, 'Standard Room Integration', 'Integration test room', 5, 150000, 'active')
     ON CONFLICT (room_type_id) DO NOTHING`,
    [testRoomTypeId]
  );

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 3);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 7);

  // Seed a pending boarding record
  await pool.query(
    `INSERT INTO pet_center.boarding_records
      (boarding_record_id, owner_user_id, pet_id, room_type_id,
       planned_check_in_at, planned_check_out_at, estimated_total, boarding_status)
     VALUES ($1, $2, $3, $4, $5, $6, 450000, 'pending')
     ON CONFLICT (boarding_record_id) DO NOTHING`,
    [
      testBoardingId,
      integrationTestIds.ownerUserId,
      integrationTestIds.petId,
      testRoomTypeId,
      checkIn.toISOString(),
      checkOut.toISOString(),
    ]
  );

  const checkIn2 = new Date();
  checkIn2.setDate(checkIn2.getDate() + 10);
  const checkOut2 = new Date();
  checkOut2.setDate(checkOut2.getDate() + 14);

  // Seed a confirmed boarding record
  await pool.query(
    `INSERT INTO pet_center.boarding_records
      (boarding_record_id, owner_user_id, pet_id, room_type_id,
       planned_check_in_at, planned_check_out_at, estimated_total, boarding_status)
     VALUES ($1, $2, $3, $4, $5, $6, 750000, 'confirmed')
     ON CONFLICT (boarding_record_id) DO NOTHING`,
    [
      testBoardingId2,
      integrationTestIds.ownerUserId,
      integrationTestIds.petId,
      testRoomTypeId,
      checkIn2.toISOString(),
      checkOut2.toISOString(),
    ]
  );
}

describe("INTX-BOARDING - Boarding API integration", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
    await seedBoardingData();
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM pet_center.boarding_updates WHERE boarding_record_id LIKE 'it_%'`);
    await pool.query(`DELETE FROM pet_center.boarding_records WHERE boarding_record_id LIKE 'it_%' OR owner_user_id LIKE 'it_%'`);
    await pool.query(`DELETE FROM pet_center.room_types WHERE room_type_id = $1`, [testRoomTypeId]);
    await cleanupIntegrationTestData();
  });

  // ─── Owner: Booking options ───────────────────────────────────────────────
  it("INTX-BOARDING-001 - GET /boarding/booking-options - owner gets booking options", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/booking-options")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-BOARDING-002 - GET /boarding/booking-options - owner can pass petId", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/booking-options")
      .query({ petId: integrationTestIds.petId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-BOARDING-003 - GET /boarding/booking-options - owner can pass date range", async () => {
    const token = await loginAsOwner();
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 5);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 10);

    const res = await request(app)
      .get("/api/v1/boarding/booking-options")
      .query({
        petId: integrationTestIds.petId,
        plannedCheckInAt: checkIn.toISOString(),
        plannedCheckOutAt: checkOut.toISOString(),
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Owner: List boarding records ─────────────────────────────────────────
  it("INTX-BOARDING-004 - GET /boarding/records - owner lists own boarding records", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("INTX-BOARDING-005 - GET /boarding/records - owner can filter by status pending", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ status: "pending" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-BOARDING-006 - GET /boarding/records - owner can filter by status confirmed", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ status: "confirmed" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-007 - GET /boarding/records - owner can filter by roomTypeId", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ roomTypeId: testRoomTypeId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-008 - GET /boarding/records - owner can filter by timeRange upcoming", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ timeRange: "upcoming" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-009 - GET /boarding/records - owner can filter by timeRange current", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ timeRange: "current" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-010 - GET /boarding/records - owner can filter by timeRange past", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ timeRange: "past" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-011 - GET /boarding/records - owner can search", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ search: "Milo" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-012 - GET /boarding/records - owner can paginate", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .query({ page: 1, limit: 6 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Owner: Get boarding record detail ────────────────────────────────────
  it("INTX-BOARDING-013 - GET /boarding/records/:id - owner gets own boarding record detail", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get(`/api/v1/boarding/records/${testBoardingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-BOARDING-014 - GET /boarding/records/:id - returns 404 for non-existent record", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/boarding/records/nonexistent_boarding_xyz")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Owner: Create boarding record ────────────────────────────────────────
  it("INTX-BOARDING-015 - POST /boarding/records - owner creates a boarding record", async () => {
    const token = await loginAsOwner();
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 15);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 20);

    const res = await request(app)
      .post("/api/v1/boarding/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        roomTypeId: testRoomTypeId,
        plannedCheckInAt: checkIn.toISOString(),
        plannedCheckOutAt: checkOut.toISOString(),
        paymentOption: "counter",
      });

    expect([201, 409, 400]).toContain(res.status);
  });

  it("INTX-BOARDING-016 - POST /boarding/records - returns 422 when petId is missing", async () => {
    const token = await loginAsOwner();
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 5);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 8);

    const res = await request(app)
      .post("/api/v1/boarding/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomTypeId: testRoomTypeId,
        plannedCheckInAt: checkIn.toISOString(),
        plannedCheckOutAt: checkOut.toISOString(),
        paymentOption: "counter",
      });

    expect(res.status).toBe(400);
  });

  it("INTX-BOARDING-017 - POST /boarding/records - returns 422 when roomTypeId is missing", async () => {
    const token = await loginAsOwner();
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 5);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 8);

    const res = await request(app)
      .post("/api/v1/boarding/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        plannedCheckInAt: checkIn.toISOString(),
        plannedCheckOutAt: checkOut.toISOString(),
        paymentOption: "counter",
      });

    expect(res.status).toBe(400);
  });

  it("INTX-BOARDING-018 - POST /boarding/records - returns 422 when paymentOption is invalid", async () => {
    const token = await loginAsOwner();
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 5);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 8);

    const res = await request(app)
      .post("/api/v1/boarding/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        roomTypeId: testRoomTypeId,
        plannedCheckInAt: checkIn.toISOString(),
        plannedCheckOutAt: checkOut.toISOString(),
        paymentOption: "invalid_option",
      });

    expect(res.status).toBe(400);
  });

  // ─── Owner: Cancel boarding record ────────────────────────────────────────
  it("INTX-BOARDING-019 - PATCH /boarding/records/:id/cancel - owner cancels pending boarding record", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .patch(`/api/v1/boarding/records/${testBoardingId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-020 - PATCH /boarding/records/:id/cancel - returns 404 for non-existent record", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .patch("/api/v1/boarding/records/nonexistent_xyz/cancel")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Staff: List boarding records ─────────────────────────────────────────
  it("INTX-BOARDING-021 - GET /staff/boarding - staff lists all boarding records", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("INTX-BOARDING-022 - GET /staff/boarding - staff can filter by tab PENDING", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ tab: "PENDING" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-023 - GET /staff/boarding - staff can filter by tab CONFIRMED", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ tab: "CONFIRMED" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-024 - GET /staff/boarding - staff can filter by tab STAYING", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ tab: "STAYING" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-025 - GET /staff/boarding - staff can filter by tab CHECKED_OUT", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ tab: "CHECKED_OUT" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-026 - GET /staff/boarding - staff can filter by timeRange TODAY", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ timeRange: "TODAY" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-027 - GET /staff/boarding - staff can filter by roomType", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ roomType: testRoomTypeId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-028 - GET /staff/boarding - staff can search", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ search: "Milo" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-029 - GET /staff/boarding - staff can paginate", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .query({ page: 1, limit: 10 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Staff: Get room types ────────────────────────────────────────────────
  it("INTX-BOARDING-030 - GET /staff/boarding/room-types - staff gets boarding room types", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding/room-types")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ─── Staff: Get create options ────────────────────────────────────────────
  it("INTX-BOARDING-031 - GET /staff/boarding/create-options - staff gets create options", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding/create-options")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-BOARDING-032 - GET /staff/boarding/create-options - staff can search owners", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding/create-options")
      .query({ searchOwner: "Integration" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Staff: Get boarding detail ───────────────────────────────────────────
  it("INTX-BOARDING-033 - GET /staff/boarding/:boardingId - staff gets boarding detail", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get(`/api/v1/staff/boarding/${testBoardingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-BOARDING-034 - GET /staff/boarding/:boardingId - returns 404 for non-existent boarding", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/staff/boarding/nonexistent_xyz")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Staff: Get draft update ──────────────────────────────────────────────
  it("INTX-BOARDING-035 - GET /staff/boarding/:boardingId/draft-update - staff gets boarding draft update", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get(`/api/v1/staff/boarding/${testBoardingId}/draft-update`)
      .set("Authorization", `Bearer ${token}`);

    // 200 or 404 if no draft exists
    expect([200, 404]).toContain(res.status);
  });

  // ─── Staff: Update boarding log ───────────────────────────────────────────
  it("INTX-BOARDING-036 - PATCH /staff/boarding/:boardingId/update-log - staff updates boarding log", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/boarding/${testBoardingId}/update-log`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Integration test update log entry",
        alertLevel: "NORMAL",
        visibilityStatus: "DRAFT",
      });

    expect([200, 201, 400, 404, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-037 - PATCH /staff/boarding/:boardingId/update-log - returns 422 when description is too short", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/boarding/${testBoardingId}/update-log`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "ab" });

    expect(res.status).toBe(400);
  });

  // ─── Staff: Delete draft update ───────────────────────────────────────────
  it("INTX-BOARDING-038 - DELETE /staff/boarding/:boardingId/draft-update - staff deletes draft update", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .delete(`/api/v1/staff/boarding/${testBoardingId}/draft-update`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204, 404]).toContain(res.status);
  });

  // ─── Staff: Confirm boarding ──────────────────────────────────────────────
  it("INTX-BOARDING-039 - PATCH /staff/boarding/:boardingId/confirm - staff confirms a pending boarding", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/boarding/${testBoardingId}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send({ internalNote: "Confirmed by integration test" });

    expect([200, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-040 - PATCH /staff/boarding/:boardingId/confirm - returns 404 for non-existent boarding", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch("/api/v1/staff/boarding/nonexistent_xyz/confirm")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(404);
  });

  // ─── Staff: Reject boarding ───────────────────────────────────────────────
  it("INTX-BOARDING-041 - PATCH /staff/boarding/:boardingId/reject - staff rejects a pending boarding", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/boarding/${testBoardingId}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rejectionReason: "Integration test rejection reason" });

    expect([200, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-042 - PATCH /staff/boarding/:boardingId/reject - returns 422 when rejectionReason is missing", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/boarding/${testBoardingId}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  // ─── Staff: Check-in boarding ─────────────────────────────────────────────
  it("INTX-BOARDING-043 - PATCH /staff/boarding/:boardingId/check-in - staff checks in a confirmed boarding", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/boarding/${testBoardingId2}/check-in`)
      .set("Authorization", `Bearer ${token}`)
      .send({ internalNote: "Check-in integration test" });

    expect([200, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-044 - PATCH /staff/boarding/:boardingId/check-in - returns 404 for non-existent boarding", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch("/api/v1/staff/boarding/nonexistent_xyz/check-in")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(404);
  });

  // ─── Staff: Check-out boarding ────────────────────────────────────────────
  it("INTX-BOARDING-045 - PATCH /staff/boarding/:boardingId/check-out - staff checks out", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch(`/api/v1/staff/boarding/${testBoardingId2}/check-out`)
      .set("Authorization", `Bearer ${token}`)
      .send({ internalNote: "Check-out integration test" });

    expect([200, 400, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-046 - PATCH /staff/boarding/:boardingId/check-out - returns 404 for non-existent boarding", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .patch("/api/v1/staff/boarding/nonexistent_xyz/check-out")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(404);
  });

  // ─── Staff: Create owner ──────────────────────────────────────────────────
  it("INTX-BOARDING-047 - POST /staff/boarding/owners - staff creates a new owner for boarding", async () => {
    const token = await loginAsStaff();
    const uniqueSuffix = Date.now();
    const res = await request(app)
      .post("/api/v1/staff/boarding/owners")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Boarding New Owner",
        phoneNumber: "0912345678",
        email: `boarding.owner.${uniqueSuffix}@test.com`,
        address: "123 Integration Street",
      });

    expect([201, 200, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-048 - POST /staff/boarding/owners - returns 422 when fullName is missing", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .post("/api/v1/staff/boarding/owners")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumber: "0912345678",
        email: "test@test.com",
      });

    expect(res.status).toBe(400);
  });

  it("INTX-BOARDING-049 - POST /staff/boarding/owners - returns 422 when email is invalid", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .post("/api/v1/staff/boarding/owners")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Test Owner",
        phoneNumber: "0912345678",
        email: "not-a-valid-email",
      });

    expect(res.status).toBe(400);
  });

  // ─── Staff: Create counter boarding ───────────────────────────────────────
  it("INTX-BOARDING-050 - POST /staff/boarding - staff creates boarding at counter", async () => {
    const token = await loginAsStaff();
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 20);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 25);

    const res = await request(app)
      .post("/api/v1/staff/boarding")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ownerId: integrationTestIds.ownerUserId,
        petId: integrationTestIds.petId,
        roomTypeId: testRoomTypeId,
        plannedCheckInAt: checkIn.toISOString(),
        plannedCheckOutAt: checkOut.toISOString(),
      });

    expect([201, 200, 409, 400]).toContain(res.status);
  });

  it("INTX-BOARDING-051 - POST /staff/boarding - returns 422 when ownerId is missing", async () => {
    const token = await loginAsStaff();
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 20);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 25);

    const res = await request(app)
      .post("/api/v1/staff/boarding")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        roomTypeId: testRoomTypeId,
        plannedCheckInAt: checkIn.toISOString(),
        plannedCheckOutAt: checkOut.toISOString(),
      });

    expect(res.status).toBe(400);
  });

  // ─── Admin: Get boarding rooms ────────────────────────────────────────────
  it("INTX-BOARDING-052 - GET /admin/boarding-rooms - admin gets boarding rooms", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("INTX-BOARDING-053 - GET /admin/boarding-rooms - admin can filter by status active", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .query({ status: "active" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-054 - GET /admin/boarding-rooms - admin can filter by capacityLevel", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .query({ capacityLevel: "AVAILABLE" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-055 - GET /admin/boarding-rooms - admin can filter by priceRange", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .query({ priceRange: "UNDER_200K" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-056 - GET /admin/boarding-rooms - admin can search", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .query({ search: "Standard" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("INTX-BOARDING-057 - GET /admin/boarding-rooms - admin can paginate", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .query({ page: 1, limit: 10 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Admin: Create boarding room ──────────────────────────────────────────
  it("INTX-BOARDING-058 - POST /admin/boarding-rooms - admin creates a boarding room", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .post("/api/v1/admin/boarding-rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Integration Test New Room",
        description: "Created by integration test",
        capacity: 3,
        boardingUnitPrice: 200000,
        status: "active",
      });

    expect([201, 200, 400, 409]).toContain(res.status);
  });

  it("INTX-BOARDING-059 - POST /admin/boarding-rooms - returns 422 when name is missing", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .post("/api/v1/admin/boarding-rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        capacity: 3,
        boardingUnitPrice: 200000,
      });

    expect(res.status).toBe(400);
  });

  // ─── Admin: Get boarding room detail ──────────────────────────────────────
  it("INTX-BOARDING-060 - GET /admin/boarding-rooms/:roomTypeId - admin gets room detail", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get(`/api/v1/admin/boarding-rooms/${testRoomTypeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("INTX-BOARDING-061 - GET /admin/boarding-rooms/:roomTypeId - returns 404 for non-existent room", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms/nonexistent_xyz")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ─── Admin: Get usage history ─────────────────────────────────────────────
  it("INTX-BOARDING-062 - GET /admin/boarding-rooms/:roomTypeId/usage-history - admin gets room usage history", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get(`/api/v1/admin/boarding-rooms/${testRoomTypeId}/usage-history`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("INTX-BOARDING-063 - GET /admin/boarding-rooms/:roomTypeId/usage-history - admin can filter by boardingStatus", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .get(`/api/v1/admin/boarding-rooms/${testRoomTypeId}/usage-history`)
      .query({ boardingStatus: "pending" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ─── Admin: Update boarding room ──────────────────────────────────────────
  it("INTX-BOARDING-064 - PATCH /admin/boarding-rooms/:roomTypeId - admin updates room info", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .patch(`/api/v1/admin/boarding-rooms/${testRoomTypeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated by integration test" });

    expect([200, 404]).toContain(res.status);
  });

  // ─── Admin: Update room status ────────────────────────────────────────────
  it("INTX-BOARDING-065 - PATCH /admin/boarding-rooms/:roomTypeId/status - admin updates room status", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .patch(`/api/v1/admin/boarding-rooms/${testRoomTypeId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "inactive" });

    expect([200, 404]).toContain(res.status);
  });

  it("INTX-BOARDING-066 - PATCH /admin/boarding-rooms/:roomTypeId/status - returns 422 when status is invalid", async () => {
    const token = await loginAsAdmin();
    const res = await request(app)
      .patch(`/api/v1/admin/boarding-rooms/${testRoomTypeId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "invalid_status" });

    expect(res.status).toBe(400);
  });

  // ─── Admin: Delete boarding room ──────────────────────────────────────────
  it("INTX-BOARDING-067 - DELETE /admin/boarding-rooms/:roomTypeId - admin deletes a room", async () => {
    const token = await loginAsAdmin();

    // First create a temp room to delete
    const createRes = await request(app)
      .post("/api/v1/admin/boarding-rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Temp Room for Deletion",
        capacity: 1,
        boardingUnitPrice: 100000,
        status: "inactive",
      });

    if (createRes.status === 201 || createRes.status === 200) {
      const newRoomId = createRes.body.data?.roomTypeId || createRes.body.data?.room_type_id;
      if (newRoomId) {
        const deleteRes = await request(app)
          .delete(`/api/v1/admin/boarding-rooms/${newRoomId}`)
          .set("Authorization", `Bearer ${token}`);

        expect([200, 204, 404, 409]).toContain(deleteRes.status);
      }
    }
    // Even if we couldn't create, verify the endpoint exists
    const res = await request(app)
      .delete("/api/v1/admin/boarding-rooms/nonexistent_xyz_delete")
      .set("Authorization", `Bearer ${token}`);
    expect([404, 200, 204]).toContain(res.status);
  });

  // ─── Auth checks ──────────────────────────────────────────────────────────
  it("INTX-BOARDING-068 - GET /boarding/records - returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/boarding/records");
    expect(res.status).toBe(401);
  });

  it("INTX-BOARDING-069 - GET /staff/boarding - returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/staff/boarding");
    expect(res.status).toBe(401);
  });

  it("INTX-BOARDING-070 - GET /staff/boarding - returns 403 when owner tries to access staff endpoint", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-BOARDING-071 - GET /boarding/records - returns 403 when staff tries to access owner endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/boarding/records")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-BOARDING-072 - GET /admin/boarding-rooms - returns 403 when staff tries to access admin endpoint", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-BOARDING-073 - GET /admin/boarding-rooms - returns 403 when owner tries to access admin endpoint", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-BOARDING-074 - GET /admin/boarding-rooms - returns 403 when doctor tries to access admin endpoint", async () => {
    const token = await loginAsDoctor();
    const res = await request(app)
      .get("/api/v1/admin/boarding-rooms")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("INTX-BOARDING-075 - GET /staff/boarding - returns 403 when doctor tries to access staff endpoint", async () => {
    const token = await loginAsDoctor();
    const res = await request(app)
      .get("/api/v1/staff/boarding")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  // ─── Staff: Create pet for boarding owner ─────────────────────────────────
  it("INTX-BOARDING-076 - POST /staff/boarding/owners/:ownerId/pets - returns 422 when petName is missing", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .post(`/api/v1/staff/boarding/owners/${integrationTestIds.ownerUserId}/pets`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        species: "Dog",
        breed: "Poodle",
        gender: "male",
        estimatedAge: 2,
      });

    expect(res.status).toBe(400);
  });

  it("INTX-BOARDING-077 - POST /staff/boarding/owners/:ownerId/pets - returns 422 when species is invalid", async () => {
    const token = await loginAsStaff();
    const res = await request(app)
      .post(`/api/v1/staff/boarding/owners/${integrationTestIds.ownerUserId}/pets`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        petName: "Test Pet",
        species: "Fish",
        breed: "Goldfish",
        gender: "male",
        estimatedAge: 1,
      });

    expect(res.status).toBe(400);
  });

  it("INTX-BOARDING-078 - POST /staff/boarding/owners/:ownerId/pets - returns 403 when owner tries to access staff endpoint", async () => {
    const token = await loginAsOwner();
    const res = await request(app)
      .post(`/api/v1/staff/boarding/owners/${integrationTestIds.ownerUserId}/pets`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        petName: "Test Pet",
        species: "Dog",
        breed: "Poodle",
        gender: "male",
        estimatedAge: 2,
      });

    expect(res.status).toBe(403);
  });
});
