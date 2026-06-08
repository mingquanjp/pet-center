import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";
import { query } from "../../../src/db/query.js";
import {
  cleanupIntegrationTestData,
  integrationTestIds,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";
import { loginAsDoctor } from "../helpers/integration-test-auth.js";

vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentCreated: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentConfirmed: vi.fn().mockResolvedValue(undefined),
  notifyMedicalExamCompleted: vi.fn().mockResolvedValue(undefined),
}));

describe("doctor examinations API integration", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("IT-DOCTOR-001 - doctor completes examination with prescription through API", async () => {
    // Arrange
    const doctorToken = await loginAsDoctor();
    const payload = {
      diagnosis: "Viêm da nhẹ",
      conclusion: "Theo dõi 3 ngày",
      healthNote: "Tránh tắm",
      prescriptionItems: [
        {
          medicineId: integrationTestIds.medicineId,
          quantity: 10,
          dosage: "1 viên/lần",
          frequency: "2 lần/ngày",
          duration: "5 ngày",
          usageInstruction: "Uống sau ăn",
        },
      ],
    };

    // Act
    const response = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/complete`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Hoàn tất khám thành công");

    const examResult = await query<{ exam_id: string; exam_status: string }>(
      `
      SELECT exam_id, exam_status
      FROM pet_center.medical_exams
      WHERE appointment_id = $1
      `,
      [integrationTestIds.doctorAppointmentId]
    );
    expect(examResult.rows[0]).toMatchObject({
      exam_status: "prescribed",
    });

    const prescriptionResult = await query<{ total: string }>(
      `
      SELECT COUNT(*)::text AS total
      FROM pet_center.prescriptions
      WHERE exam_id = $1
      `,
      [examResult.rows[0]?.exam_id]
    );
    expect(Number(prescriptionResult.rows[0]?.total ?? 0)).toBe(1);

    const prescriptionItemResult = await query<{ total: string }>(
      `
      SELECT COUNT(*)::text AS total
      FROM pet_center.prescription_items pi
      JOIN pet_center.prescriptions p ON p.prescription_id = pi.prescription_id
      WHERE p.exam_id = $1
        AND pi.medicine_id = $2
      `,
      [examResult.rows[0]?.exam_id, integrationTestIds.medicineId]
    );
    expect(Number(prescriptionItemResult.rows[0]?.total ?? 0)).toBe(1);

    const appointmentResult = await query<{ examination_status: string }>(
      `
      SELECT examination_status
      FROM pet_center.medical_appointments
      WHERE appointment_id = $1
      `,
      [integrationTestIds.doctorAppointmentId]
    );
    expect(appointmentResult.rows[0]?.examination_status).toBe("completed");
  });
});
