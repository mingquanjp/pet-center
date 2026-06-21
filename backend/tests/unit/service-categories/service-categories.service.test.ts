import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/service-categories/service-categories.repository.js";
import {
  getAdminServiceCategories,
  getAdminServiceCategoryDetail,
  createAdminServiceCategory,
  updateAdminServiceCategory,
  updateAdminServiceCategoryStatus,
  deleteAdminServiceCategory
} from "../../../src/modules/service-categories/service-categories.service.js";

vi.mock("../../../src/modules/service-categories/service-categories.repository.js");
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("svc_new")
}));

const mockRepo = vi.mocked(repo);

describe("service-categories.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminServiceCategories", () => {
    it("UTX-SERVICE_CATEGORIES-443 - getAdminServiceCategories returns service categories with stats and pagination", async () => {
      const mockRow = {
        service_id: "svc_1",
        service_name: "Tắm sấy chó",
        service_category: "grooming",
        description: "Tắm sấy trọn gói",
        estimated_duration_minutes: 60,
        base_price: "150000",
        service_status: "active",
        usage_count: 5
      };

      const mockStats = {
        totalServices: 10,
        activeServices: 8,
        inactiveServices: 2,
        medicalServices: 5,
        averagePrice: 200000
      };

      mockRepo.findAdminServiceCategories.mockResolvedValue([mockRow]);
      mockRepo.countAdminServiceCategories.mockResolvedValue(10);
      mockRepo.getAdminServiceCategoryStats.mockResolvedValue(mockStats);

      const result = await getAdminServiceCategories({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: "svc_1",
        code: "svc_1",
        serviceName: "Tắm sấy chó",
        category: "grooming",
        description: "Tắm sấy trọn gói",
        durationMinutes: 60,
        basePrice: 150000,
        status: "active",
        updatedAt: null,
        usageCount: 5
      });
      expect(result.stats).toEqual(mockStats);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 10,
        totalPages: 1
      });
    });

    it("UTX-SERVICE_CATEGORIES-444 - getAdminServiceCategories throws AppError when repository fails", async () => {
      mockRepo.findAdminServiceCategories.mockRejectedValue(new Error("DB Connection Error"));

      await expect(getAdminServiceCategories({})).rejects.toThrowError(
        expect.objectContaining({
          code: "ADMIN_SERVICE_CATEGORIES_FETCH_FAILED",
          statusCode: httpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe("getAdminServiceCategoryDetail", () => {
    it("UTX-SERVICE_CATEGORIES-445 - getAdminServiceCategoryDetail returns mapped category DTO when exists", async () => {
      const mockRow = {
        service_id: "svc_1",
        service_name: "Tắm sấy chó",
        service_category: "grooming",
        description: "Tắm sấy trọn gói",
        estimated_duration_minutes: 60,
        base_price: 150000,
        service_status: "active",
        usage_count: 5
      };

      mockRepo.findServiceCategoryDetailById.mockResolvedValue(mockRow);

      const result = await getAdminServiceCategoryDetail("svc_1");
      expect(result.id).toBe("svc_1");
      expect(result.serviceName).toBe("Tắm sấy chó");
    });

    it("UTX-SERVICE_CATEGORIES-446 - getAdminServiceCategoryDetail throws AppError when service category not found", async () => {
      mockRepo.findServiceCategoryDetailById.mockResolvedValue(null);

      await expect(getAdminServiceCategoryDetail("invalid_id")).rejects.toThrowError(
        expect.objectContaining({
          code: "SERVICE_CATEGORY_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("createAdminServiceCategory", () => {
    const payload = {
      serviceName: "Khám định kỳ",
      category: "medical" as const,
      description: "Khám định kỳ cho thú cưng",
      durationMinutes: 30,
      basePrice: 100000,
      status: "active" as const
    };

    it("UTX-SERVICE_CATEGORIES-447 - createAdminServiceCategory creates a new service category successfully", async () => {
      mockRepo.checkServiceNameExists.mockResolvedValue(false);
      mockRepo.createAdminServiceCategory.mockResolvedValue(undefined);
      mockRepo.findServiceCategoryDetailById.mockResolvedValue({
        service_id: "svc_new",
        service_name: "Khám định kỳ",
        service_category: "medical",
        description: "Khám định kỳ cho thú cưng",
        estimated_duration_minutes: 30,
        base_price: 100000,
        service_status: "active",
        usage_count: 0
      });

      const result = await createAdminServiceCategory(payload);

      expect(result.id).toBe("svc_new");
      expect(result.serviceName).toBe("Khám định kỳ");
      expect(mockRepo.createAdminServiceCategory).toHaveBeenCalledWith("svc_new", payload);
    });

    it("UTX-SERVICE_CATEGORIES-448 - createAdminServiceCategory throws AppError if duplicate name or other error occurs", async () => {
      // Name exists
      mockRepo.checkServiceNameExists.mockResolvedValue(true);
      await expect(createAdminServiceCategory(payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "SERVICE_CATEGORY_NAME_EXISTS",
          statusCode: httpStatus.BAD_REQUEST
        })
      );

      // Other DB Error
      mockRepo.checkServiceNameExists.mockResolvedValue(false);
      mockRepo.createAdminServiceCategory.mockRejectedValue(new Error("Insert error"));
      await expect(createAdminServiceCategory(payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "ADMIN_SERVICE_CATEGORY_CREATE_FAILED",
          statusCode: httpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe("updateAdminServiceCategory", () => {
    const payload = {
      serviceName: "Khám định kỳ vip",
      category: "medical" as const,
      description: "Khám vip",
      durationMinutes: 45,
      basePrice: 150000,
      status: "active" as const
    };

    it("UTX-SERVICE_CATEGORIES-449 - updateAdminServiceCategory updates details successfully", async () => {
      mockRepo.findServiceCategoryById.mockResolvedValue(true);
      mockRepo.checkServiceNameExists.mockResolvedValue(false);
      mockRepo.updateAdminServiceCategory.mockResolvedValue(undefined);
      mockRepo.findServiceCategoryDetailById.mockResolvedValue({
        service_id: "svc_1",
        service_name: "Khám định kỳ vip",
        service_category: "medical",
        description: "Khám vip",
        estimated_duration_minutes: 45,
        base_price: 150000,
        service_status: "active",
        usage_count: 2
      });

      const result = await updateAdminServiceCategory("svc_1", payload);

      expect(result.id).toBe("svc_1");
      expect(result.serviceName).toBe("Khám định kỳ vip");
      expect(mockRepo.updateAdminServiceCategory).toHaveBeenCalledWith("svc_1", payload);
    });

    it("UTX-SERVICE_CATEGORIES-450 - updateAdminServiceCategory throws AppError if service not found or update fails", async () => {
      // Service not found
      mockRepo.findServiceCategoryById.mockResolvedValue(false);
      await expect(updateAdminServiceCategory("svc_invalid", payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "SERVICE_CATEGORY_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );

      // Name duplicate exists
      mockRepo.findServiceCategoryById.mockResolvedValue(true);
      mockRepo.checkServiceNameExists.mockResolvedValue(true);
      await expect(updateAdminServiceCategory("svc_1", payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "SERVICE_CATEGORY_NAME_EXISTS",
          statusCode: httpStatus.BAD_REQUEST
        })
      );
    });
  });

  describe("updateAdminServiceCategoryStatus", () => {
    it("UTX-SERVICE_CATEGORIES-451 - updateAdminServiceCategoryStatus updates status successfully", async () => {
      mockRepo.findServiceCategoryById.mockResolvedValue(true);
      mockRepo.updateServiceCategoryStatus.mockResolvedValue(undefined);
      mockRepo.findServiceCategoryDetailById.mockResolvedValue({
        service_id: "svc_1",
        service_name: "Khám",
        service_category: "medical",
        description: "Khám",
        estimated_duration_minutes: 30,
        base_price: 100000,
        service_status: "inactive",
        usage_count: 2
      });

      const result = await updateAdminServiceCategoryStatus("svc_1", "inactive");
      expect(result.status).toBe("inactive");
      expect(mockRepo.updateServiceCategoryStatus).toHaveBeenCalledWith("svc_1", "inactive");
    });

    it("UTX-SERVICE_CATEGORIES-452 - updateAdminServiceCategoryStatus throws AppError if service not found or update fails", async () => {
      mockRepo.findServiceCategoryById.mockResolvedValue(false);

      await expect(updateAdminServiceCategoryStatus("svc_invalid", "inactive")).rejects.toThrowError(
        expect.objectContaining({
          code: "SERVICE_CATEGORY_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("deleteAdminServiceCategory", () => {
    it("UTX-SERVICE_CATEGORIES-453 - deleteAdminServiceCategory deletes category when usage count is 0", async () => {
      mockRepo.findServiceCategoryDetailById.mockResolvedValue({
        service_id: "svc_1",
        service_name: "Khám",
        service_category: "medical",
        description: "Khám",
        estimated_duration_minutes: 30,
        base_price: 100000,
        service_status: "active",
        usage_count: 0
      });
      mockRepo.deleteServiceCategory.mockResolvedValue(undefined);

      const result = await deleteAdminServiceCategory("svc_1");

      expect(result.deleted).toBe(true);
      expect(result.deactivated).toBe(false);
      expect(mockRepo.deleteServiceCategory).toHaveBeenCalledWith("svc_1");
    });

    it("UTX-SERVICE_CATEGORIES-454 - deleteAdminServiceCategory deactivates instead of delete if usage count > 0, throws AppError if not found", async () => {
      // Deactivates
      mockRepo.findServiceCategoryDetailById.mockResolvedValue({
        service_id: "svc_1",
        service_name: "Khám",
        service_category: "medical",
        description: "Khám",
        estimated_duration_minutes: 30,
        base_price: 100000,
        service_status: "active",
        usage_count: 5
      });
      mockRepo.updateServiceCategoryStatus.mockResolvedValue(undefined);

      const result = await deleteAdminServiceCategory("svc_1");
      expect(result.deleted).toBe(false);
      expect(result.deactivated).toBe(true);
      expect(mockRepo.updateServiceCategoryStatus).toHaveBeenCalledWith("svc_1", "inactive");

      // Not found
      mockRepo.findServiceCategoryDetailById.mockResolvedValue(null);
      await expect(deleteAdminServiceCategory("invalid_id")).rejects.toThrowError(
        expect.objectContaining({
          code: "SERVICE_CATEGORY_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });
});
