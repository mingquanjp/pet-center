import { beforeEach, describe, expect, it, vi } from "vitest";
import cron from "node-cron";
import { initReminderCron } from "../../../src/modules/notifications/notification-reminders.service.js";
import { query } from "../../../src/db/query.js";
import {
  notifyAppointmentReminder1Day,
  notifyBoardingCheckinReminder1Day
} from "../../../src/modules/notifications/notification-events.js";

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn()
  }
}));

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn()
}));

vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("mock-rem-id")
}));

vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentReminder1Day: vi.fn(),
  notifyBoardingCheckinReminder1Day: vi.fn()
}));

const mockQuery = vi.mocked(query);
const mockCron = vi.mocked(cron);

describe("notification-reminders.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initReminderCron", () => {
    it("UTX-NOTIFICATIONS-334 - initReminderCron registers node-cron schedules and triggers reminders correctly", async () => {
      // 1. Assert that initReminderCron schedules two cron jobs
      initReminderCron();

      expect(mockCron.schedule).toHaveBeenCalledTimes(2);
      expect(mockCron.schedule).toHaveBeenNthCalledWith(1, "0 8 * * *", expect.any(Function));
      expect(mockCron.schedule).toHaveBeenNthCalledWith(2, "0 * * * *", expect.any(Function));

      // 2. Trigger the scheduled cron job callback to verify internal logic
      const dailyCallback = mockCron.schedule.mock.calls[0][1];

      // Mock DB query for appointment reminders: returns one pending reminder row
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            appointment_id: "appt_1",
            owner_user_id: "owner_1",
            scheduled_at: new Date()
          }
        ]
      } as any);

      // Mock createReminderLog insert query (for appointment reminder)
      mockQuery.mockResolvedValueOnce({
        rows: [{ reminder_id: "rem_1" }]
      } as any);

      // Mock update status query
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      // Mock DB query for boarding reminders: returns one pending boarding reminder
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            boarding_record_id: "br_1",
            owner_user_id: "owner_1",
            planned_check_in_at: new Date()
          }
        ]
      } as any);

      // Mock createReminderLog insert query (for boarding reminder)
      mockQuery.mockResolvedValueOnce({
        rows: [{ reminder_id: "rem_2" }]
      } as any);

      // Mock update status query
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      // Call the callback
      await dailyCallback();

      // Verify notification functions called
      expect(notifyAppointmentReminder1Day).toHaveBeenCalledWith("appt_1");
      expect(notifyBoardingCheckinReminder1Day).toHaveBeenCalledWith("br_1");

      // Verify correct parameters in the mock queries
      expect(mockQuery).toHaveBeenCalled();
    });
  });
});
