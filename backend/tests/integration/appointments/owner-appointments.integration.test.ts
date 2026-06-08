import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";
import { query } from "../../../src/db/query.js";
import {
  cleanupIntegrationTestData,
  integrationTestIds,
  seedIntegrationTestData,
  type IntegrationTestSeedData,
} from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentCreated: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentConfirmed: vi.fn().mockResolvedValue(undefined),
  notifyMedicalExamCompleted: vi.fn().mockResolvedValue(undefined),
}));

describe("owner appointments API integration", () => {
  let seedData: IntegrationTestSeedData;

  beforeEach(async () => {
    seedData = await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("IT-APPOINTMENT-001 - owner creates appointment successfully through API", async () => {
    // Arrange
    const ownerToken = await loginAsOwner();
    const payload = {
      petId: integrationTestIds.petId,
      examTypeId: seedData.examTypeId,
      scheduledAt: seedData.ownerCreateScheduledAt,
      symptomDescription: "Bỏ ăn 2 ngày",
    };

    // Act
    const response = await request(app)
      .post("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tạo lịch hẹn thành công");
    expect(response.body.data.status).toBe("PENDING");
    expect(response.body.data.appointmentCode).toEqual(expect.any(String));

    const result = await query<{ total: string }>(
      `
      SELECT COUNT(*)::text AS total
      FROM pet_center.medical_appointments
      WHERE owner_user_id = $1
        AND pet_id = $2
        AND scheduled_at = $3
        AND appointment_status = 'pending'
      `,
      [integrationTestIds.ownerUserId, integrationTestIds.petId, seedData.ownerCreateScheduledAt]
    );
    expect(Number(result.rows[0]?.total ?? 0)).toBe(1);
  });

  it("IT-APPOINTMENT-002 - owner appointment API rejects missing token", async () => {
    // Arrange
    const payload = {
      petId: integrationTestIds.petId,
      examTypeId: seedData.examTypeId,
      scheduledAt: seedData.ownerCreateScheduledAt,
      symptomDescription: "Bỏ ăn 2 ngày",
    };

    // Act
    const response = await request(app).post("/api/v1/owner/appointments").send(payload);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    const result = await query<{ total: string }>(
      `
      SELECT COUNT(*)::text AS total
      FROM pet_center.medical_appointments
      WHERE owner_user_id = $1
        AND pet_id = $2
        AND scheduled_at = $3
      `,
      [integrationTestIds.ownerUserId, integrationTestIds.petId, seedData.ownerCreateScheduledAt]
    );
    expect(Number(result.rows[0]?.total ?? 0)).toBe(0);
  });
});
