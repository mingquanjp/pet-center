import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import { reportsRepository } from "../../../src/modules/reports/reports.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("reports.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPeriod = {
    from: new Date("2026-06-20T00:00:00.000Z"),
    to: new Date("2026-06-21T00:00:00.000Z")
  };

  describe("getPaidRevenueSummary", () => {
    it("UTX-REPORTS-441 - getPaidRevenueSummary constructs correct SQL and returns rows", async () => {
      const mockResult = { rows: [{ current_paid_revenue: "5000000", current_successful_transactions: 10 }] };
      mockQuery.mockResolvedValueOnce(mockResult as any);

      const result = await reportsRepository.getPaidRevenueSummary(mockPeriod, "ONLINE");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("FROM pet_center.payments p");
      expect(sql).toContain("payment_method = 'online'");
      expect(params).toEqual([mockPeriod.from, mockPeriod.to]);
      expect(result).toEqual(mockResult.rows[0]);
    });

    it("UTX-REPORTS-442 - getPaidRevenueSummary propagates database query errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Query failed"));

      await expect(
        reportsRepository.getPaidRevenueSummary(mockPeriod, "ALL")
      ).rejects.toThrow("Query failed");
    });
  });

  describe("getRevenueTrend", () => {
    it("getRevenueTrend constructs correct SQL and groups by day/week/month", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);
      await reportsRepository.getRevenueTrend(mockPeriod, "WEEK", "COUNTER");

      expect(mockQuery).toHaveBeenCalled();
      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("date_trunc('week', p.paid_at)");
      expect(sql).toContain("payment_method = 'at_counter'");
    });
  });
});
