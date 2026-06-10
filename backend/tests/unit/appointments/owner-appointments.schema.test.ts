import { describe, expect, it } from "vitest";
import { createOwnerAppointmentSchema } from "../../../src/modules/appointments/owner/owner-appointments.schema.js";

describe("createOwnerAppointmentSchema", () => {
  const validPayload = {
    petId: "pet_001",
    examTypeId: "exam_general",
    scheduledAt: "2026-06-10T09:00:00+07:00",
    symptomDescription: "Bỏ ăn 2 ngày",
  };

  it("UT-APPOINTMENT-008 - Chấp nhận symptomDescription đúng 500 ký tự", () => {
    const payload = {
      ...validPayload,
      symptomDescription: "a".repeat(500),
    };
    const result = createOwnerAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UT-APPOINTMENT-009 - Từ chối symptomDescription dài 501 ký tự", () => {
    const payload = {
      ...validPayload,
      symptomDescription: "a".repeat(501),
    };
    const result = createOwnerAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("UT-APPOINTMENT-010 - Từ chối scheduledAt thiếu timezone offset", () => {
    const payload = {
      ...validPayload,
      scheduledAt: "2026-06-10T09:00:00",
    };
    const result = createOwnerAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("timezone offset");
    }
  });

  it("UT-APPOINTMENT-011 - Từ chối petId rỗng", () => {
    const payload = {
      ...validPayload,
      petId: "",
    };
    const result = createOwnerAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Pet is required");
    }
  });
});
