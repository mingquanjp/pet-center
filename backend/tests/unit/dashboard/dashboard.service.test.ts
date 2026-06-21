import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/dashboard/dashboard.repository.js";
import {
  getOwnerDashboard,
  listOwnerActivityLogs,
  getStaffOverview,
  getDoctorOverview,
  getAdminOverview,
  listAdminActivityLogs
} from "../../../src/modules/dashboard/dashboard.service.js";

vi.mock("../../../src/modules/dashboard/dashboard.repository.js");

const mockRepo = vi.mocked(repo);

describe("dashboard.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOwnerDashboard", () => {
    it("UTX-DASHBOARD-137 - getOwnerDashboard returns dashboard overview for valid owner role", async () => {
      const mockOverview = {
        pets: [],
        upcomingAppointments: [],
        recentActivities: [],
        reminders: []
      };
      mockRepo.getOwnerDashboard.mockResolvedValue(mockOverview);

      const authUser = { userId: "own_1", role: "OWNER", fullName: "Nguyễn Văn Owner" };
      const result = await getOwnerDashboard(authUser);

      expect(result).toEqual(mockOverview);
      expect(mockRepo.getOwnerDashboard).toHaveBeenCalledWith("own_1");
    });

    it("UTX-DASHBOARD-138 - getOwnerDashboard throws Forbidden AppError if role is not OWNER", async () => {
      const authUser = { userId: "stf_1", role: "STAFF", fullName: "Nguyễn Văn Staff" };
      await expect(getOwnerDashboard(authUser)).rejects.toThrowError(
        expect.objectContaining({
          code: "FORBIDDEN",
          statusCode: httpStatus.FORBIDDEN
        })
      );
    });
  });

  describe("listOwnerActivityLogs", () => {
    it("UTX-DASHBOARD-139 - listOwnerActivityLogs returns paginated activity logs for owner", async () => {
      const mockActivities = [
        { activity_log_id: "act_1", title: "Khám bệnh", summary: "Sức khỏe ổn định" }
      ];
      mockRepo.findOwnerActivityLogs.mockResolvedValue({
        activities: mockActivities,
        total: 10
      });

      const authUser = { userId: "own_1", role: "OWNER", fullName: "Nguyễn Văn Owner" };
      const result = await listOwnerActivityLogs(authUser, { page: 1, limit: 5 });

      expect(result.data).toEqual(mockActivities);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 10,
        totalPages: 2
      });
    });
  });

  describe("getStaffOverview", () => {
    it("UTX-DASHBOARD-140 - getStaffOverview returns overview metrics for staff/admin user", async () => {
      mockRepo.findUserDisplayName.mockResolvedValue("Nguyễn Văn Staff");
      mockRepo.countPendingMedicalAppointments.mockResolvedValue(5);
      mockRepo.countPendingGroomingTickets.mockResolvedValue(3);
      mockRepo.getRoomCapacitySnapshot.mockResolvedValue({ availableRooms: 10, totalRooms: 20 });
      mockRepo.countTodayInvoices.mockResolvedValue(2);
      mockRepo.findPendingAppointmentTasks.mockResolvedValue([]);

      const authUser = { userId: "stf_1", role: "STAFF", fullName: "Nguyễn Văn Staff" };
      const result = await getStaffOverview(authUser, { taskLimit: 5 });

      expect(result.staff).toEqual({
        fullName: "Nguyễn Văn Staff",
        initials: "VS",
        roleLabel: "Nhân viên"
      });
      expect(result.stats.pendingAppointments).toBe(5);
      expect(result.stats.availableRooms).toBe(10);
    });

    it("UTX-DASHBOARD-141 - getStaffOverview throws Forbidden AppError if role is not STAFF or ADMIN", async () => {
      const authUser = { userId: "own_1", role: "OWNER", fullName: "Nguyễn Văn Owner" };
      await expect(getStaffOverview(authUser, {})).rejects.toThrowError(
        expect.objectContaining({
          code: "FORBIDDEN",
          statusCode: httpStatus.FORBIDDEN
        })
      );
    });
  });

  describe("getDoctorOverview", () => {
    it("UTX-DASHBOARD-142 - getDoctorOverview returns dashboard details for doctors", async () => {
      mockRepo.findUserDisplayName.mockResolvedValue("Bác sĩ A");
      mockRepo.getDoctorDashboardStats.mockResolvedValue({ activeExams: 3, completedToday: 2 } as any);
      mockRepo.findDoctorAssignedExams.mockResolvedValue([]);
      mockRepo.findDoctorRecentActivities.mockResolvedValue([]);

      const authUser = { userId: "doc_1", role: "DOCTOR", fullName: "Bác sĩ A" };
      const result = await getDoctorOverview(authUser, { examLimit: 5, activityLimit: 5 });

      expect(result.doctor.fullName).toBe("Bác sĩ A");
      expect(result.stats.activeExams).toBe(3);
    });

    it("UTX-DASHBOARD-143 - getDoctorOverview throws Forbidden AppError if user role is not DOCTOR", async () => {
      const authUser = { userId: "stf_1", role: "STAFF", fullName: "Nguyễn Văn Staff" };
      await expect(getDoctorOverview(authUser, {})).rejects.toThrowError(
        expect.objectContaining({
          code: "FORBIDDEN",
          statusCode: httpStatus.FORBIDDEN
        })
      );
    });
  });

  describe("getAdminOverview", () => {
    it("UTX-DASHBOARD-144 - getAdminOverview returns system statistics for admin user", async () => {
      mockRepo.getAdminStats.mockResolvedValue({ stats: {}, trends: {} } as any);
      mockRepo.findAdminRevenueTrend.mockResolvedValue([]);
      mockRepo.findAdminServiceRevenue.mockResolvedValue([]);
      mockRepo.findAdminRecentActivities.mockResolvedValue([]);
      mockRepo.findAdminOperationAlerts.mockResolvedValue([]);

      const authUser = { userId: "adm_1", role: "ADMIN", fullName: "Admin System" };
      const result = await getAdminOverview(authUser, { startDate: "2026-06-01", endDate: "2026-06-20" });

      expect(result.range.startDate).toBe("2026-06-01");
      expect(result.range.endDate).toBe("2026-06-20");
    });

    it("UTX-DASHBOARD-145 - getAdminOverview throws Forbidden AppError if role is not ADMIN", async () => {
      const authUser = { userId: "stf_1", role: "STAFF", fullName: "Nguyễn Văn Staff" };
      await expect(getAdminOverview(authUser, {})).rejects.toThrowError(
        expect.objectContaining({
          code: "FORBIDDEN",
          statusCode: httpStatus.FORBIDDEN
        })
      );
    });
  });

  describe("listAdminActivityLogs", () => {
    it("UTX-DASHBOARD-146 - listAdminActivityLogs returns paginated system activity logs for admins", async () => {
      mockRepo.findAdminActivityLogs.mockResolvedValue({ activities: [], total: 50 });

      const authUser = { userId: "adm_1", role: "ADMIN", fullName: "Admin System" };
      const result = await listAdminActivityLogs(authUser, {
        startDate: "2026-06-01",
        endDate: "2026-06-20",
        page: 1,
        limit: 10
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      });
    });
  });
});
