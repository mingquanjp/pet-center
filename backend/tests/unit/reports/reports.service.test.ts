import { beforeEach, describe, expect, it, vi } from "vitest";
import { reportsService } from "../../../src/modules/reports/reports.service.js";
import { reportsRepository } from "../../../src/modules/reports/reports.repository.js";

vi.mock("../../../src/modules/reports/reports.repository.js", () => ({
  reportsRepository: {
    getPaidRevenueSummary: vi.fn(),
    getRevenueTrend: vi.fn(),
    getRevenueSourceBreakdown: vi.fn(),
    getGroomingSummary: vi.fn(),
    getGroomingStatusCounts: vi.fn(),
    getTopGroomingServices: vi.fn(),
    getBoardingSummary: vi.fn(),
    getBoardingStatusCounts: vi.fn(),
    getBoardingRoomOccupancy: vi.fn(),
    getMedicalSummary: vi.fn(),
    getAppointmentStatusCounts: vi.fn(),
    getExamTypeCounts: vi.fn(),
    getDoctorPerformance: vi.fn(),
    getCustomerPetSummary: vi.fn(),
    getUserRoleCounts: vi.fn(),
    getPetSpeciesCounts: vi.fn(),
    getAccountStatusCounts: vi.fn(),
  }
}));

const mockRepo = vi.mocked(reportsRepository);

describe("reports.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminReports", () => {
    it("UTX-REPORTS-436 - getAdminReports fetches data and calculates trends correctly", async () => {
      // Mock current period data
      mockRepo.getPaidRevenueSummary.mockResolvedValueOnce({ current_paid_revenue: "5000000", current_successful_transactions: "10" });
      mockRepo.getRevenueTrend.mockResolvedValueOnce([{ date_bucket: "2026-06-21T00:00:00.000Z", revenue: "5000000" }]);
      mockRepo.getRevenueSourceBreakdown.mockResolvedValueOnce([{ source_type: "grooming", invoice_count: 5, revenue: "2000000" }]);
      mockRepo.getGroomingSummary.mockResolvedValueOnce({ total_bookings: "10", completed_count: "8" });
      mockRepo.getGroomingStatusCounts.mockResolvedValueOnce([{ status: "completed", count: "8" }]);
      mockRepo.getTopGroomingServices.mockResolvedValueOnce([{ service_id: "s1", service_name: "Spa", booking_count: "5", completed_count: "4", cancelled_count: "1", revenue: "1000000" }]);
      mockRepo.getBoardingSummary.mockResolvedValueOnce({ total_stays: "5", avg_duration: "3" });
      mockRepo.getBoardingStatusCounts.mockResolvedValueOnce([{ status: "checked_out", count: "5" }]);
      mockRepo.getBoardingRoomOccupancy.mockResolvedValueOnce([{ room_type_id: "rt1", room_type_name: "Deluxe", capacity: "10", current_occupancy: "4", booking_count: "5", revenue: "1000000" }]);
      mockRepo.getMedicalSummary.mockResolvedValueOnce({ total_appointments: "15", total_exams: "12", total_prescriptions: "10" });
      mockRepo.getAppointmentStatusCounts.mockResolvedValueOnce([{ status: "confirmed", count: "15" }]);
      mockRepo.getExamTypeCounts.mockResolvedValueOnce([{ label: "Checkup", count: "12" }]);
      mockRepo.getDoctorPerformance.mockResolvedValueOnce([{ doctor_id: "doc1", doctor_name: "Dr. Smith", assigned_appointments: "15", medical_exam_count: "12", prescription_count: "10" }]);
      mockRepo.getCustomerPetSummary.mockResolvedValueOnce({ new_owners: "3", active_accounts: "20", total_pets: "25" });
      mockRepo.getUserRoleCounts.mockResolvedValueOnce([{ status: "Owner", count: "20" }]);
      mockRepo.getPetSpeciesCounts.mockResolvedValueOnce([{ status: "Dog", count: "15" }]);
      mockRepo.getAccountStatusCounts.mockResolvedValueOnce([{ status: "active", count: "20" }]);

      // Mock previous period data (when comparison is NONE, they won't be called, or can be null)
      const query = {
        timeRange: "CUSTOM" as const,
        fromDate: "2026-06-20",
        toDate: "2026-06-21",
        compareMode: "NONE" as const,
        groupBy: "DAY" as const,
        paymentMethodGroup: "ALL" as const
      };

      const result = await reportsService.getAdminReports(query);

      expect(mockRepo.getPaidRevenueSummary).toHaveBeenCalledTimes(1);
      expect(result.filters).toEqual(query);
      expect(result.revenue.metrics).toBeDefined();
      expect(result.revenue.metrics[0].rawValue).toBe(5000000);
      expect(result.services.metrics[0].rawValue).toBe(10);
      expect(result.boarding.metrics[0].rawValue).toBe(5);
      expect(result.medical.metrics[0].rawValue).toBe(15);
      expect(result.customers.metrics[0].rawValue).toBe(3);
    });
  });
});
