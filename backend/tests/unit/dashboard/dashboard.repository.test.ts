import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  findUserDisplayName,
  getOwnerDashboard,
  findOwnerActivityLogs,
  countPendingMedicalAppointments
} from "../../../src/modules/dashboard/dashboard.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("dashboard.repository unit tests", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("findUserDisplayName", () => {
    it("UTX-DASHBOARD-155 - findUserDisplayName generates parameterized query and returns full name", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ full_name: "Nguyễn Văn A" }]
      } as any);

      const result = await findUserDisplayName("user_1");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("where user_id = $1"),
        ["user_1"]
      );
      expect(result).toBe("Nguyễn Văn A");
    });

    it("UTX-DASHBOARD-156 - findUserDisplayName handles empty results or database errors correctly", async () => {
      // Empty result
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const result = await findUserDisplayName("user_invalid");
      expect(result).toBeNull();

      // Database error
      mockQuery.mockRejectedValue(new Error("Query failed"));
      await expect(findUserDisplayName("user_1")).rejects.toThrow("Query failed");
    });
  });

  describe("getOwnerDashboard", () => {
    it("UTX-DASHBOARD-157 - getOwnerDashboard generates queries for owner stats and returns data structures", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ full_name: "Nguyễn Văn Owner" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total: "3" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total: "2" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total: "1" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total: "5" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total: "0" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            pet_id: "pet_1",
            pet_name: "Ki",
            species: "Dog",
            breed: "Golden Retriever",
            birth_date: "2020-01-01",
            estimated_age: 3,
            profile_image_url: "https://example.com/ki.jpg"
          }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            appointment_id: "appt_1",
            pet_id: "pet_1",
            pet_name: "Ki",
            type_name: "Khám định kỳ",
            scheduled_at: "2026-06-25T10:00:00Z",
            appointment_status: "confirmed"
          }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            activity_log_id: "act_1",
            pet_id: "pet_1",
            pet_name: "Ki",
            activity_category: "medical",
            activity_type: "checkup",
            activity_status: "completed",
            title: "Khám sức khỏe",
            summary: "Tốt",
            occurred_at: "2026-06-20T10:00:00Z",
            source_type: "medical_exam",
            source_id: "exam_1"
          }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            id: "rem_1",
            pet_id: "pet_1",
            pet_name: "Ki",
            title: "Lịch tái khám",
            due_date: "2026-07-20",
            tone: "due-soon"
          }]
        } as any);

      const result = await getOwnerDashboard("own_1");

      expect(mockQuery).toHaveBeenCalledTimes(10);
      expect(result.ownerName).toBe("Nguyễn Văn Owner");
      expect(result.summary.petCount).toBe(3);
      expect(result.summary.upcomingAppointmentCount).toBe(2);
      expect(result.summary.unpaidInvoiceCount).toBe(1);
      expect(result.summary.unreadNotificationCount).toBe(5);
      expect(result.summary.pendingServiceCount).toBe(0);
      expect(result.pets).toHaveLength(1);
      expect(result.upcomingAppointments).toHaveLength(1);
      expect(result.recentActivities).toHaveLength(1);
      expect(result.healthReminders).toHaveLength(1);
    });

    it("UTX-DASHBOARD-158 - getOwnerDashboard handles query rejection", async () => {
      mockQuery.mockRejectedValue(new Error("Dashboard query failed"));

      await expect(getOwnerDashboard("own_1")).rejects.toThrow("Dashboard query failed");
    });
  });

  describe("findOwnerActivityLogs", () => {
    it("UTX-DASHBOARD-159 - findOwnerActivityLogs generates correct queries for listing and counting", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: "act_1" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total: "15" }]
        } as any);

      const result = await findOwnerActivityLogs("own_1", { page: 2, limit: 5, offset: 5 });

      expect(mockQuery).toHaveBeenCalledTimes(2);
      const [listSql, listParams] = mockQuery.mock.calls[0];
      const [countSql, countParams] = mockQuery.mock.calls[1];

      expect(listSql).toContain("limit");
      expect(listSql).toContain("offset");
      expect(listParams).toEqual(["own_1", 5, 5]);

      expect(countSql).toContain("select count(*)::text as total");
      expect(countParams).toEqual(["own_1"]);

      expect(result.activities).toHaveLength(1);
      expect(result.total).toBe(15);
    });

    it("UTX-DASHBOARD-160 - findOwnerActivityLogs handles database errors gracefully", async () => {
      mockQuery.mockRejectedValue(new Error("Activity query failed"));

      await expect(findOwnerActivityLogs("own_1", { page: 1, limit: 5, offset: 0 })).rejects.toThrow("Activity query failed");
    });
  });

  describe("countPendingMedicalAppointments", () => {
    it("UTX-DASHBOARD-161 - countPendingMedicalAppointments generates parameterized query to count pending appointments", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ total: "4" }]
      } as any);

      const result = await countPendingMedicalAppointments();

      expect(mockQuery).toHaveBeenCalled();
      const [sql] = mockQuery.mock.calls[0];

      expect(sql).toContain("select count(*)::text as total");
      expect(sql).toContain("pet_center.medical_appointments");
      expect(sql).toContain("ma.appointment_status = 'pending'");
      expect(result).toBe(4);
    });

    it("UTX-DASHBOARD-162 - countPendingMedicalAppointments handles errors or empty results gracefully", async () => {
      mockQuery.mockRejectedValue(new Error("Count pending failed"));

      await expect(countPendingMedicalAppointments()).rejects.toThrow("Count pending failed");
    });
  });
});
