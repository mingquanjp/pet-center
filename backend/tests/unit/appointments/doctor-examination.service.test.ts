import { beforeEach, describe, expect, it, vi } from "vitest";
import * as transactions from "../../../src/db/transactions.js";
import * as repo from "../../../src/modules/appointments/appointments.repository.js";
import { completeDoctorExamination } from "../../../src/modules/appointments/appointments.service.js";
import * as notifications from "../../../src/modules/notifications/notification-events.js";
import * as idUtils from "../../../src/shared/utils/id.js";

vi.mock("../../../src/modules/appointments/appointments.repository.js");
vi.mock("../../../src/db/transactions.js", () => ({
  withTransaction: vi.fn((cb) => cb({ query: vi.fn() })),
}));
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("mex_mock"),
}));
vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyMedicalExamCompleted: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentConfirmed: vi.fn().mockResolvedValue(undefined),
  notifyAppointmentRejected: vi.fn().mockResolvedValue(undefined),
}));

const mockRepo = vi.mocked(repo);
const mockTransactions = vi.mocked(transactions);
const mockIdUtils = vi.mocked(idUtils);
const mockNotifications = vi.mocked(notifications);

describe("completeDoctorExamination", () => {
  const doctorUserId = "doc_001";
  const appointmentId = "appt_001";
  const baseRow = {
    appointment_id: appointmentId,
    exam_id: "mex_001",
    exam_type_id: "et_general",
    pet_id: "pet_001",
  };
  const detailRow = {
    id: appointmentId,
    exam_id: "mex_001",
    pet_id: "pet_001",
    pet_name: "Lucky",
    species: "Dog",
    breed: "Poodle",
    birth_date: null,
    estimated_age: "2",
    profile_image_url: null,
    owner_id: "own_001",
    owner_name: "Nguyen Van A",
    owner_phone: "0900000000",
    owner_email: "owner@example.com",
    exam_type_id: "et_general",
    type_code: "general_checkup",
    type_name: "General checkup",
    scheduled_at: new Date("2026-06-08T08:00:00.000Z"),
    symptom_description: "Poor appetite",
    internal_note: null,
    doctor_id: doctorUserId,
    doctor_name: "Doctor 001",
    examination_status: "completed",
    gender: "male",
    weight_kg: "5.5",
    diagnosis: "Mild dermatitis",
    conclusion: "Monitor",
    health_note: null,
    exam_status: "result_recorded",
    exam_date: "2026-06-08",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactions.withTransaction.mockImplementation(async (cb: any) => cb({ query: vi.fn() }));
    mockRepo.findDoctorExaminationForUpdate.mockResolvedValue(baseRow as any);
    mockRepo.completeMedicalExam.mockResolvedValue(undefined as any);
    mockRepo.replaceMedicalExamFieldValues.mockResolvedValue(undefined as any);
    mockRepo.replacePrescription.mockResolvedValue(undefined as any);
    mockRepo.replaceVaccination.mockResolvedValue(undefined as any);
    mockRepo.replaceFollowUpInstruction.mockResolvedValue(false as any);
    mockRepo.updateAppointmentExaminationStatus.mockResolvedValue(undefined as any);
    mockRepo.createMedicalExamForAppointment.mockResolvedValue(undefined as any);
    mockRepo.findDoctorExaminationDetail.mockResolvedValue(detailRow as any);
    mockRepo.ensureStandardExamFieldDefinitions.mockResolvedValue(undefined as any);
    mockRepo.getDoctorExaminationFieldDefinitions.mockResolvedValue([] as any);
    mockRepo.getDoctorExaminationFieldValues.mockResolvedValue([] as any);
    mockRepo.getDoctorExaminationHistory.mockResolvedValue([] as any);
    mockRepo.getActiveMedicineOptions.mockResolvedValue([] as any);
    mockRepo.getPrescriptionByExamId.mockResolvedValue(null as any);
    mockRepo.getVaccinationByExamId.mockResolvedValue(null as any);
    mockRepo.getFollowUpByExamId.mockResolvedValue(null as any);
    mockRepo.getRecheckContext.mockResolvedValue(null as any);
  });

  it("UT-EXAM-001 - completes examination with diagnosis and conclusion", async () => {
    await completeDoctorExamination(doctorUserId, appointmentId, {
      diagnosis: "Mild dermatitis",
      conclusion: "Monitor 3 days",
      healthNote: "Avoid bathing",
    });

    expect(mockRepo.completeMedicalExam).toHaveBeenCalledWith(
      "mex_001",
      "Mild dermatitis",
      "Monitor 3 days",
      "Avoid bathing",
      "result_recorded",
      expect.anything()
    );
    expect(mockRepo.updateAppointmentExaminationStatus).toHaveBeenCalledWith(
      appointmentId,
      "completed",
      expect.anything()
    );
    expect(mockNotifications.notifyMedicalExamCompleted).toHaveBeenCalledWith("mex_001");
  });

  it("UT-EXAM-002 - completes examination with prescription items", async () => {
    await completeDoctorExamination(doctorUserId, appointmentId, {
      diagnosis: "Mild dermatitis",
      conclusion: "Prescribe medicine",
      prescriptionItems: [
        {
          medicineId: "med_001",
          dosage: "1 tablet",
          frequency: "2 times/day",
          duration: "5 days",
          usageInstruction: "After meal",
        },
      ],
    });

    expect(mockRepo.replacePrescription).toHaveBeenCalledWith(
      "mex_001",
      expect.arrayContaining([expect.objectContaining({ medicineId: "med_001" })]),
      expect.anything()
    );
    expect(mockRepo.completeMedicalExam).toHaveBeenCalledWith(
      "mex_001",
      "Mild dermatitis",
      "Prescribe medicine",
      undefined,
      "prescribed",
      expect.anything()
    );
    expect(mockRepo.updateAppointmentExaminationStatus).toHaveBeenCalledWith(
      appointmentId,
      "completed",
      expect.anything()
    );
  });

  it("UT-EXAM-003 - completes examination with follow-up instruction", async () => {
    await completeDoctorExamination(doctorUserId, appointmentId, {
      diagnosis: "Mild dermatitis",
      conclusion: "Follow-up required",
      followUp: {
        followUpDate: "2026-07-01",
        reason: "Recheck",
      },
    });

    expect(mockRepo.replaceFollowUpInstruction).toHaveBeenCalledWith(
      "mex_001",
      expect.objectContaining({ followUpDate: "2026-07-01", reason: "Recheck" }),
      expect.anything()
    );
    expect(mockRepo.completeMedicalExam).toHaveBeenCalledWith(
      "mex_001",
      "Mild dermatitis",
      "Follow-up required",
      undefined,
      "follow_up_required",
      expect.anything()
    );
    expect(mockRepo.updateAppointmentExaminationStatus).toHaveBeenCalledWith(
      appointmentId,
      "follow_up",
      expect.anything()
    );
  });

  it("UT-EXAM-004 - rejects when examination is not found", async () => {
    mockRepo.findDoctorExaminationForUpdate.mockResolvedValue(null as any);

    await expect(
      completeDoctorExamination(doctorUserId, "appt_missing", {
        diagnosis: "Mild condition",
        conclusion: "Monitor",
      })
    ).rejects.toMatchObject({
      code: "EXAMINATION_NOT_FOUND",
      statusCode: 404,
    });

    expect(mockRepo.completeMedicalExam).not.toHaveBeenCalled();
    expect(mockRepo.updateAppointmentExaminationStatus).not.toHaveBeenCalled();
    expect(mockIdUtils.createId).not.toHaveBeenCalled();
  });
});
