import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { app } from "./app.js";

const server = app.listen(env.PORT, () => {
  console.log(`API server running at http://localhost:${env.PORT}`);
  console.log(`Swagger UI running at http://localhost:${env.PORT}/api-docs`);
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
