import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import { getDatabaseNow } from "./health.repository.js";

export function checkHealth() {
  return {
    status: "ok"
  };
}

export async function checkDatabaseHealth() {
  try {
    const now = await getDatabaseNow();

    return {
      database: "connected",
      now
    };
  } catch {
    throw new AppError(
      "Database health check failed",
      "DATABASE_UNAVAILABLE",
      httpStatus.SERVICE_UNAVAILABLE
    );
  }
}
