import { beforeEach, describe, expect, it, vi } from "vitest";
import * as repo from "../../../src/modules/follow-ups/follow-ups.repository.js";
import {
  listDoctorFollowUps,
  getDoctorFollowUpDetail
} from "../../../src/modules/follow-ups/follow-ups.service.js";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";

vi.mock("../../../src/modules/follow-ups/follow-ups.repository.js");

const mockRepo = vi.mocked(repo);

describe("follow-ups.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listDoctorFollowUps", () => {
    it("UTX-FOLLOW_UPS-169 - listDoctorFollowUps successfully retrieves and formats paginated list of follow ups for a doctor", async () => {
      const mockListRow = {
        follow_up_id: "fui_001",
        exam_id: "exam_001",
        appointment_id: "appt_001",
        follow_up_date: "2026-06-25",
        reason: "Tái khám sau phẫu thuật",
        owner_note: "Chủ nuôi lo lắng",
        effective_status: "upcoming",
        completed_at: null,
        exam_date: "2026-06-20",
        diagnosis: "Viêm tai",
        conclusion: "Theo dõi thêm",
        pet_id: "pet_001",
        pet_name: "Ki",
        species: "Dog",
        breed: "Golden Retriever",
        gender: "male",
        birth_date: "2020-01-01",
        estimated_age: "6",
        profile_image_url: "https://example.com/ki.jpg",
        owner_id: "own_001",
        owner_name: "Nguyễn Văn Owner",
        owner_phone: "0909123456",
        owner_email: "owner@gmail.com",
        doctor_id: "doc_001",
        doctor_name: "Lê Văn Bác Sĩ",
        medicine_count: "3"
      };

      const mockStatsRow = {
        upcoming_count: "5",
        overdue_count: "2",
        completed_count: "10"
      };

      mockRepo.getDoctorFollowUpsList.mockResolvedValue([mockListRow] as any);
      mockRepo.getDoctorFollowUpsCount.mockResolvedValue(1);
      mockRepo.getDoctorFollowUpsStats.mockResolvedValue(mockStatsRow as any);

      const filters = {
        page: 1,
        limit: 10,
        search: "Ki"
      };

      const result = await listDoctorFollowUps("doc_001", filters);

      expect(mockRepo.getDoctorFollowUpsList).toHaveBeenCalledWith("doc_001", filters);
      expect(mockRepo.getDoctorFollowUpsCount).toHaveBeenCalledWith("doc_001", filters);
      expect(mockRepo.getDoctorFollowUpsStats).toHaveBeenCalledWith("doc_001");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].followUpId).toBe("fui_001");
      expect(result.data[0].followUpCode).toBe("TK-001");
      expect(result.data[0].pet.ageLabel).toContain("tuổi");
      expect(result.data[0].pet.genderLabel).toBe("Đực");
      
      expect(result.stats).toEqual({
        upcomingCount: 5,
        overdueCount: 2,
        completedCount: 10
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      });
    });
  });

  describe("getDoctorFollowUpDetail", () => {
    const mockDetailRow = {
      follow_up_id: "fui_002",
      exam_id: "exam_002",
      appointment_id: "appt_002",
      follow_up_date: "2026-06-25",
      reason: "Tái khám định kỳ",
      owner_note: "Ổn định",
      effective_status: "completed",
      completed_at: "2026-06-25T11:00:00Z",
      exam_date: "2026-06-18",
      diagnosis: "Khám định kỳ",
      conclusion: "Tốt",
      health_note: "Chăm sóc tốt",
      pet_id: "pet_002",
      pet_name: "Miu",
      species: "Cat",
      breed: "Mèo ta",
      gender: "female",
      birth_date: null,
      estimated_age: "2",
      profile_image_url: null,
      owner_id: "own_002",
      owner_name: "Trần Thị Owner",
      owner_phone: "0909123457",
      owner_email: "owner2@gmail.com",
      doctor_id: "doc_001",
      doctor_name: "Lê Văn Bác Sĩ",
      prescription_id: "pres_002",
      prescribed_at: "2026-06-18T10:30:00Z",
      general_note: "Uống thuốc sau ăn",
      medicine_count: "2"
    };

    it("UTX-FOLLOW_UPS-170 - getDoctorFollowUpDetail successfully retrieves and formats detailed follow up", async () => {
      mockRepo.getDoctorFollowUpDetail.mockResolvedValue(mockDetailRow as any);

      const result = await getDoctorFollowUpDetail("doc_001", "fui_002");

      expect(mockRepo.getDoctorFollowUpDetail).toHaveBeenCalledWith("doc_001", "fui_002");
      expect(result.followUpId).toBe("fui_002");
      expect(result.followUpCode).toBe("TK-002");
      expect(result.pet.ageLabel).toBe("2 tuổi");
      expect(result.pet.genderLabel).toBe("Cái");
      expect(result.exam.healthNote).toBe("Chăm sóc tốt");
      expect(result.exam.prescription).toEqual({
        prescriptionId: "pres_002",
        prescribedAt: "2026-06-18T10:30:00Z",
        generalNote: "Uống thuốc sau ăn",
        medicineCount: 2
      });
      expect(result.reminderHistory).toHaveLength(2);
      expect(result.reminderHistory[0].title).toBe("Đã tạo lịch tái khám");
      expect(result.reminderHistory[1].title).toBe("Đã hoàn tất tái khám");
    });

    it("UTX-FOLLOW_UPS-171 - getDoctorFollowUpDetail throws 404 AppError if follow up detail is not found", async () => {
      mockRepo.getDoctorFollowUpDetail.mockResolvedValue(null);

      await expect(getDoctorFollowUpDetail("doc_001", "nonexistent_fui")).rejects.toThrow(
        new AppError("Không tìm thấy lịch tái khám", "FOLLOW_UP_NOT_FOUND", httpStatus.NOT_FOUND)
      );
    });
  });
});
