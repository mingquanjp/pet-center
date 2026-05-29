import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import * as dashboardRepository from "./dashboard.repository.js";

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền xem dashboard của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

export async function getOwnerDashboard(authUser: AuthUser) {
  assertOwner(authUser);

  return dashboardRepository.getOwnerDashboard(authUser.userId, authUser.fullName);
}
