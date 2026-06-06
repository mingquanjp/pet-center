import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
import * as dashboardRepository from "./dashboard.repository.js";
import type { AdminDashboardActivityLogsQuery, AdminDashboardQuery, DoctorDashboardQuery, StaffDashboardQuery } from "./dashboard.schema.js";
import type { AdminDashboardOverviewDto, DoctorDashboardOverviewDto, StaffDashboardOverviewDto } from "./dashboard.types.js";

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

function assertDoctor(authUser: AuthUser): void {
  if (authUser.role !== "DOCTOR") {
    throw new AppError("Bạn không có quyền xem tổng quan bác sĩ", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function assertAdmin(authUser: AuthUser): void {
  if (authUser.role !== "ADMIN") {
    throw new AppError("Ban khong co quyen xem dashboard quan tri", "FORBIDDEN", httpStatus.FORBIDDEN);
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

  return dashboardRepository.getOwnerDashboard(authUser.userId);
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

  const [fullName, pendingAppointments, pendingGroomingTickets, roomCapacity, todayInvoices, appointmentTasks] =
    await Promise.all([
      dashboardRepository.findUserDisplayName(authUser.userId),
      dashboardRepository.countPendingMedicalAppointments(),
      dashboardRepository.countPendingGroomingTickets(),
      dashboardRepository.getRoomCapacitySnapshot(),
      dashboardRepository.countTodayInvoices(),
      dashboardRepository.findPendingAppointmentTasks(query.taskLimit),
    ]);

  return {
    staff: {
      fullName: fullName ?? authUser.fullName,
      initials: getInitials(fullName ?? authUser.fullName),
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

export async function getDoctorOverview(
  authUser: AuthUser,
  query: DoctorDashboardQuery
): Promise<DoctorDashboardOverviewDto> {
  assertDoctor(authUser);

  const [fullName, stats, assignedExams, recentActivities] = await Promise.all([
    dashboardRepository.findUserDisplayName(authUser.userId),
    dashboardRepository.getDoctorDashboardStats(authUser.userId),
    dashboardRepository.findDoctorAssignedExams(authUser.userId, query.examLimit),
    dashboardRepository.findDoctorRecentActivities(authUser.userId, query.activityLimit),
  ]);

  return {
    doctor: {
      id: authUser.userId,
      fullName: fullName ?? authUser.fullName,
      roleLabel: "Bác sĩ thú y",
    },
    stats,
    assignedExams,
    recentActivities,
  };
}

export async function getAdminOverview(
  authUser: AuthUser,
  query: AdminDashboardQuery
): Promise<AdminDashboardOverviewDto> {
  assertAdmin(authUser);

  const range = normalizeAdminDateRange(query);
  const [statsResult, revenueTrend, serviceRevenue, recentActivities, operationAlerts] = await Promise.all([
    dashboardRepository.getAdminStats(range),
    dashboardRepository.findAdminRevenueTrend(range.endDate),
    dashboardRepository.findAdminServiceRevenue(range),
    dashboardRepository.findAdminRecentActivities({
      startDate: range.startDate,
      endDate: range.endDate,
      limit: 5,
    }),
    dashboardRepository.findAdminOperationAlerts(),
  ]);

  return {
    range: {
      startDate: range.startDate,
      endDate: range.endDate,
    },
    stats: statsResult.stats,
    trends: statsResult.trends,
    revenueTrend,
    serviceRevenue,
    recentActivities,
    operationAlerts,
  };
}

export async function listAdminActivityLogs(authUser: AuthUser, query: AdminDashboardActivityLogsQuery) {
  assertAdmin(authUser);

  const range = normalizeAdminDateRange(query);
  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await dashboardRepository.findAdminActivityLogs({
    startDate: range.startDate,
    endDate: range.endDate,
    limit: paginationInput.limit,
    offset: paginationInput.offset,
  });

  return {
    data: result.activities,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total),
  };
}

function normalizeAdminDateRange(query: AdminDashboardQuery): {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
} {
  const today = new Date();
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDate = parseDateOnly(query.startDate) ?? defaultStartDate;
  const endDate = parseDateOnly(query.endDate) ?? today;
  const normalizedStartDate = startOfDay(startDate);
  const normalizedEndDate = startOfDay(endDate);
  const rangeDays = Math.max(
    1,
    Math.round((normalizedEndDate.getTime() - normalizedStartDate.getTime()) / 86_400_000) + 1
  );
  const previousEndDate = new Date(normalizedStartDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - rangeDays + 1);

  return {
    startDate: formatDateOnly(normalizedStartDate),
    endDate: formatDateOnly(normalizedEndDate),
    previousStartDate: formatDateOnly(previousStartDate),
    previousEndDate: formatDateOnly(previousEndDate),
  };
}

function parseDateOnly(value: string | undefined): Date | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
