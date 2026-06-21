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

describe("appointments authz API integration", () => {
  let seedData: IntegrationTestSeedData;

  beforeEach(async () => {
    seedData = await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("INTX-APPOINTMENTS-002 - GET /owner/appointments rejects missing/invalid token", async () => {
    const response = await request(app).get("/api/v1/owner/appointments");
    expect(response.status).toBe(401);
  });

  it("INTX-APPOINTMENTS-005 - GET /owner/appointments/create-options rejects missing/invalid token", async () => {
    const response = await request(app).get("/api/v1/owner/appointments/create-options");
    expect(response.status).toBe(401);
  });

  it("INTX-APPOINTMENTS-008 - GET /owner/appointments/available-slots rejects missing/invalid token", async () => {
    const dateStr = new Date().toISOString().split("T")[0];
    const response = await request(app)
      .get("/api/v1/owner/appointments/available-slots")
      .query({ date: dateStr, examTypeId: seedData.examTypeId });
    expect(response.status).toBe(401);
  });

  it("INTX-APPOINTMENTS-011 - POST /owner/appointments rejects missing/invalid token or wrong role", async () => {
    const payload = {
      petId: integrationTestIds.petId,
      examTypeId: seedData.examTypeId,
      scheduledAt: seedData.ownerCreateScheduledAt,
    };

    // No token -> 401
    const res401 = await request(app).post("/api/v1/owner/appointments").send(payload);
    expect(res401.status).toBe(401);

    // Staff token -> 403
    const staffToken = await loginAsStaff();
    const res403 = await request(app)
      .post("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${staffToken}`)
      .send(payload);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-014 - GET /owner/appointments/:appointmentId rejects missing/invalid token or wrong role", async () => {
    // No token -> 401
    const res401 = await request(app).get(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}`);
    expect(res401.status).toBe(401);

    // Staff token -> 403 (Note: owner endpoint restricts access to OWNER)
    const staffToken = await loginAsStaff();
    const res403 = await request(app)
      .get(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}`)
      .set("Authorization", `Bearer ${staffToken}`);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-017 - PATCH /owner/appointments/:appointmentId/cancel rejects missing/invalid token or wrong role", async () => {
    // No token -> 401
    const res401 = await request(app)
      .patch(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}/cancel`)
      .send({ reason: "Huỷ lịch" });
    expect(res401.status).toBe(401);

    // Staff token -> 403
    const staffToken = await loginAsStaff();
    const res403 = await request(app)
      .patch(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}/cancel`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ reason: "Huỷ lịch" });
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-020 - GET /staff/appointments rejects missing/invalid token or wrong role", async () => {
    // No token -> 401
    const res401 = await request(app).get("/api/v1/staff/appointments");
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .get("/api/v1/staff/appointments")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-023 - GET /staff/appointments/:appointmentId rejects missing/invalid token or wrong role", async () => {
    // No token -> 401
    const res401 = await request(app).get(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}`);
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .get(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-026 - PATCH /staff/appointments/:appointmentId/confirm rejects missing/invalid token or wrong role", async () => {
    const payload = { doctorUserId: integrationTestIds.doctorUserId };
    // No token -> 401
    const res401 = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/confirm`)
      .send(payload);
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/confirm`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-029 - PATCH /staff/appointments/:appointmentId/reject rejects missing/invalid token or wrong role", async () => {
    const payload = { rejectionReason: "Bác sĩ bận" };
    // No token -> 401
    const res401 = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/reject`)
      .send(payload);
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/reject`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-032 - GET /doctor/examinations rejects missing/invalid token or wrong role", async () => {
    // No token -> 401
    const res401 = await request(app).get("/api/v1/doctor/examinations");
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .get("/api/v1/doctor/examinations")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-035 - GET /doctor/examinations/:appointmentId rejects missing/invalid token or wrong role", async () => {
    // No token -> 401
    const res401 = await request(app).get(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}`);
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .get(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-038 - POST /doctor/examinations/:appointmentId/start rejects missing/invalid token or wrong role", async () => {
    // No token -> 401
    const res401 = await request(app).post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`);
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-041 - PATCH /doctor/examinations/:appointmentId/draft rejects missing/invalid token or wrong role", async () => {
    const payload = { diagnosis: "Draft diagnosis" };
    // No token -> 401
    const res401 = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/draft`)
      .send(payload);
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/draft`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);
    expect(res403.status).toBe(403);
  });

  it("INTX-APPOINTMENTS-044 - PATCH /doctor/examinations/:appointmentId/complete rejects missing/invalid token or wrong role", async () => {
    const payload = { diagnosis: "Completed diagnosis", conclusion: "Fully done" };
    // No token -> 401
    const res401 = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/complete`)
      .send(payload);
    expect(res401.status).toBe(401);

    // Owner token -> 403
    const ownerToken = await loginAsOwner();
    const res403 = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/complete`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);
    expect(res403.status).toBe(403);
  });
});
