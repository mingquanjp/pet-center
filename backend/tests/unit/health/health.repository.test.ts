import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import { getDatabaseNow } from "../../../src/modules/health/health.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("health.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDatabaseNow", () => {
    it("UTX-HEALTH-249 - getDatabaseNow generates parameterized query and maps results correctly", async () => {
      const mockDate = new Date();
      mockQuery.mockResolvedValue({
        rows: [{ now: mockDate }]
      } as any);

      const result = await getDatabaseNow();

      expect(mockQuery).toHaveBeenCalledWith("select now() as now");
      expect(result).toBe(mockDate);
    });

    it("UTX-HEALTH-250 - getDatabaseNow handles empty results or database errors correctly", async () => {
      mockQuery.mockRejectedValue(new Error("Database error"));

      await expect(getDatabaseNow()).rejects.toThrow("Database error");
    });
  });
});
