import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as medicinesRepository from "../../../src/modules/medicines/medicines.repository.js";
import {
  getAdminMedicines,
  getAdminMedicineDetail,
  createAdminMedicine,
  updateAdminMedicine,
  updateAdminMedicineStatus,
  deleteAdminMedicine,
  getMedicineUnitsService
} from "../../../src/modules/medicines/medicines.service.js";

vi.mock("../../../src/modules/medicines/medicines.repository.js");
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("med_new")
}));

const mockRepo = vi.mocked(medicinesRepository);

describe("medicines.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminMedicines", () => {
    it("UTX-MEDICINES-302 - getAdminMedicines returns mapped DTOs, stats, and pagination", async () => {
      mockRepo.findAdminMedicines.mockResolvedValue([
        {
          medicine_id: "med_1",
          medicine_name: "Aspirin",
          unit: "pill",
          description: "Pain relief",
          usage_note: "Take after food",
          unit_price: 500,
          stock_quantity: 100,
          medicine_status: "active",
          prescription_usage_count: 5
        }
      ]);
      mockRepo.countAdminMedicines.mockResolvedValue(1);
      mockRepo.getAdminMedicineStats.mockResolvedValue({
        totalMedicines: 1,
        activeMedicines: 1,
        inactiveMedicines: 0
      });

      const result = await getAdminMedicines({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: "med_1",
        code: "med_1",
        medicineName: "Aspirin",
        unit: "pill",
        description: "Pain relief",
        usageNote: "Take after food",
        unitPrice: 500,
        stockQuantity: 100,
        medicineStatus: "active",
        prescriptionUsageCount: 5
      });
      expect(result.stats.totalMedicines).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("UTX-MEDICINES-303 - getAdminMedicines throws AppError when repository fails", async () => {
      mockRepo.findAdminMedicines.mockRejectedValue(new Error("DB Error"));

      await expect(getAdminMedicines({})).rejects.toThrowError(
        expect.objectContaining({
          code: "ADMIN_MEDICINES_FETCH_FAILED",
          statusCode: httpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe("getAdminMedicineDetail", () => {
    it("UTX-MEDICINES-304 - getAdminMedicineDetail returns mapped DTO when medicine exists", async () => {
      mockRepo.findMedicineDetailById.mockResolvedValue({
        medicine_id: "med_1",
        medicine_name: "Aspirin",
        unit: "pill",
        description: "Pain relief",
        usage_note: "Take after food",
        unit_price: 500,
        stock_quantity: 100,
        medicine_status: "active",
        prescription_usage_count: 5
      });

      const result = await getAdminMedicineDetail("med_1");
      expect(result.id).toBe("med_1");
      expect(result.medicineName).toBe("Aspirin");
    });

    it("UTX-MEDICINES-305 - getAdminMedicineDetail throws AppError when medicine is not found", async () => {
      mockRepo.findMedicineDetailById.mockResolvedValue(null);

      await expect(getAdminMedicineDetail("med_invalid")).rejects.toThrowError(
        expect.objectContaining({
          code: "MEDICINE_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("createAdminMedicine", () => {
    const payload = {
      medicineName: "Aspirin",
      unit: "pill" as const,
      description: "Pain relief",
      usageNote: "Take after food",
      unitPrice: 500,
      stockQuantity: 100,
      medicineStatus: "active" as const
    };

    it("UTX-MEDICINES-306 - createAdminMedicine creates a medicine and returns mapped DTO", async () => {
      mockRepo.checkMedicineNameExists.mockResolvedValue(false);
      mockRepo.createAdminMedicine.mockResolvedValue(undefined);
      mockRepo.findMedicineDetailById.mockResolvedValue({
        medicine_id: "med_new",
        medicine_name: "Aspirin",
        unit: "pill",
        description: "Pain relief",
        usage_note: "Take after food",
        unit_price: 500,
        stock_quantity: 100,
        medicine_status: "active",
        prescription_usage_count: 0
      });

      const result = await createAdminMedicine(payload);
      expect(result.id).toBe("med_new");
      expect(result.medicineName).toBe("Aspirin");
      expect(mockRepo.createAdminMedicine).toHaveBeenCalledWith("med_new", payload);
    });

    it("UTX-MEDICINES-307 - createAdminMedicine throws AppError if name already exists", async () => {
      mockRepo.checkMedicineNameExists.mockResolvedValue(true);

      await expect(createAdminMedicine(payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "MEDICINE_NAME_EXISTS",
          statusCode: httpStatus.BAD_REQUEST
        })
      );
    });
  });

  describe("updateAdminMedicine", () => {
    const payload = {
      medicineName: "New Aspirin",
      unit: "pill" as const,
      description: "Updated description",
      usageNote: "Take after food",
      unitPrice: 600,
      stockQuantity: 120,
      medicineStatus: "active" as const
    };

    it("UTX-MEDICINES-308 - updateAdminMedicine updates medicine details and returns updated DTO", async () => {
      mockRepo.findMedicineById.mockResolvedValue(true);
      mockRepo.checkMedicineNameExists.mockResolvedValue(false);
      mockRepo.updateAdminMedicine.mockResolvedValue(undefined);
      mockRepo.findMedicineDetailById.mockResolvedValue({
        medicine_id: "med_1",
        medicine_name: "New Aspirin",
        unit: "pill",
        description: "Updated description",
        usage_note: "Take after food",
        unit_price: 600,
        stock_quantity: 120,
        medicine_status: "active",
        prescription_usage_count: 5
      });

      const result = await updateAdminMedicine("med_1", payload);
      expect(result.id).toBe("med_1");
      expect(result.medicineName).toBe("New Aspirin");
      expect(mockRepo.updateAdminMedicine).toHaveBeenCalledWith("med_1", payload);
    });

    it("UTX-MEDICINES-309 - updateAdminMedicine throws AppError if medicine not found or duplicate name exists", async () => {
      // Test case 1: Medicine not found
      mockRepo.findMedicineById.mockResolvedValue(false);
      await expect(updateAdminMedicine("med_invalid", payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "MEDICINE_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );

      // Test case 2: Duplicate name
      mockRepo.findMedicineById.mockResolvedValue(true);
      mockRepo.checkMedicineNameExists.mockResolvedValue(true);
      await expect(updateAdminMedicine("med_1", payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "MEDICINE_NAME_EXISTS",
          statusCode: httpStatus.BAD_REQUEST
        })
      );
    });
  });

  describe("updateAdminMedicineStatus", () => {
    it("UTX-MEDICINES-310 - updateAdminMedicineStatus updates status successfully", async () => {
      mockRepo.findMedicineDetailById
        .mockResolvedValueOnce({
          medicine_id: "med_1",
          medicine_name: "Aspirin",
          unit: "pill",
          description: "Pain relief",
          usage_note: "Take after food",
          unit_price: 500,
          stock_quantity: 100,
          medicine_status: "active",
          prescription_usage_count: 5
        })
        .mockResolvedValueOnce({
          medicine_id: "med_1",
          medicine_name: "Aspirin",
          unit: "pill",
          description: "Pain relief",
          usage_note: "Take after food",
          unit_price: 500,
          stock_quantity: 100,
          medicine_status: "inactive",
          prescription_usage_count: 5
        });

      mockRepo.updateMedicineStatus.mockResolvedValue(undefined);

      const result = await updateAdminMedicineStatus("med_1", { medicineStatus: "inactive" });
      expect(result.dto.medicineStatus).toBe("inactive");
      expect(result.message).toBe("Ngừng hoạt động thuốc thành công.");
      expect(mockRepo.updateMedicineStatus).toHaveBeenCalledWith("med_1", "inactive");
    });

    it("UTX-MEDICINES-311 - updateAdminMedicineStatus throws AppError when medicine not found", async () => {
      mockRepo.findMedicineDetailById.mockResolvedValue(null);

      await expect(updateAdminMedicineStatus("med_invalid", { medicineStatus: "active" })).rejects.toThrowError(
        expect.objectContaining({
          code: "MEDICINE_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("deleteAdminMedicine", () => {
    it("UTX-MEDICINES-312 - deleteAdminMedicine deletes medicine if not used, otherwise deactivates it", async () => {
      // Case A: Usage count is 0 -> deleted
      mockRepo.findMedicineById.mockResolvedValue(true);
      mockRepo.countPrescriptionUsageByMedicineId.mockResolvedValue(0);
      mockRepo.deleteMedicine.mockResolvedValue(undefined);

      const resultA = await deleteAdminMedicine("med_1");
      expect(resultA.deleted).toBe(true);
      expect(resultA.deactivated).toBe(false);
      expect(mockRepo.deleteMedicine).toHaveBeenCalledWith("med_1");

      // Case B: Usage count > 0 -> deactivated
      mockRepo.findMedicineById.mockResolvedValue(true);
      mockRepo.countPrescriptionUsageByMedicineId.mockResolvedValue(3);
      mockRepo.updateMedicineStatus.mockResolvedValue(undefined);

      const resultB = await deleteAdminMedicine("med_1");
      expect(resultB.deleted).toBe(false);
      expect(resultB.deactivated).toBe(true);
      expect(mockRepo.updateMedicineStatus).toHaveBeenCalledWith("med_1", "inactive");
    });

    it("UTX-MEDICINES-313 - deleteAdminMedicine throws AppError if medicine not found", async () => {
      mockRepo.findMedicineById.mockResolvedValue(false);

      await expect(deleteAdminMedicine("med_invalid")).rejects.toThrowError(
        expect.objectContaining({
          code: "MEDICINE_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("getMedicineUnitsService", () => {
    it("UTX-MEDICINES-314 - getMedicineUnitsService returns distinct units", async () => {
      mockRepo.getMedicineUnits.mockResolvedValue(["bottle", "pill"]);

      const result = await getMedicineUnitsService();
      expect(result).toEqual(["bottle", "pill"]);
    });

    it("UTX-MEDICINES-315 - getMedicineUnitsService throws AppError when repository fails", async () => {
      mockRepo.getMedicineUnits.mockRejectedValue(new Error("DB Error"));

      await expect(getMedicineUnitsService()).rejects.toThrowError(
        expect.objectContaining({
          code: "ADMIN_MEDICINE_UNITS_FETCH_FAILED",
          statusCode: httpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });
});
