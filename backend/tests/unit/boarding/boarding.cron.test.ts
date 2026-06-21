import { beforeEach, describe, expect, it, vi } from "vitest";
import cron from "node-cron";
import * as boardingRepository from "../../../src/modules/boarding/boarding.repository.js";
import { initBoardingCron } from "../../../src/modules/boarding/boarding.cron.js";

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
  }
}));
vi.mock("../../../src/modules/boarding/boarding.repository.js");

const mockCron = vi.mocked(cron);
const mockRepo = vi.mocked(boardingRepository);

describe("boarding.cron unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTX-BOARDING-135 - initBoardingCron registers schedule with correct expression", () => {
    initBoardingCron();
    expect(mockCron.schedule).toHaveBeenCalledWith("*/15 * * * *", expect.any(Function));
  });

  it("UTX-BOARDING-136 - initBoardingCron task handles errors and isolates exception from scheduler", async () => {
    let taskCallback: any;
    mockCron.schedule.mockImplementation((expr: string, cb: any) => {
      taskCallback = cb;
      return {} as any;
    });

    initBoardingCron();
    expect(taskCallback).toBeDefined();

    mockRepo.autoProcessExpiredBoardingRecords.mockRejectedValue(new Error("Db connection closed"));

    // Invoke cron callback and verify it handles rejection safely
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(taskCallback()).resolves.not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
