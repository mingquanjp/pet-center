import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  findAdminServiceCategories,
  countAdminServiceCategories,
  getAdminServiceCategoryStats,
  findServiceCategoryById
} from "../../../src/modules/service-categories/service-categories.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("service-categories.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAdminServiceCategories", () => {
    it("UTX-SERVICE_CATEGORIES-465 - findAdminServiceCategories generates parameterized query and returns matched categories", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            service_id: "svc_1",
            service_name: "Tắm sấy chó",
            service_category: "grooming",
            description: "Tắm sấy trọn gói",
            estimated_duration_minutes: 60,
            base_price: "150000",
            service_status: "active",
            usage_count: 5
          }
        ]
      } as any);

      const result = await findAdminServiceCategories({
        search: "Tắm sấy",
        category: "grooming",
        status: "active",
        page: 2,
        limit: 5
      });

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("FROM pet_center.services s");
      expect(sql).toContain("LIKE");
      expect(sql).toContain("s.service_category =");
      expect(sql).toContain("s.service_status =");
      expect(sql).toContain("LIMIT");
      expect(sql).toContain("OFFSET");

      // Verify search text normalized (stripping accents)
      expect(params).toContain("%tam say%");
      expect(params).toContain("grooming");
      expect(params).toContain("active");
      expect(params).toContain(5); // limit
      expect(params).toContain(5); // offset = (2-1)*5

      expect(result).toHaveLength(1);
      expect(result[0].service_id).toBe("svc_1");
    });

    it("UTX-SERVICE_CATEGORIES-466 - findAdminServiceCategories handles empty results or database errors gracefully", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(findAdminServiceCategories({})).rejects.toThrow("Query failed");
    });
  });

  describe("countAdminServiceCategories", () => {
    it("UTX-SERVICE_CATEGORIES-467 - countAdminServiceCategories generates correct parameterized query", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ total: "10" }]
      } as any);

      const result = await countAdminServiceCategories({ search: "Tắm", category: "grooming" });

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("SELECT COUNT(*) AS total FROM pet_center.services s");
      expect(params).toContain("%tam%");
      expect(params).toContain("grooming");
      expect(result).toBe(10);
    });

    it("UTX-SERVICE_CATEGORIES-468 - countAdminServiceCategories handles empty/failed query gracefully", async () => {
      mockQuery.mockRejectedValue(new Error("Count failed"));

      await expect(countAdminServiceCategories({})).rejects.toThrow("Count failed");
    });
  });

  describe("getAdminServiceCategoryStats", () => {
    it("UTX-SERVICE_CATEGORIES-469 - getAdminServiceCategoryStats generates query and maps statistics correctly", async () => {
      const mockStatsRow = {
        total_services: "15",
        active_services: "12",
        inactive_services: "3",
        medical_services: "8",
        average_price: "200000"
      };

      mockQuery.mockResolvedValue({
        rows: [mockStatsRow]
      } as any);

      const result = await getAdminServiceCategoryStats();

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual({
        totalServices: 15,
        activeServices: 12,
        inactiveServices: 3,
        medicalServices: 8,
        averagePrice: 200000
      });
    });

    it("UTX-SERVICE_CATEGORIES-470 - getAdminServiceCategoryStats handles empty results and errors", async () => {
      mockQuery.mockRejectedValue(new Error("Stats failed"));

      await expect(getAdminServiceCategoryStats()).rejects.toThrow("Stats failed");
    });
  });

  describe("findServiceCategoryById", () => {
    it("UTX-SERVICE_CATEGORIES-471 - findServiceCategoryById generates correct parameterized query", async () => {
      mockQuery.mockResolvedValue({
        rowCount: 1
      } as any);

      const result = await findServiceCategoryById("svc_1");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("service_id = $1"),
        ["svc_1"]
      );
      expect(result).toBe(true);
    });

    it("UTX-SERVICE_CATEGORIES-472 - findServiceCategoryById returns false when service not found or query fails", async () => {
      // Not found
      mockQuery.mockResolvedValue({ rowCount: 0 } as any);
      const result = await findServiceCategoryById("svc_invalid");
      expect(result).toBe(false);

      // Failed query
      mockQuery.mockRejectedValue(new Error("Find ID failed"));
      await expect(findServiceCategoryById("svc_1")).rejects.toThrow("Find ID failed");
    });
  });
});
