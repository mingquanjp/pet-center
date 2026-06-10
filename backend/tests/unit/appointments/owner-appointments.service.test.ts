import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/appointments/owner/owner-appointments.repository.js";
import { createOwnerAppointment } from "../../../src/modules/appointments/owner/owner-appointments.service.js";
import * as transactions from "../../../src/db/transactions.js";
import * as idUtils from "../../../src/shared/utils/id.js";
import * as notifications from "../../../src/modules/notifications/notification-events.js";

vi.mock("../../../src/modules/appointments/owner/owner-appointments.repository.js");
vi.mock("../../../src/db/transactions.js", () => ({
  withTransaction: vi.fn((cb) => cb({})),
}));
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("appt_mock"),
}));
vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentCreated: vi.fn().mockResolvedValue(undefined),
}));

const mockRepo = vi.mocked(repo);

describe("createOwnerAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validOwnerUserId = "usr_owner_01";
  const validBody = {
    petId: "pet_001",
    examTypeId: "exam_general",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day in the future
    symptomDescription: "Bỏ ăn 2 ngày",
  };

  it("UT-APPOINTMENT-001 - Tạo lịch khám thành công với dữ liệu hợp lệ và slot còn chỗ", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.countBookedAppointmentsAt.mockResolvedValue(0);
    mockRepo.countPetAppointmentsAt.mockResolvedValue(0);
    mockRepo.insertOwnerAppointment.mockResolvedValue(undefined);

    const result = await createOwnerAppointment(validOwnerUserId, validBody);

    expect(result).toMatchObject({
      id: "appt_mock",
      appointmentCode: "LH-MOCK",
      status: "PENDING",
    });
    expect(mockRepo.insertOwnerAppointment).toHaveBeenCalled();
  });

  it("UT-APPOINTMENT-002 - Từ chối đặt lịch sát giờ khám <= 30 phút", async () => {
    const action = createOwnerAppointment(validOwnerUserId, {
      ...validBody,
      scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // exactly 30 minutes
    });

    await expect(action).rejects.toMatchObject({
      code: "APPOINTMENT_TIME_TOO_SOON",
      statusCode: httpStatus.BAD_REQUEST,
    });
  });

  it("UT-APPOINTMENT-003 - Từ chối khi pet không tồn tại hoặc không thuộc owner", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue(null as any);

    const action = createOwnerAppointment(validOwnerUserId, { ...validBody, petId: "pet_missing" });

    await expect(action).rejects.toMatchObject({
      code: "PET_NOT_FOUND",
      statusCode: httpStatus.NOT_FOUND,
    });
  });

  it("UT-APPOINTMENT-004 - Từ chối khi loại khám không tồn tại hoặc inactive", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue(null as any);

    const action = createOwnerAppointment(validOwnerUserId, { ...validBody, examTypeId: "exam_inactive" });

    await expect(action).rejects.toMatchObject({
      code: "EXAM_TYPE_NOT_FOUND",
      statusCode: httpStatus.NOT_FOUND,
    });
  });

  it("UT-APPOINTMENT-005 - Từ chối khi thú cưng đã có lịch cùng khung giờ", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.countBookedAppointmentsAt.mockResolvedValue(0);
    mockRepo.countPetAppointmentsAt.mockResolvedValue(1); // duplicate

    const action = createOwnerAppointment(validOwnerUserId, validBody);

    await expect(action).rejects.toMatchObject({
      code: "PET_APPOINTMENT_TIME_DUPLICATED",
      statusCode: httpStatus.CONFLICT,
    });
  });

  it("UT-APPOINTMENT-006 - Từ chối khi không có bác sĩ hoạt động", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countPetAppointmentsAt.mockResolvedValue(0);
    mockRepo.countActiveDoctors.mockResolvedValue(0); // 0 doctors
    mockRepo.countBookedAppointmentsAt.mockResolvedValue(0);

    const action = createOwnerAppointment(validOwnerUserId, validBody);

    await expect(action).rejects.toMatchObject({
      code: "APPOINTMENT_SLOT_UNAVAILABLE",
      statusCode: httpStatus.CONFLICT,
    });
  });

  it("UT-APPOINTMENT-007 - Từ chối khi slot đã đầy", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countPetAppointmentsAt.mockResolvedValue(0);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.countBookedAppointmentsAt.mockResolvedValue(2); // fully booked

    const action = createOwnerAppointment(validOwnerUserId, validBody);

    await expect(action).rejects.toMatchObject({
      code: "APPOINTMENT_SLOT_UNAVAILABLE",
      statusCode: httpStatus.CONFLICT,
    });
  });
});
