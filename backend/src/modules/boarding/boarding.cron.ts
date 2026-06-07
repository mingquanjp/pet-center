import cron from "node-cron";
import * as boardingRepository from "./boarding.repository.js";

export function initBoardingCron() {
  // Run every 15 minutes to process auto-reject and auto-cancel
  cron.schedule("*/15 * * * *", async () => {
    try {
      const result = await boardingRepository.autoProcessExpiredBoardingRecords();
      if (result.rejectedCount > 0 || result.cancelledCount > 0) {
        console.log(`[Boarding Cron] Auto-rejected ${result.rejectedCount} records, Auto-cancelled ${result.cancelledCount} records`);
      }
    } catch (error) {
      console.error("[Boarding Cron] Error running autoProcessExpiredBoardingRecords:", error);
    }
  });
}
