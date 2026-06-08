import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/appointments/appointments.repository.js";
import * as transactions from "../../../src/db/transactions.js";
import * as notifications from "../../../src/modules/notifications/notification-events.js";
import {
  confirmStaffAppointment,
  rejectStaffAppointment,
} from "../../../src/modules/appointments/appointments.service.js";

vi.mock("../../../src/modules/appointments/appointments.repository.js");
vi.mock("../../../src/db/transactions.js", () => ({
  withTransaction: vi.fn((cb) => cb({})),
}));
vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentConfirmed: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentRejected: vi.fn().mockResolvedValue(undefined),
  notifyMedicalExamCompleted: vi.fn().mockResolvedValue(undefined),
}));

const mockRepo = vi.mocked(repo);

describe("Staff Appointment Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for getting detail inside service at the end of the operation
    mockRepo.findStaffAppointmentDetailById.mockResolvedValue({
      appointment_id: "appt_mock",
      appointment_status: "confirmed",
      type_code: "general",
      scheduled_at: new Date("2026-06-10T09:00:00Z"),
    } as any);
  });

  const staffUserId = "usr_staff_01";
  const validAppointmentId = "appt_mock";

  describe("confirmStaffAppointment", () => {
    it("UT-APPOINTMENT-STAFF-001 - Xác nhận lịch pending và tự chọn bác sĩ còn trống", async () => {
      mockRepo.findStaffAppointmentDetailByIdForUpdate.mockResolvedValue({
        appointment_id: validAppointmentId,
        appointment_status: "pending",
        scheduled_at: new Date("2026-06-10T09:00:00Z"),
      } as any);

      // Return two available doctors
      mockRepo.findAvailableDoctorsForAppointment.mockResolvedValue([
        { user_id: "doc_1", confirmed_count_in_day: "3" },
        { user_id: "doc_2", confirmed_count_in_day: "1" }, // Least busy
      ] as any);

      mockRepo.lockDoctorForAssignment.mockResolvedValue(true);
      mockRepo.confirmAppointmentWithDoctor.mockResolvedValue(undefined);
      mockRepo.findPendingAppointmentsAssignedToDoctorInRange.mockResolvedValue([]);

      const result = await confirmStaffAppointment(validAppointmentId, staffUserId, {});

      expect(mockRepo.confirmAppointmentWithDoctor).toHaveBeenCalledWith(
        validAppointmentId,
        staffUserId,
        "doc_2",
        undefined,
        expect.anything()
      );
      expect(result.status).toBe("CONFIRMED");
    });

    it("UT-APPOINTMENT-STAFF-002 - Xác nhận lịch pending với bác sĩ chỉ định còn trống", async () => {
      mockRepo.findStaffAppointmentDetailByIdForUpdate.mockResolvedValue({
        appointment_id: validAppointmentId,
        appointment_status: "pending",
        scheduled_at: new Date("2026-06-10T09:00:00Z"),
      } as any);

      mockRepo.findAvailableDoctorsForAppointment.mockResolvedValue([
        { user_id: "doc_1", confirmed_count_in_day: "3" },
        { user_id: "doc_2", confirmed_count_in_day: "1" },
      ] as any);

      mockRepo.lockDoctorForAssignment.mockResolvedValue(true);
      mockRepo.findPendingAppointmentsAssignedToDoctorInRange.mockResolvedValue([]);

      await confirmStaffAppointment(validAppointmentId, staffUserId, { doctorUserId: "doc_1" });

      expect(mockRepo.confirmAppointmentWithDoctor).toHaveBeenCalledWith(
        validAppointmentId,
        staffUserId,
        "doc_1",
        undefined,
        expect.anything()
      );
    });

    it("UT-APPOINTMENT-STAFF-003 - Từ chối xác nhận lịch không tồn tại", async () => {
      mockRepo.findStaffAppointmentDetailByIdForUpdate.mockResolvedValue(null as any);

      const action = confirmStaffAppointment("appt_missing", staffUserId, {});

      await expect(action).rejects.toMatchObject({
        code: "APPOINTMENT_NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND,
      });
    });

    it("UT-APPOINTMENT-STAFF-004 - Từ chối xác nhận lại lịch đã confirmed", async () => {
      mockRepo.findStaffAppointmentDetailByIdForUpdate.mockResolvedValue({
        appointment_id: validAppointmentId,
        appointment_status: "confirmed",
      } as any);

      const action = confirmStaffAppointment(validAppointmentId, staffUserId, {});

      await expect(action).rejects.toMatchObject({
        code: "APPOINTMENT_ALREADY_CONFIRMED",
        statusCode: httpStatus.CONFLICT,
      });
    });

    it("UT-APPOINTMENT-STAFF-005 - Từ chối xác nhận lịch không ở trạng thái pending", async () => {
      mockRepo.findStaffAppointmentDetailByIdForUpdate.mockResolvedValue({
        appointment_id: validAppointmentId,
        appointment_status: "cancelled",
      } as any);

      const action = confirmStaffAppointment(validAppointmentId, staffUserId, {});

      await expect(action).rejects.toMatchObject({
        code: "INVALID_APPOINTMENT_STATUS",
        statusCode: httpStatus.CONFLICT,
      });
    });

    it("UT-APPOINTMENT-STAFF-006 - Từ chối xác nhận khi không có bác sĩ trống", async () => {
      mockRepo.findStaffAppointmentDetailByIdForUpdate.mockResolvedValue({
        appointment_id: validAppointmentId,
        appointment_status: "pending",
        scheduled_at: new Date("2026-06-10T09:00:00Z"),
      } as any);

      // No doctors available
      mockRepo.findAvailableDoctorsForAppointment.mockResolvedValue([]);

      const action = confirmStaffAppointment(validAppointmentId, staffUserId, {});

      await expect(action).rejects.toMatchObject({
        code: "NO_AVAILABLE_DOCTOR",
        statusCode: httpStatus.CONFLICT,
      });
    });
  });

  describe("rejectStaffAppointment", () => {
    it("UT-APPOINTMENT-STAFF-007 - Từ chối lịch pending với lý do hợp lệ", async () => {
      mockRepo.findStaffAppointmentDetailById.mockResolvedValueOnce({
        appointment_id: validAppointmentId,
        appointment_status: "pending",
        scheduled_at: new Date("2026-06-10T09:00:00Z"),
      } as any);

      mockRepo.rejectAppointment.mockResolvedValue(undefined);
      
      // Override the detail fetch at the end of the service function
      mockRepo.findStaffAppointmentDetailById.mockResolvedValueOnce({
        appointment_id: validAppointmentId,
        appointment_status: "rejected",
        type_code: "general",
        scheduled_at: new Date("2026-06-10T09:00:00Z"),
      } as any);

      const body = { rejectionReason: "Khách hủy", internalNote: "Ghi chú" };
      const result = await rejectStaffAppointment(validAppointmentId, staffUserId, body);

      expect(mockRepo.rejectAppointment).toHaveBeenCalledWith(
        validAppointmentId,
        staffUserId,
        body.rejectionReason,
        body.internalNote
      );
      expect(result.status).toBe("REJECTED");
    });

    it("UT-APPOINTMENT-STAFF-008 - Từ chối khi appointment không tồn tại trong luồng reject", async () => {
      mockRepo.findStaffAppointmentDetailById.mockResolvedValue(null as any);

      const action = rejectStaffAppointment("appt_missing", staffUserId, { rejectionReason: "Bận" });

      await expect(action).rejects.toMatchObject({
        code: "APPOINTMENT_NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND,
      });
    });

    it("UT-APPOINTMENT-STAFF-010 - Từ chối lại lịch đã rejected", async () => {
      mockRepo.findStaffAppointmentDetailById.mockResolvedValue({
        appointment_id: validAppointmentId,
        appointment_status: "rejected",
      } as any);

      const action = rejectStaffAppointment(validAppointmentId, staffUserId, { rejectionReason: "Bận" });

      await expect(action).rejects.toMatchObject({
        code: "APPOINTMENT_ALREADY_REJECTED",
        statusCode: httpStatus.CONFLICT,
      });
    });
  });
});
