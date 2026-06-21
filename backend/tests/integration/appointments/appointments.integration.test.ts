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
import { loginAsOwner, loginAsStaff, loginAsDoctor } from "../helpers/integration-test-auth.js";

vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentCreated: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentConfirmed: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentRejected: vi.fn().mockResolvedValue(undefined),
  notifyMedicalExamCompleted: vi.fn().mockResolvedValue(undefined),
}));

describe("appointments happy path API integration", () => {
  let seedData: IntegrationTestSeedData;

  beforeEach(async () => {
    seedData = await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("INTX-APPOINTMENTS-001 - owner gets all appointments successfully", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .get("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("INTX-APPOINTMENTS-004 - owner gets appointment creation options successfully", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .get("/api/v1/owner/appointments/create-options")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("pets");
    expect(response.body.data).toHaveProperty("examTypes");
  });

  it("INTX-APPOINTMENTS-007 - owner gets available slots successfully", async () => {
    const token = await loginAsOwner();
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const response = await request(app)
      .get("/api/v1/owner/appointments/available-slots")
      .set("Authorization", `Bearer ${token}`)
      .query({ date: dateStr, examTypeId: seedData.examTypeId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("INTX-APPOINTMENTS-010 - owner creates appointment successfully", async () => {
    const token = await loginAsOwner();
    const payload = {
      petId: integrationTestIds.petId,
      examTypeId: seedData.examTypeId,
      scheduledAt: seedData.ownerCreateScheduledAt,
      symptomDescription: "Bỏ ăn 2 ngày",
    };

    const response = await request(app)
      .post("/api/v1/owner/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("PENDING");
  });

  it("INTX-APPOINTMENTS-013 - owner gets detail of owned appointment successfully", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .get(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(integrationTestIds.pendingAppointmentId);
  });

  it("INTX-APPOINTMENTS-016 - owner cancels pending appointment successfully", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .patch(`/api/v1/owner/appointments/${integrationTestIds.pendingAppointmentId}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Bận đột xuất" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const result = await query<{ appointment_status: string }>(
      "SELECT appointment_status FROM pet_center.medical_appointments WHERE appointment_id = $1",
      [integrationTestIds.pendingAppointmentId]
    );
    expect(result.rows[0]?.appointment_status).toBe("cancelled");
  });

  it("INTX-APPOINTMENTS-019 - staff gets all appointments successfully", async () => {
    const token = await loginAsStaff();
    const response = await request(app)
      .get("/api/v1/staff/appointments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("INTX-APPOINTMENTS-022 - staff gets detail of an appointment successfully", async () => {
    const token = await loginAsStaff();
    const response = await request(app)
      .get(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(integrationTestIds.pendingAppointmentId);
  });

  it("INTX-APPOINTMENTS-025 - staff confirms pending appointment successfully", async () => {
    const token = await loginAsStaff();
    const payload = {
      doctorUserId: integrationTestIds.doctorUserId,
      internalNote: "Ưu tiên kiểm tra da",
    };

    const response = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/confirm`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const result = await query<{ appointment_status: string; veterinarian_user_id: string }>(
      "SELECT appointment_status, veterinarian_user_id FROM pet_center.medical_appointments WHERE appointment_id = $1",
      [integrationTestIds.pendingAppointmentId]
    );
    expect(result.rows[0]).toMatchObject({
      appointment_status: "confirmed",
      veterinarian_user_id: integrationTestIds.doctorUserId,
    });
  });

  it("INTX-APPOINTMENTS-028 - staff/doctor rejects pending appointment successfully", async () => {
    const token = await loginAsStaff();
    const payload = {
      rejectionReason: "Lý do khẩn cấp khác",
      internalNote: "Bác sĩ bận việc gia đình",
    };

    const response = await request(app)
      .patch(`/api/v1/staff/appointments/${integrationTestIds.pendingAppointmentId}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const result = await query<{ appointment_status: string }>(
      "SELECT appointment_status FROM pet_center.medical_appointments WHERE appointment_id = $1",
      [integrationTestIds.pendingAppointmentId]
    );
    expect(result.rows[0]?.appointment_status).toBe("rejected");
  });

  it("INTX-APPOINTMENTS-031 - doctor gets all examinations successfully", async () => {
    const token = await loginAsDoctor();
    const response = await request(app)
      .get("/api/v1/doctor/examinations")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("INTX-APPOINTMENTS-034 - doctor gets detail of examination successfully", async () => {
    const token = await loginAsDoctor();
    const response = await request(app)
      .get(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(integrationTestIds.doctorAppointmentId);
  });

  it("INTX-APPOINTMENTS-037 - doctor starts examination successfully", async () => {
    const token = await loginAsDoctor();
    const response = await request(app)
      .post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const result = await query<{ examination_status: string }>(
      "SELECT examination_status FROM pet_center.medical_appointments WHERE appointment_id = $1",
      [integrationTestIds.doctorAppointmentId]
    );
    expect(result.rows[0]?.examination_status).toBe("examining");
  });

  it("INTX-APPOINTMENTS-040 - doctor saves draft examination successfully", async () => {
    const token = await loginAsDoctor();

    // Start exam first to put it in examining state
    await request(app)
      .post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const payload = {
      diagnosis: "Triệu chứng sơ bộ nghi viêm da",
      conclusion: "Cần xét nghiệm thêm",
      healthNote: "Không tắm xà phòng thường",
    };

    const response = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/draft`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-APPOINTMENTS-043 - doctor completes examination successfully", async () => {
    const token = await loginAsDoctor();

    // Start exam first
    await request(app)
      .post(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const payload = {
      diagnosis: "Viêm da cơ địa",
      conclusion: "Bôi thuốc và theo dõi",
      healthNote: "Tránh ẩm ướt",
      prescriptionItems: [
        {
          medicineId: integrationTestIds.medicineId,
          quantity: 10,
          dosage: "1 viên/lần",
          frequency: "2 lần/ngày",
          duration: "5 ngày",
          usageInstruction: "Uống sau khi ăn",
        },
      ],
    };

    const response = await request(app)
      .patch(`/api/v1/doctor/examinations/${integrationTestIds.doctorAppointmentId}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const apptResult = await query<{ examination_status: string }>(
      "SELECT examination_status FROM pet_center.medical_appointments WHERE appointment_id = $1",
      [integrationTestIds.doctorAppointmentId]
    );
    expect(apptResult.rows[0]?.examination_status).toBe("completed");
  });
});
