import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  getDoctorExaminationsList,
  getDoctorExaminationsCount,
  getDoctorExaminationsStats,
  getDoctorExaminationsTabStats
} from "../../../src/modules/appointments/doctor/doctor-examination.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("doctor-examination.repository unit tests", () => {
  const doctorUserId = "doc_123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDoctorExaminationsList", () => {
    it("UTX-APPOINTMENTS-040 - getDoctorExaminationsList phát sinh query parameterized và ánh xạ kết quả chính xác", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            id: "appt_1",
            exam_id: "mex_1",
            pet_id: "pet_1",
            pet_name: "Buddy",
            species: "Dog",
            breed: "Poodle",
            birth_date: null,
            estimated_age: "2",
            profile_image_url: null,
            owner_id: "own_1",
            owner_name: "Nguyen Van A",
            owner_phone: "0900000000",
            owner_email: "owner@example.com",
            exam_type_id: "exam_general",
            type_code: "general_checkup",
            type_name: "Khám tổng quát",
            scheduled_at: "2099-06-20T08:00:00.000Z",
            examination_status: "waiting",
            symptom_description: "Bỏ ăn",
            internal_note: null
          }
        ]
      } as any);

      const result = await getDoctorExaminationsList(doctorUserId, { page: 1, limit: 10 });
      expect(mockQuery).toHaveBeenCalled();
      const lastCallArgs = mockQuery.mock.calls[0];
      const sqlQuery = lastCallArgs[0];
      const sqlParams = lastCallArgs[1];
      expect(sqlQuery).toContain("medical_appointments");
      expect(sqlParams).toContain(doctorUserId);
      expect(result).toHaveLength(1);
      expect(result[0].pet_name).toBe("Buddy");
    });

    it("UTX-APPOINTMENTS-041 - getDoctorExaminationsList xử lý kết quả rỗng hoặc lỗi database đúng contract", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(getDoctorExaminationsList(doctorUserId, {})).rejects.toThrow("Query failed");
    });
  });

  describe("getDoctorExaminationsCount", () => {
    it("UTX-APPOINTMENTS-042 - getDoctorExaminationsCount phát sinh query parameterized và ánh xạ kết quả chính xác", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ total: "5" }]
      } as any);

      const result = await getDoctorExaminationsCount(doctorUserId, {});
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it("UTX-APPOINTMENTS-043 - getDoctorExaminationsCount xử lý kết quả rỗng hoặc lỗi database đúng contract", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(getDoctorExaminationsCount(doctorUserId, {})).rejects.toThrow("Query failed");
    });
  });

  describe("getDoctorExaminationsStats", () => {
    it("UTX-APPOINTMENTS-044 - getDoctorExaminationsStats phát sinh query parameterized và ánh xạ kết quả chính xác", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            total_count: "10",
            waiting_count: "3",
            examining_count: "2",
            completed_count: "4",
            follow_up_count: "1"
          }
        ]
      } as any);

      const result = await getDoctorExaminationsStats(doctorUserId);
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual({
        total_count: "10",
        waiting_count: "3",
        examining_count: "2",
        completed_count: "4",
        follow_up_count: "1"
      });
    });

    it("UTX-APPOINTMENTS-045 - getDoctorExaminationsStats xử lý kết quả rỗng hoặc lỗi database đúng contract", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(getDoctorExaminationsStats(doctorUserId)).rejects.toThrow("Query failed");
    });
  });

  describe("getDoctorExaminationsTabStats", () => {
    it("UTX-APPOINTMENTS-046 - getDoctorExaminationsTabStats phát sinh query parameterized và ánh xạ kết quả chính xác", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            total_count: "5",
            waiting_count: "1",
            examining_count: "1",
            completed_count: "2",
            follow_up_count: "1"
          }
        ]
      } as any);

      const result = await getDoctorExaminationsTabStats(doctorUserId, { search: "Buddy" });
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual({
        total_count: "5",
        waiting_count: "1",
        examining_count: "1",
        completed_count: "2",
        follow_up_count: "1"
      });
    });

    it("UTX-APPOINTMENTS-047 - getDoctorExaminationsTabStats xử lý kết quả rỗng hoặc lỗi database đúng contract", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(getDoctorExaminationsTabStats(doctorUserId, {})).rejects.toThrow("Query failed");
    });
  });
});
