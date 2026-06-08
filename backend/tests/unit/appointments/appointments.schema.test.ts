import { describe, expect, it } from "vitest";
import {
  rejectStaffAppointmentSchema,
  completeDoctorExaminationSchema,
} from "../../../src/modules/appointments/appointments.schema.js";

describe("rejectStaffAppointmentSchema", () => {
  it("UT-APPOINTMENT-STAFF-009 - Từ chối rejectionReason dưới 5 ký tự", () => {
    const payload = { rejectionReason: "Bận" };
    const result = rejectStaffAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 5 characters");
    }
  });
});

describe("completeDoctorExaminationSchema", () => {
  const validBasePayload = {
    diagnosis: "Viêm nhẹ",
    conclusion: "Theo dõi 3 ngày",
  };

  it("UT-EXAM-005 - Từ chối diagnosis rỗng", () => {
    const payload = { ...validBasePayload, diagnosis: "" };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Diagnosis is required");
    }
  });

  it("UT-EXAM-006 - Từ chối conclusion rỗng", () => {
    const payload = { ...validBasePayload, conclusion: "" };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Conclusion is required");
    }
  });

  it("UT-EXAM-007 - Chấp nhận diagnosis đúng 3000 ký tự", () => {
    const payload = { ...validBasePayload, diagnosis: "a".repeat(3000) };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UT-EXAM-008 - Từ chối diagnosis dài 3001 ký tự", () => {
    const payload = { ...validBasePayload, diagnosis: "a".repeat(3001) };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("UT-EXAM-009 - Từ chối prescription item thiếu dosage", () => {
    const payload = {
      ...validBasePayload,
      prescriptionItems: [
        {
          medicineId: "med_001",
          dosage: "",
          frequency: "2 lần/ngày",
          duration: "5 ngày",
          usageInstruction: "Uống sau ăn",
        },
      ],
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Dosage is required");
    }
  });

  it("UT-EXAM-010 - Từ chối vaccination thiếu vaccineName", () => {
    const payload = {
      ...validBasePayload,
      vaccination: {
        vaccineName: "",
        vaccinationDate: "2026-06-20",
      },
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Vaccine name is required");
    }
  });

  it("UT-PRESCRIPTION-003 - Từ chối medicineId rỗng", () => {
    const payload = {
      ...validBasePayload,
      prescriptionItems: [
        {
          medicineId: "",
          dosage: "1 viên",
          frequency: "2 lần/ngày",
          duration: "5 ngày",
          usageInstruction: "Uống sau ăn",
        },
      ],
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Medicine is required");
    }
  });

  it("UT-PRESCRIPTION-004 - Từ chối dosage rỗng", () => {
    const payload = {
      ...validBasePayload,
      prescriptionItems: [
        {
          medicineId: "med_001",
          dosage: "",
          frequency: "2 lần/ngày",
          duration: "5 ngày",
          usageInstruction: "Uống sau ăn",
        },
      ],
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Dosage is required");
    }
  });

  it("UT-PRESCRIPTION-005 - Từ chối quantity bằng 0", () => {
    const payload = {
      ...validBasePayload,
      prescriptionItems: [
        {
          medicineId: "med_001",
          quantity: 0,
          dosage: "1 viên",
          frequency: "2 lần/ngày",
          duration: "5 ngày",
          usageInstruction: "Uống sau ăn",
        },
      ],
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("UT-PRESCRIPTION-006 - Từ chối frequency dài hơn 120 ký tự", () => {
    const payload = {
      ...validBasePayload,
      prescriptionItems: [
        {
          medicineId: "med_001",
          dosage: "1 viên",
          frequency: "a".repeat(121),
          duration: "5 ngày",
          usageInstruction: "Uống sau ăn",
        },
      ],
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("UT-PRESCRIPTION-007 - Từ chối duration rỗng", () => {
    const payload = {
      ...validBasePayload,
      prescriptionItems: [
        {
          medicineId: "med_001",
          dosage: "1 viên",
          frequency: "2 lần",
          duration: "",
          usageInstruction: "Uống sau ăn",
        },
      ],
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Duration is required");
    }
  });

  it("UT-PRESCRIPTION-008 - Từ chối usageInstruction dài hơn 1000 ký tự", () => {
    const payload = {
      ...validBasePayload,
      prescriptionItems: [
        {
          medicineId: "med_001",
          dosage: "1 viên",
          frequency: "2 lần",
          duration: "5 ngày",
          usageInstruction: "a".repeat(1001),
        },
      ],
    };
    const result = completeDoctorExaminationSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
