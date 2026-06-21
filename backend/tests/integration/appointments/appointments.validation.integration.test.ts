import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";
import {
  cleanupIntegrationTestData,
  integrationTestIds,
  seedIntegrationTestData,
  type IntegrationTestSeedData,
} from "../helpers/integration-test-db.js";
import { loginAsOwner, loginAsStaff, loginAsDoctor } from "../helpers/integration-test-auth.js";

vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentCreated: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentConfirmed: vi.fn().mockResolvedValue(undefined),
  notifyMedicalExamCompleted: vi.fn().mockResolvedValue(undefined),
}));

describe("appointments API validation negative integration", () => {
  let seedData: IntegrationTestSeedData;

  beforeEach(async () => {
    seedData = await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("INTX-APPOINTMENTS-003 - GET /owner/appointments rejects invalid limit or date format", async () => {
    const token = await loginAsOwner();

    // Limit exceeds max 50
    const resLimit = await request(app)
      .get("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${token}`)
      .query({ limit: 99 });
    expect(resLimit.status).toBe(400);
    expect(resLimit.body.success).toBe(false);
    expect(resLimit.body.error.code).toBe("VALIDATION_ERROR");

    // Invalid date format
    const resDate = await request(app)
      .get("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${token}`)
      .query({ date: "21-06-2026" }); // needs YYYY-MM-DD
    expect(resDate.status).toBe(400);
  });

  it("INTX-APPOINTMENTS-006 - GET /owner/appointments/create-options handles dummy query parameters gracefully", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .get("/api/v1/owner/appointments/create-options")
      .set("Authorization", `Bearer ${token}`)
      .query({ extra: "dummy_value" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-APPOINTMENTS-009 - GET /owner/appointments/available-slots rejects missing or invalid query format", async () => {
    const token = await loginAsOwner();

    // Missing date
    const resMissing = await request(app)
      .get("/api/v1/owner/appointments/available-slots")
      .set("Authorization", `Bearer ${token}`)
      .query({ examTypeId: seedData.examTypeId });
    expect(resMissing.status).toBe(400);

    // Invalid date format
    const resInvalid = await request(app)
      .get("/api/v1/owner/appointments/available-slots")
      .set("Authorization", `Bearer ${token}`)
      .query({ date: "invalid-date", examTypeId: seedData.examTypeId });
    expect(resInvalid.status).toBe(400);
  });

  it("INTX-APPOINTMENTS-012 - POST /owner/appointments rejects invalid payload", async () => {
    const token = await loginAsOwner();

    // Missing examTypeId
    const resMissing = await request(app)
      .post("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        scheduledAt: seedData.ownerCreateScheduledAt,
      });
    expect(resMissing.status).toBe(400);

    // Invalid scheduledAt format (not ISO datetime with offset)
    const resInvalidTime = await request(app)
      .post("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: integrationTestIds.petId,
        examTypeId: seedData.examTypeId,
        scheduledAt: "2026-06-21 10:00:00", // Needs timezone offset e.g. .toISOString()
      });
    expect(resInvalidTime.status).toBe(400);
  });

  it("INTX-APPOINTMENTS-015 - GET /owner/appointments/:appointmentId handles extra query parameters gracefully", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .get(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .query({ extra: "dummy" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-APPOINTMENTS-018 - PATCH /owner/appointments/:appointmentId/cancel rejects invalid body parameters", async () => {
    const token = await loginAsOwner();
    // Reason too long (> 500 characters)
    const longReason = "a".repeat(501);
    const response = await request(app)
      .patch(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: longReason });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("INTX-APPOINTMENTS-021 - GET /staff/appointments rejects invalid query status", async () => {
    const token = await loginAsStaff();
    const response = await request(app)
      .get("/api/v1/staff/appointments")
      .set("Authorization", `Bearer ${token}`)
      .query({ status: "INVALID_STATUS" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("INTX-APPOINTMENTS-024 - GET /staff/appointments/:appointmentId handles extra query parameters gracefully", async () => {
    const token = await loginAsStaff();
    const response = await request(app)
      .get(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .query({ extra: "dummy" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-APPOINTMENTS-027 - PATCH /staff/appointments/:appointmentId/confirm rejects too long internal note", async () => {
    const token = await loginAsStaff();
    const response = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send({ internalNote: "a".repeat(1001) }); // Max 1000

    expect(response.status).toBe(400);
  });

  it("INTX-APPOINTMENTS-030 - PATCH /staff/appointments/:appointmentId/reject rejects missing or short rejection reason", async () => {
    const token = await loginAsStaff();

    // Missing reason
    const resMissing = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ internalNote: "Bác sĩ bận" });
    expect(resMissing.status).toBe(400);

    // Reason too short (< 5 chars)
    const resShort = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rejectionReason: "Bận" });
    expect(resShort.status).toBe(400);
  });

  it("INTX-APPOINTMENTS-033 - GET /doctor/examinations rejects invalid query status", async () => {
    const token = await loginAsDoctor();
    const response = await request(app)
      .get("/api/v1/doctor/examinations")
      .set("Authorization", `Bearer ${token}`)
      .query({ status: "INVALID_STATUS" });

    expect(response.status).toBe(400);
  });

  it("INTX-APPOINTMENTS-036 - GET /doctor/examinations/:appointmentId handles extra query parameters gracefully", async () => {
    const token = await loginAsDoctor();
    const response = await request(app)
      .get(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .query({ extra: "dummy" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-APPOINTMENTS-039 - POST /doctor/examinations/:appointmentId/start handles extra query parameters gracefully", async () => {
    const token = await loginAsDoctor();
    const response = await request(app)
      .post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`)
      .set("Authorization", `Bearer ${token}`)
      .query({ extra: "dummy" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-APPOINTMENTS-042 - PATCH /doctor/examinations/:appointmentId/draft rejects too long diagnosis, conclusion, or note", async () => {
    const token = await loginAsDoctor();

    // Start exam first
    await request(app)
      .post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/draft`)
      .set("Authorization", `Bearer ${token}`)
      .send({ diagnosis: "a".repeat(3001) }); // Max 3000

    expect(response.status).toBe(400);
  });

  it("INTX-APPOINTMENTS-045 - PATCH /doctor/examinations/:appointmentId/complete rejects missing diagnosis or conclusion", async () => {
    const token = await loginAsDoctor();

    // Start exam first
    await request(app)
      .post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    // Missing conclusion
    const response = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({ diagnosis: "Chẩn đoán viêm da" });

    expect(response.status).toBe(400);
  });
});
