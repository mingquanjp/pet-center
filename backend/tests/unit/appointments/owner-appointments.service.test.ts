import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/appointments/owner/owner-appointments.repository.js";
import {
  createOwnerAppointment,
  getOwnerAppointmentDetail,
  getOwnerAvailableSlots,
  listOwnerAppointments,
} from "../../../src/modules/appointments/owner/owner-appointments.service.js";
import * as transactions from "../../../src/db/transactions.js";
import * as idUtils from "../../../src/shared/utils/id.js";
import * as notifications from "../../../src/modules/notifications/notification-events.js";

vi.mock("../../../src/modules/appointments/owner/owner-appointments.repository.js");
vi.mock("../../../src/db/transactions.js", () => ({
  withTransaction: vi.fn((cb) => cb({})),
}));
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn((prefix: string) => Promise.resolve(`${prefix}_mock`)),
}));
vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyAppointmentCreated: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js", () => ({
  upsertPetActivityLog: vi.fn().mockResolvedValue("elog_mock"),
}));

const mockRepo = vi.mocked(repo);

const ownerAppointmentRow = {
  appointment_id: "appt_pending",
  pet_id: "pet_001",
  pet_name: "Buddy",
  species: "Dog",
  breed: null,
  profile_image_url: null,
  exam_type_id: "exam_general",
  type_code: "general_checkup",
  type_name: "Khám tổng quát",
  scheduled_at: new Date("2099-06-20T07:30:00.000Z"),
  appointment_status: "pending",
  examination_status: "waiting",
  symptom_description: "Bỏ ăn",
};

describe("owner appointment status mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps a waiting examination appointment pending in the owner list", async () => {
    mockRepo.listOwnerAppointments.mockResolvedValue([ownerAppointmentRow]);
    mockRepo.countOwnerAppointments.mockResolvedValue(1);

    const result = await listOwnerAppointments("usr_owner_01", { page: 1, limit: 6 });

    expect(result.data[0]?.status).toBe("PENDING");
  });

  it("keeps confirmation and completion upcoming in pending appointment detail", async () => {
    mockRepo.findOwnerAppointmentDetail.mockResolvedValue({
      ...ownerAppointmentRow,
      owner_user_id: "usr_owner_01",
      internal_note: null,
      rejection_reason: null,
      birth_date: null,
      estimated_age: null,
      gender: null,
      owner_full_name: "Nguyễn Văn A",
      owner_phone_number: null,
      owner_email: null,
    });

    const result = await getOwnerAppointmentDetail("usr_owner_01", "appt_pending");

    expect(result.status).toBe("PENDING");
    expect(result.timeline.find((item) => item.key === "waiting_confirmation")?.status).toBe("CURRENT");
    expect(result.timeline.find((item) => item.key === "confirmed")?.status).toBe("UPCOMING");
    expect(result.timeline.find((item) => item.key === "completed")?.status).toBe("UPCOMING");
  });

  it("marks an appointment completed only from its examination lifecycle", async () => {
    mockRepo.listOwnerAppointments.mockResolvedValue([{
      ...ownerAppointmentRow,
      appointment_status: "confirmed",
      examination_status: "completed",
    }]);
    mockRepo.countOwnerAppointments.mockResolvedValue(1);

    const result = await listOwnerAppointments("usr_owner_01", { page: 1, limit: 6 });

    expect(result.data[0]?.status).toBe("COMPLETED");
  });
});

describe("createOwnerAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.lockMedicalAppointmentsForScheduling.mockResolvedValue(undefined);
    mockRepo.listActiveAppointmentIntervals.mockResolvedValue([]);
    mockRepo.hasOverlappingPetAppointment.mockResolvedValue(false);
  });

  const validOwnerUserId = "usr_owner_01";
  const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  scheduledAt.setUTCHours(3, 0, 0, 0);
  const validBody = {
    petId: "pet_001",
    examTypeId: "exam_general",
    scheduledAt: scheduledAt.toISOString(),
    symptomDescription: "Bỏ ăn 2 ngày",
  };

  it("UT-APPOINTMENT-001 - Tạo lịch khám thành công với dữ liệu hợp lệ và slot còn chỗ", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.insertOwnerAppointment.mockResolvedValue(undefined);

    const result = await createOwnerAppointment(validOwnerUserId, validBody);

    expect(result).toMatchObject({
      id: "appt_mock",
      appointmentCode: "appt_mock",
      status: "PENDING",
    });
    expect(mockRepo.insertOwnerAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ durationMinutes: 60 }),
      expect.anything(),
    );
    expect(mockRepo.insertOwnerMedicalExam).toHaveBeenCalledWith("mex_mock", "appt_mock", expect.anything());
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
    mockRepo.hasOverlappingPetAppointment.mockResolvedValue(true);

    const action = createOwnerAppointment(validOwnerUserId, validBody);

    await expect(action).rejects.toMatchObject({
      code: "PET_APPOINTMENT_TIME_DUPLICATED",
      statusCode: httpStatus.CONFLICT,
    });
  });

  it("UT-APPOINTMENT-006 - Từ chối khi không có bác sĩ hoạt động", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countActiveDoctors.mockResolvedValue(0); // 0 doctors

    const action = createOwnerAppointment(validOwnerUserId, validBody);

    await expect(action).rejects.toMatchObject({
      code: "APPOINTMENT_SLOT_UNAVAILABLE",
      statusCode: httpStatus.CONFLICT,
    });
  });

  it("UT-APPOINTMENT-007 - Từ chối khi slot đã đầy", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.listActiveAppointmentIntervals.mockResolvedValue([
      { scheduled_at: scheduledAt, duration_minutes: 60 },
      { scheduled_at: scheduledAt, duration_minutes: 60 },
    ]);

    const action = createOwnerAppointment(validOwnerUserId, validBody);

    await expect(action).rejects.toMatchObject({
      code: "APPOINTMENT_SLOT_UNAVAILABLE",
      statusCode: httpStatus.CONFLICT,
    });
  });
});

describe("getOwnerAvailableSlots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.findActiveExamTypeById.mockResolvedValue({
      exam_type_id: "exam_general",
      type_code: "general_checkup",
      type_name: "Khám tổng quát",
      description: null,
      duration_minutes: 45,
    });
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.listActiveAppointmentIntervals.mockResolvedValue([]);
  });

  it("returns 30-minute start intervals with service-specific end times", async () => {
    const slots = await getOwnerAvailableSlots("2099-06-16", "exam_general");

    expect(slots).toHaveLength(17);
    expect(slots[0]).toMatchObject({
      value: "08:00",
      label: "08:00 - 08:45",
      durationMinutes: 45,
      disabled: false,
    });
    expect(slots[1]).toMatchObject({
      value: "08:30",
      label: "08:30 - 09:15",
    });
    expect(slots.at(-1)).toMatchObject({
      value: "16:00",
      label: "16:00 - 16:45",
      disabled: false,
    });
    expect(slots.some((slot) => slot.disabledReason === "outside_working_hours")).toBe(false);
  });
});
