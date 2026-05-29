import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
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

export async function listOwnerActivityLogs(authUser: AuthUser, query: { page?: number; limit?: number }) {
  assertOwner(authUser);

  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await dashboardRepository.findOwnerActivityLogs(authUser.userId, paginationInput);

  return {
    data: result.activities,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total),
  };
}
