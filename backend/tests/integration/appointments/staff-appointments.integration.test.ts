import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";
import { query } from "../../../src/db/query.js";
import {
  cleanupIntegrationTestData,
  integrationTestIds,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";
import { loginAsOwner, loginAsStaff } from "../helpers/integration-test-auth.js";

vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentCreated: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentConfirmed: vi.fn().mockResolvedValue(undefined),
  notifyMedicalExamCompleted: vi.fn().mockResolvedValue(undefined),
}));

describe("staff appointments API integration", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("IT-STAFF-001 - staff confirms pending appointment through API", async () => {
    // Arrange
    const staffToken = await loginAsStaff();
    const payload = {
      doctorUserId: integrationTestIds.doctorUserId,
      internalNote: "Ưu tiên kiểm tra da",
    };

    // Act
    const response = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/confirm`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Xác nhận lịch hẹn thành công");

    const result = await query<{
      appointment_status: string;
      veterinarian_user_id: string | null;
    }>(
      `
      SELECT appointment_status, veterinarian_user_id
      FROM pet_center.medical_appointments
      WHERE appointment_id = $1
      `,
      [integrationTestIds.pendingAppointmentId]
    );
    expect(result.rows[0]).toMatchObject({
      appointment_status: "confirmed",
      veterinarian_user_id: integrationTestIds.doctorUserId,
    });
  });

  it("IT-STAFF-002 - staff confirm API rejects owner role", async () => {
    // Arrange
    const ownerToken = await loginAsOwner();
    const payload = {
      doctorUserId: integrationTestIds.doctorUserId,
    };

    // Act
    const response = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/confirm`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);

    // Assert
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    const result = await query<{ appointment_status: string }>(
      `
      SELECT appointment_status
      FROM pet_center.medical_appointments
      WHERE appointment_id = $1
      `,
      [integrationTestIds.pendingAppointmentId]
    );
    expect(result.rows[0]?.appointment_status).toBe("pending");
  });
});
