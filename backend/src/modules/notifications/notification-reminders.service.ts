import cron from "node-cron";
import { query } from "../../db/query.js";
import { createId } from "../../shared/utils/id.js";
import { notifyAppointmentReminder1Day, notifyBoardingCheckinReminder1Day } from "./notification-events.js";

async function createReminderLog(
  reminderType: string,
  receiverUserId: string,
  relatedObjectType: string,
  relatedObjectId: string,
  remindAt: Date
) {
  const reminderId = await createId("rem");
  try {
    const result = await query(
      `INSERT INTO pet_center.notification_reminders 
       (reminder_id, reminder_type, receiver_user_id, related_object_type, related_object_id, remind_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (reminder_type, receiver_user_id, related_object_type, related_object_id) DO NOTHING
       RETURNING reminder_id`,
      [reminderId, reminderType, receiverUserId, relatedObjectType, relatedObjectId, remindAt]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Failed to insert reminder log:", error);
    return null;
  }
}

async function processAppointmentReminders() {
  try {
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const result = await query(
      `SELECT appointment_id, owner_user_id, scheduled_at 
       FROM pet_center.medical_appointments
       WHERE appointment_status = 'confirmed' 
         AND scheduled_at >= $1 
         AND scheduled_at <= $2`,
      [tomorrowStart, tomorrowEnd]
    );

    for (const app of result.rows) {
      const log = await createReminderLog(
        "APPOINTMENT_REMINDER_1_DAY",
        app.owner_user_id,
        "medical_appointment",
        app.appointment_id,
        app.scheduled_at
      );

      if (log) {
        await notifyAppointmentReminder1Day(app.appointment_id);
        await query(
          `UPDATE pet_center.notification_reminders SET reminder_status = 'sent', sent_at = now() WHERE reminder_id = $1`,
          [log.reminder_id]
        );
      }
    }
  } catch (err) {
    console.error("Error processing appointment reminders:", err);
  }
}

async function processBoardingReminders() {
  try {
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const result = await query(
      `SELECT boarding_record_id, owner_user_id, planned_check_in_at 
       FROM pet_center.boarding_records
       WHERE boarding_status = 'confirmed' 
         AND planned_check_in_at >= $1 
         AND planned_check_in_at <= $2`,
      [tomorrowStart, tomorrowEnd]
    );

    for (const record of result.rows) {
      const log = await createReminderLog(
        "BOARDING_CHECKIN_REMINDER_1_DAY",
        record.owner_user_id,
        "boarding_record",
        record.boarding_record_id,
        record.planned_check_in_at
      );

      if (log) {
        await notifyBoardingCheckinReminder1Day(record.boarding_record_id);
        await query(
          `UPDATE pet_center.notification_reminders SET reminder_status = 'sent', sent_at = now() WHERE reminder_id = $1`,
          [log.reminder_id]
        );
      }
    }
  } catch (err) {
    console.error("Error processing boarding reminders:", err);
  }
}

export function initReminderCron() {
  // Run every day at 08:00 AM server time
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily reminders cron job");
    await processAppointmentReminders();
    await processBoardingReminders();
  });
  
  // Also run every hour just in case we miss the 08:00 or for dev purpose
  // In a real production environment, 0 8 * * * is standard.
  // I'll add a 0 * * * * cron for missed items, since dedupe table prevents double sending.
  cron.schedule("0 * * * *", async () => {
    console.log("Running hourly check for missed daily reminders");
    await processAppointmentReminders();
    await processBoardingReminders();
  });
}
