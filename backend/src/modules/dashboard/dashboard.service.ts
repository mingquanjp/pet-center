import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
import * as dashboardRepository from "./dashboard.repository.js";
import type { StaffDashboardQuery } from "./dashboard.schema.js";
import type { StaffDashboardOverviewDto } from "./dashboard.types.js";

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền xem dashboard của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function assertStaffAccess(authUser: AuthUser): void {
  if (authUser.role !== "STAFF" && authUser.role !== "ADMIN") {
    throw new AppError("Bạn không có quyền xem tổng quan nhân viên", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "NV";

  return words
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
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

export async function getStaffOverview(
  authUser: AuthUser,
  query: StaffDashboardQuery
): Promise<StaffDashboardOverviewDto> {
  assertStaffAccess(authUser);

  const [pendingAppointments, pendingGroomingTickets, roomCapacity, todayInvoices, appointmentTasks] =
    await Promise.all([
      dashboardRepository.countPendingMedicalAppointments(),
      dashboardRepository.countPendingGroomingTickets(),
      dashboardRepository.getRoomCapacitySnapshot(),
      dashboardRepository.countTodayInvoices(),
      dashboardRepository.findPendingAppointmentTasks(query.taskLimit),
    ]);

  return {
    staff: {
      fullName: authUser.fullName,
      initials: getInitials(authUser.fullName),
      roleLabel: authUser.role === "ADMIN" ? "Admin" : "Nhân viên",
    },
    stats: {
      pendingAppointments,
      pendingGroomingTickets,
      availableRooms: roomCapacity.availableRooms,
      totalRooms: roomCapacity.totalRooms,
      todayInvoices,
    },
    appointmentTasks,
  };
}
