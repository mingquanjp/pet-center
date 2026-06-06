import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { app } from "./app.js";

import { initSocket } from "./realtime/socket.js";
import { initReminderCron } from "./modules/notifications/notification-reminders.service.js";

const server = app.listen(env.PORT, () => {
  console.log(`API server running at http://localhost:${env.PORT}`);
  console.log(`Swagger UI running at http://localhost:${env.PORT}/api-docs`);
  
  // Initialize Socket.io on the same HTTP server
  initSocket(server);
  console.log("Socket.io initialized");

  // Initialize reminder cron jobs
  initReminderCron();
  console.log("Reminder cron jobs initialized");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  console.log(`${signal} received. Shutting down API server.`);

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", (signal) => {
  void shutdown(signal);
});

process.on("SIGTERM", (signal) => {
  void shutdown(signal);
});
