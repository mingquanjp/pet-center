import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkHealth, checkDatabaseHealth } from "../../../src/modules/health/health.service.js";
import * as healthRepository from "../../../src/modules/health/health.repository.js";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";

vi.mock("../../../src/modules/health/health.repository.js");

const mockRepo = vi.mocked(healthRepository);

describe("health.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkHealth", () => {
    it("UTX-HEALTH-245 - checkHealth returns status ok under normal conditions", () => {
      const result = checkHealth();
      expect(result).toEqual({ status: "ok" });
    });

    it("UTX-HEALTH-246 - checkHealth handles empty input or boundary cases gracefully", () => {
      // checkHealth has no parameters, calling it directly as a boundary/no-arguments case
      const result = checkHealth();
      expect(result).toEqual({ status: "ok" });
    });
  });

  describe("checkDatabaseHealth", () => {
    it("UTX-HEALTH-247 - checkDatabaseHealth returns database connected and database now date when successful", async () => {
      const mockDate = new Date();
      mockRepo.getDatabaseNow.mockResolvedValue(mockDate);

      const result = await checkDatabaseHealth();

      expect(mockRepo.getDatabaseNow).toHaveBeenCalled();
      expect(result).toEqual({
        database: "connected",
        now: mockDate
      });
    });

    it("UTX-HEALTH-248 - checkDatabaseHealth throws DATABASE_UNAVAILABLE AppError when getDatabaseNow fails", async () => {
      mockRepo.getDatabaseNow.mockRejectedValue(new Error("DB Connection Refused"));

      await expect(checkDatabaseHealth()).rejects.toThrow(
        new AppError(
          "Không thể kết nối cơ sở dữ liệu",
          "DATABASE_UNAVAILABLE",
          httpStatus.SERVICE_UNAVAILABLE
        )
      );
    });
  });
});
