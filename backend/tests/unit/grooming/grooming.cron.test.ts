import { beforeEach, describe, expect, it, vi } from "vitest";
import cron from "node-cron";
import * as groomingRepository from "../../../src/modules/grooming/grooming.repository.js";
import { initGroomingCron } from "../../../src/modules/grooming/grooming.cron.js";

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
  }
}));
vi.mock("../../../src/modules/grooming/grooming.repository.js");

const mockCron = vi.mocked(cron);
const mockRepo = vi.mocked(groomingRepository);

describe("grooming.cron unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTX-GROOMING-243 - initGroomingCron registers schedule with correct expression", () => {
    initGroomingCron();
    expect(mockCron.schedule).toHaveBeenCalledWith("* * * * *", expect.any(Function));
  });

  it("UTX-GROOMING-244 - initGroomingCron task handles errors and isolates exception from scheduler", async () => {
    let taskCallback: any;
    mockCron.schedule.mockImplementation((expr: string, cb: any) => {
      taskCallback = cb;
      return {} as any;
    });

    initGroomingCron();
    expect(taskCallback).toBeDefined();

    mockRepo.autoCancelOverdueGroomingTickets.mockRejectedValue(new Error("Db disconnect"));

    // Invoke cron callback and verify it handles rejection safely
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(taskCallback()).resolves.not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
