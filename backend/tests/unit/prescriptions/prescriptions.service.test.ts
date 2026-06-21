import { beforeEach, describe, expect, it, vi } from "vitest";
import { listDoctorPrescriptions, getDoctorPrescriptionDetail } from "../../../src/modules/prescriptions/prescriptions.service.js";
import * as repo from "../../../src/modules/prescriptions/prescriptions.repository.js";
import { AppError } from "../../../src/shared/errors/app-error.js";

vi.mock("../../../src/modules/prescriptions/prescriptions.repository.js");

const mockRepo = vi.mocked(repo);

describe("prescriptions.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPrescriptionListRow = {
    prescription_id: "pr_1",
    exam_id: "exam_1",
    prescribed_at: "2026-06-21T00:00:00.000Z",
    exam_status: "completed",
    doctor_name: "Dr. Smith",
    diagnosis: "Healthy",
    conclusion: "All good",
    general_note: "Keep doing what you do",
    medicine_count: "2",
    has_follow_up: true,
    pet_id: "pet_1",
    pet_name: "Bobby",
    species: "Dog",
    breed: "Husky",
    birth_date: "2024-06-21",
    estimated_age: null,
    profile_image_url: "http://bobby.jpg",
    owner_id: "owner_1",
    owner_name: "Jane Doe",
    owner_phone: "123456789"
  };

  const mockStatsRow = {
    total_count: "10",
    today_count: "2",
    follow_up_count: "3"
  };

  describe("listDoctorPrescriptions", () => {
    it("UTX-PRESCRIPTIONS-421 - listDoctorPrescriptions fetches lists, counts, stats, and returns correctly paginated data", async () => {
      mockRepo.getDoctorPrescriptionsList.mockResolvedValueOnce([mockPrescriptionListRow] as any);
      mockRepo.getDoctorPrescriptionsCount.mockResolvedValueOnce(1);
      mockRepo.getDoctorPrescriptionsStats.mockResolvedValueOnce(mockStatsRow as any);

      const filters = { page: 1, limit: 10 };
      const result = await listDoctorPrescriptions("doctor_1", filters);

      expect(mockRepo.getDoctorPrescriptionsList).toHaveBeenCalledWith("doctor_1", filters);
      expect(mockRepo.getDoctorPrescriptionsCount).toHaveBeenCalledWith("doctor_1", filters);
      expect(mockRepo.getDoctorPrescriptionsStats).toHaveBeenCalledWith("doctor_1");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].prescriptionId).toBe("pr_1");
      expect(result.data[0].pet.speciesLabel).toBe("Chó"); // Dog mapped to Chó
      expect(result.data[0].pet.ageLabel).toContain("tuổi"); // Birth date formatted to age

      expect(result.stats).toEqual({
        totalCount: 10,
        todayCount: 2,
        followUpCount: 3
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      });
    });
  });

  describe("getDoctorPrescriptionDetail", () => {
    const mockDetailRow = {
      prescription_id: "pr_1",
      exam_id: "exam_1",
      prescribed_at: "2026-06-21T00:00:00.000Z",
      exam_status: "completed",
      doctor_id: "doctor_1",
      doctor_name: "Dr. Smith",
      diagnosis: "Healthy",
      conclusion: "All good",
      general_note: "Keep doing what you do",
      pet_id: "pet_1",
      pet_name: "Bobby",
      species: "Cat",
      breed: "Persian",
      birth_date: null,
      estimated_age: "1.5",
      profile_image_url: "http://bobby.jpg",
      owner_id: "owner_1",
      owner_name: "Jane Doe",
      owner_phone: "123456789",
      follow_up_id: "fu_1",
      follow_up_date: "2026-07-21",
      follow_up_reason: "Recheck",
      follow_up_owner_note: "Bring food"
    };

    const mockItemRow = {
      prescription_item_id: "pi_1",
      medicine_id: "med_1",
      medicine_name: "Aspirin",
      medicine_unit: "tablet",
      quantity: 5,
      dosage: "1 tab",
      frequency: "once daily",
      duration: "5 days",
      usage_instruction: "After meal",
      note: "Keep cool"
    };

    it("UTX-PRESCRIPTIONS-422 - getDoctorPrescriptionDetail returns mapped detail and formatting", async () => {
      mockRepo.getDoctorPrescriptionDetail.mockResolvedValueOnce(mockDetailRow as any);
      mockRepo.getDoctorPrescriptionItems.mockResolvedValueOnce([mockItemRow] as any);

      const result = await getDoctorPrescriptionDetail("doctor_1", "pr_1");

      expect(mockRepo.getDoctorPrescriptionDetail).toHaveBeenCalledWith("doctor_1", "pr_1");
      expect(mockRepo.getDoctorPrescriptionItems).toHaveBeenCalledWith("pr_1");

      expect(result.prescriptionId).toBe("pr_1");
      expect(result.pet.speciesLabel).toBe("Mèo"); // Cat mapped to Mèo
      expect(result.pet.ageLabel).toBe("1.5 tuổi"); // Estimated age formatted
      expect(result.medicines).toHaveLength(1);
      expect(result.medicines[0].medicineName).toBe("Aspirin");
      expect(result.followUp).toEqual({
        followUpId: "fu_1",
        followUpDate: "2026-07-21",
        reason: "Recheck",
        ownerNote: "Bring food"
      });
    });

    it("UTX-PRESCRIPTIONS-423 - getDoctorPrescriptionDetail throws AppError when prescription is not found", async () => {
      mockRepo.getDoctorPrescriptionDetail.mockResolvedValueOnce(null);

      await expect(getDoctorPrescriptionDetail("doctor_1", "pr_unknown")).rejects.toThrow(
        new AppError("Không tìm thấy đơn thuốc", "PRESCRIPTION_NOT_FOUND", 404)
      );
    });
  });
});
