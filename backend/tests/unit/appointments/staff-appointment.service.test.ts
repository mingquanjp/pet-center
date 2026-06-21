import { beforeEach, describe, expect, it, vi } from "vitest";
import * as repo from "../../../src/modules/appointments/staff/staff-appointment.repository.js";
import { listStaffAppointments } from "../../../src/modules/appointments/staff/staff-appointment.service.js";

vi.mock("../../../src/modules/appointments/staff/staff-appointment.repository.js");

const mockRepo = vi.mocked(repo);

describe("staff-appointment.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listStaffAppointments", () => {
    it("UTX-APPOINTMENTS-020 - listStaffAppointments trả danh sách đúng filter, sort và phân trang", async () => {
      mockRepo.getStaffAppointmentsList.mockResolvedValue([
        {
          id: "appt_1",
          pet_id: "pet_1",
          pet_name: "Buddy",
          species: "Dog",
          breed: "Poodle",
          profile_image_url: null,
          owner_id: "own_1",
          owner_name: "Nguyen Van A",
          owner_phone: "0900000000",
          owner_email: "owner@example.com",
          exam_type_id: "exam_general",
          type_code: "general_checkup",
          type_name: "Khám tổng quát",
          scheduled_at: "2099-06-20T08:00:00.000Z",
          appointment_status: "pending",
          symptom_description: "Bỏ ăn"
        }
      ] as any);
      mockRepo.getStaffAppointmentsCount.mockResolvedValue(1);
      mockRepo.getStaffAppointmentsStats.mockResolvedValue({
        pending_count: "1",
        confirmed_count: "0",
        rejected_count: "0",
        cancelled_count: "0",
        today_total_count: "1"
      } as any);

      const result = await listStaffAppointments({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("appt_1");
      expect(result.data[0].pet.name).toBe("Buddy");
      expect(result.stats.pendingCount).toBe(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
