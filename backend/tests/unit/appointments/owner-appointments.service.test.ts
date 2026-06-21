import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/appointments/owner/owner-appointments.repository.js";
import {
  createOwnerAppointment,
  getOwnerAppointmentDetail,
  getOwnerAvailableSlots,
  listOwnerAppointments,
  getOwnerAppointmentCreateOptions,
  cancelOwnerAppointment
} from "../../../src/modules/appointments/owner/owner-appointments.service.js";
import * as transactions from "../../../src/db/transactions.js";
import * as idUtils from "../../../src/shared/utils/id.js";
import * as notifications from "../../../src/modules/notifications/notification-events.js";
import * as petActivityLogs from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";

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
  exam_id: "mex_pending",
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
    expect(result.data[0]?.examId).toBe("mex_pending");
  });
});

describe("getOwnerAppointmentCreateOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTX-APPOINTMENTS-012 - getOwnerAppointmentCreateOptions trả đúng chi tiết tài nguyên hợp lệ", async () => {
    mockRepo.listOwnerPetOptions.mockResolvedValue([
      {
        pet_id: "pet_001",
        pet_name: "Buddy",
        species: "Dog",
        breed: null,
        birth_date: null,
        estimated_age: "2",
        weight_kg: "5.5",
        profile_image_url: null
      }
    ]);
    mockRepo.listActiveExamTypes.mockResolvedValue([
      {
        exam_type_id: "exam_general",
        type_code: "general_checkup",
        type_name: "Khám tổng quát",
        description: "Mô tả",
        duration_minutes: 60
      }
    ]);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.listActiveAppointmentIntervals.mockResolvedValue([]);

    const result = await getOwnerAppointmentCreateOptions("usr_owner_01");
    expect(result.pets).toHaveLength(1);
    expect(result.pets[0].name).toBe("Buddy");
    expect(result.examTypes).toHaveLength(1);
    expect(result.examTypes[0].name).toBe("Khám tổng quát");
    expect(result.timeSlots).toBeInstanceOf(Array);
  });

  it("UTX-APPOINTMENTS-013 - getOwnerAppointmentCreateOptions trả lỗi khi truy vấn thất bại", async () => {
    mockRepo.listOwnerPetOptions.mockRejectedValue(new Error("DB Error"));

    await expect(getOwnerAppointmentCreateOptions("usr_owner_01")).rejects.toThrow("DB Error");
  });
});

describe("getOwnerAvailableSlots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.listActiveAppointmentIntervals.mockResolvedValue([]);
  });

  it("returns 30-minute start intervals with service-specific end times", async () => {
    mockRepo.findActiveExamTypeById.mockResolvedValue({
      exam_type_id: "exam_general",
      type_code: "general_checkup",
      type_name: "Khám tổng quát",
      description: null,
      duration_minutes: 45,
    });

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
  });

  it("UTX-APPOINTMENTS-015 - getOwnerAvailableSlots trả lỗi khi loại khám không tồn tại hoặc lỗi query", async () => {
    mockRepo.findActiveExamTypeById.mockResolvedValue(null);

    await expect(getOwnerAvailableSlots("2099-06-16", "exam_invalid")).rejects.toThrowError(
      expect.objectContaining({
        code: "EXAM_TYPE_NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND
      })
    );
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

  it("UTX-APPOINTMENTS-016 - createOwnerAppointment tạo mới thành công với payload hợp lệ", async () => {
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

  it("UTX-APPOINTMENTS-017 - createOwnerAppointment từ chối dependency không tồn tại, trùng dữ liệu hoặc hết capacity", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    
    // Test Case A: overlapping pet appointment
    mockRepo.hasOverlappingPetAppointment.mockResolvedValue(true);
    await expect(createOwnerAppointment(validOwnerUserId, validBody)).rejects.toMatchObject({
      code: "PET_APPOINTMENT_TIME_DUPLICATED",
      statusCode: httpStatus.CONFLICT,
    });

    // Test Case B: full slot
    mockRepo.hasOverlappingPetAppointment.mockResolvedValue(false);
    mockRepo.countActiveDoctors.mockResolvedValue(2);
    mockRepo.listActiveAppointmentIntervals.mockResolvedValue([
      { scheduled_at: scheduledAt, duration_minutes: 60 },
      { scheduled_at: scheduledAt, duration_minutes: 60 },
    ]);
    await expect(createOwnerAppointment(validOwnerUserId, validBody)).rejects.toMatchObject({
      code: "APPOINTMENT_SLOT_UNAVAILABLE",
      statusCode: httpStatus.CONFLICT,
    });
  });

  it("UT-APPOINTMENT-006 - Từ chối khi không có bác sĩ hoạt động", async () => {
    mockRepo.findOwnerPetById.mockResolvedValue({ pet_name: "Buddy", species: "Dog" } as any);
    mockRepo.findActiveExamTypeById.mockResolvedValue({ type_name: "Khám tổng quát" } as any);
    mockRepo.countActiveDoctors.mockResolvedValue(0);

    const action = createOwnerAppointment(validOwnerUserId, validBody);

    await expect(action).rejects.toMatchObject({
      code: "APPOINTMENT_SLOT_UNAVAILABLE",
      statusCode: httpStatus.CONFLICT,
    });
  });
});

describe("cancelOwnerAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTX-APPOINTMENTS-018 - cancelOwnerAppointment cập nhật/chuyển trạng thái thành công", async () => {
    mockRepo.findOwnerAppointmentDetailForUpdate.mockResolvedValue({
      appointment_id: "appt_123",
      pet_id: "pet_001",
      pet_name: "Buddy",
      type_name: "Khám tổng quát",
      type_code: "general_checkup",
      scheduled_at: "2099-06-20T08:00:00.000Z",
      appointment_status: "pending",
      examination_status: "waiting"
    } as any);

    mockRepo.cancelOwnerAppointment.mockResolvedValue(undefined);
    mockRepo.findOwnerAppointmentDetail.mockResolvedValue({
      appointment_id: "appt_123",
      pet_id: "pet_001",
      pet_name: "Buddy",
      species: "Dog",
      breed: null,
      profile_image_url: null,
      exam_type_id: "exam_general",
      type_code: "general_checkup",
      type_name: "Khám tổng quát",
      scheduled_at: new Date("2099-06-20T08:00:00.000Z"),
      appointment_status: "cancelled",
      examination_status: "waiting",
      symptom_description: "Bỏ ăn",
      exam_id: "mex_pending",
      owner_user_id: "usr_owner_01",
      internal_note: null,
      rejection_reason: null,
      birth_date: null,
      estimated_age: null,
      gender: null,
      owner_full_name: "Nguyễn Văn A",
      owner_phone_number: null,
      owner_email: null,
    } as any);

    const result = await cancelOwnerAppointment("usr_owner_01", "appt_123", {});
    expect(mockRepo.cancelOwnerAppointment).toHaveBeenCalledWith("appt_123", "usr_owner_01", expect.anything());
    expect(vi.mocked(petActivityLogs.upsertPetActivityLog)).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: "appointment_cancelled",
        activityStatus: "cancelled"
      }),
      expect.anything()
    );
    expect(result.status).toBe("CANCELLED");
  });

  it("UTX-APPOINTMENTS-019 - cancelOwnerAppointment từ chối record không tồn tại hoặc state transition không hợp lệ", async () => {
    // Case 1: not found
    mockRepo.findOwnerAppointmentDetailForUpdate.mockResolvedValue(null);
    await expect(cancelOwnerAppointment("usr_owner_01", "appt_invalid", {})).rejects.toThrowError(
      expect.objectContaining({
        code: "APPOINTMENT_NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND
      })
    );

    // Case 2: status is not pending or confirmed (e.g. already cancelled)
    mockRepo.findOwnerAppointmentDetailForUpdate.mockResolvedValue({
      appointment_id: "appt_123",
      appointment_status: "cancelled",
      examination_status: "waiting"
    } as any);
    await expect(cancelOwnerAppointment("usr_owner_01", "appt_123", {})).rejects.toThrowError(
      expect.objectContaining({
        code: "INVALID_APPOINTMENT_STATUS",
        statusCode: httpStatus.CONFLICT
      })
    );
  });
});
