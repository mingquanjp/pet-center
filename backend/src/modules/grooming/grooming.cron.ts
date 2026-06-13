import cron from "node-cron";
import * as groomingRepository from "./grooming.repository.js";

export function initGroomingCron(): void {
  cron.schedule("* * * * *", async () => {
    try {
      const cancelledCount = await groomingRepository.autoCancelOverdueGroomingTickets();

      if (cancelledCount > 0) {
        console.log(`[Grooming Cron] Auto-cancelled ${cancelledCount} overdue ticket(s)`);
      }
    } catch (error) {
      console.error("[Grooming Cron] Error auto-cancelling overdue tickets:", error);
    }
  });
}
