import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  upsertPetActivityLog,
  findGroomingActivityContext,
  findInvoiceActivityContext
} from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";

const mockExecutor = {
  query: vi.fn()
};

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn()
}));

vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("mock-elog-id")
}));

const mockQuery = vi.mocked(query);

describe("pet-activity-logs.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecutor.query.mockReset();
  });

  describe("upsertPetActivityLog", () => {
    it("UTX-PET_ACTIVITY_LOGS-372 - upsertPetActivityLog executes insert query with parameters and returns log ID", async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ activity_log_id: "mock-elog-id" }]
      } as any);

      const result = await upsertPetActivityLog(
        {
          petId: "pet_123",
          ownerUserId: "owner_123",
          activityCategory: "medical",
          activityType: "checkup",
          activityStatus: "completed",
          title: "Medical Checkup",
          summary: "Lu was checked up",
          sourceType: "medical_exam",
          sourceId: "mex_123",
          metadata: { details: "all ok" }
        },
        mockExecutor as any
      );

      expect(mockExecutor.query).toHaveBeenCalled();
      const [sql, params] = mockExecutor.query.mock.calls[0];
      expect(sql).toContain("INSERT INTO pet_center.pet_activity_logs");
      expect(sql).toContain("ON CONFLICT (source_type, source_id, activity_type)");
      expect(params).toContain("mock-elog-id");
      expect(params).toContain("pet_123");
      expect(params).toContain("owner_123");
      expect(params).toContain("medical");
      expect(params).toContain("checkup");
      expect(params).toContain("completed");
      expect(params).toContain("Medical Checkup");
      expect(params).toContain("Lu was checked up");
      expect(params).toContain("medical_exam");
      expect(params).toContain("mex_123");

      expect(result).toBe("mock-elog-id");
    });

    it("UTX-PET_ACTIVITY_LOGS-373 - upsertPetActivityLog propagates database query failures", async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error("Upsert error"));

      await expect(
        upsertPetActivityLog(
          {
            petId: "pet_123",
            ownerUserId: "owner_123",
            activityCategory: "medical",
            activityType: "checkup",
            activityStatus: "completed",
            title: "Checkup",
            sourceType: "medical_exam",
            sourceId: "mex_123"
          },
          mockExecutor as any
        )
      ).rejects.toThrow("Upsert error");
    });
  });

  describe("findGroomingActivityContext", () => {
    it("UTX-PET_ACTIVITY_LOGS-374 - findGroomingActivityContext queries grooming context correctly", async () => {
      const mockContext = { pet_id: "pet_1", pet_name: "Lu", owner_user_id: "owner_1" };
      mockQuery.mockResolvedValueOnce({ rows: [mockContext] } as any);

      const result = await findGroomingActivityContext("gt_123");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("FROM pet_center.grooming_tickets gt");
      expect(sql).toContain("pets p ON p.pet_id = gt.pet_id");
      expect(params).toEqual(["gt_123"]);
      expect(result).toEqual(mockContext);
    });

    it("UTX-PET_ACTIVITY_LOGS-375 - findGroomingActivityContext returns null when no ticket exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await findGroomingActivityContext("gt_unknown");
      expect(result).toBeNull();
    });
  });

  describe("findInvoiceActivityContext", () => {
    it("UTX-PET_ACTIVITY_LOGS-376 - findInvoiceActivityContext queries invoice context correctly", async () => {
      const mockContext = { pet_id: "pet_1", pet_name: "Lu", owner_user_id: "owner_1" };
      mockQuery.mockResolvedValueOnce({ rows: [mockContext] } as any);

      const result = await findInvoiceActivityContext("inv_123");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("FROM pet_center.invoices i");
      expect(sql).toContain("pets p ON p.pet_id = i.pet_id");
      expect(params).toEqual(["inv_123"]);
      expect(result).toEqual(mockContext);
    });

    it("UTX-PET_ACTIVITY_LOGS-377 - findInvoiceActivityContext returns null when no invoice exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await findInvoiceActivityContext("inv_unknown");
      expect(result).toBeNull();
    });
  });
});
