import { describe, expect, it } from "vitest";
import {
  listStaffAppointmentsQuerySchema,
  staffAppointmentIdParamsSchema,
  confirmStaffAppointmentSchema,
  rejectStaffAppointmentSchema,
  listDoctorExaminationsQuerySchema,
  doctorExaminationIdParamsSchema,
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

  it("UTX-APPOINTMENTS-027 - rejectStaffAppointmentSchema chấp nhận payload hợp lệ tại các giá trị biên", () => {
    const payload = {
      rejectionReason: "Lý do từ chối hợp lệ dài hơn 5 kí tự",
      internalNote: "Ghi chú hợp lệ"
    };
    const result = rejectStaffAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UTX-APPOINTMENTS-028 - rejectStaffAppointmentSchema từ chối payload thiếu trường bắt buộc hoặc sai kiểu/enum", () => {
    const payload = {
      rejectionReason: "Ngắn", // dưới 5 ký tự
      internalNote: "a".repeat(1001) // quá 1000 ký tự
    };
    const result = rejectStaffAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("listStaffAppointmentsQuerySchema", () => {
  it("UTX-APPOINTMENTS-021 - listStaffAppointmentsQuerySchema chấp nhận payload hợp lệ tại các giá trị biên", () => {
    const payload = {
      search: "John",
      status: "CONFIRMED",
      serviceType: "GENERAL_CHECKUP",
      tab: "CONFIRMED",
      date: "2026-06-20",
      page: 1,
      limit: 10
    };
    const result = listStaffAppointmentsQuerySchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UTX-APPOINTMENTS-022 - listStaffAppointmentsQuerySchema từ chối payload thiếu trường bắt buộc hoặc sai kiểu/enum", () => {
    const payload = {
      status: "INVALID_STATUS",
      page: 0 // page < 1
    };
    const result = listStaffAppointmentsQuerySchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("staffAppointmentIdParamsSchema", () => {
  it("UTX-APPOINTMENTS-023 - staffAppointmentIdParamsSchema chấp nhận payload hợp lệ tại các giá trị biên", () => {
    const payload = { appointmentId: "appt_123" };
    const result = staffAppointmentIdParamsSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UTX-APPOINTMENTS-024 - staffAppointmentIdParamsSchema từ chối payload thiếu trường bắt buộc hoặc sai kiểu/enum", () => {
    const payload = { appointmentId: "" };
    const result = staffAppointmentIdParamsSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("confirmStaffAppointmentSchema", () => {
  it("UTX-APPOINTMENTS-025 - confirmStaffAppointmentSchema chấp nhận payload hợp lệ tại các giá trị biên", () => {
    const payload = {
      doctorUserId: "doc_123",
      internalNote: "Hợp lệ"
    };
    const result = confirmStaffAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UTX-APPOINTMENTS-026 - confirmStaffAppointmentSchema từ chối payload thiếu trường bắt buộc hoặc sai kiểu/enum", () => {
    const payload = {
      internalNote: "a".repeat(1001) // quá 1000 ký tự
    };
    const result = confirmStaffAppointmentSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("listDoctorExaminationsQuerySchema", () => {
  it("UTX-APPOINTMENTS-029 - listDoctorExaminationsQuerySchema chấp nhận payload hợp lệ tại các giá trị biên", () => {
    const payload = {
      search: "Buddy",
      status: "WAITING",
      examType: "VACCINATION",
      tab: "WAITING",
      date: "2026-06-20",
      page: 2,
      limit: 15
    };
    const result = listDoctorExaminationsQuerySchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UTX-APPOINTMENTS-030 - listDoctorExaminationsQuerySchema từ chối payload thiếu trường bắt buộc hoặc sai kiểu/enum", () => {
    const payload = {
      status: "EXAMINING_INVALID",
      limit: 51 // max 50
    };
    const result = listDoctorExaminationsQuerySchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("doctorExaminationIdParamsSchema", () => {
  it("UTX-APPOINTMENTS-031 - doctorExaminationIdParamsSchema chấp nhận payload hợp lệ tại các giá trị biên", () => {
    const payload = { appointmentId: "exam_123" };
    const result = doctorExaminationIdParamsSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("UTX-APPOINTMENTS-032 - doctorExaminationIdParamsSchema từ chối payload thiếu trường bắt buộc hoặc sai kiểu/enum", () => {
    const payload = { appointmentId: "" };
    const result = doctorExaminationIdParamsSchema.safeParse(payload);
    expect(result.success).toBe(false);
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
