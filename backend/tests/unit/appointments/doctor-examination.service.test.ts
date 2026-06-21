import { beforeEach, describe, expect, it, vi } from "vitest";
import * as transactions from "../../../src/db/transactions.js";
import * as repo from "../../../src/modules/appointments/doctor/doctor-examination.repository.js";
import {
  listDoctorExaminations,
  getDoctorExaminationDetail,
  startDoctorExamination,
  saveDraftDoctorExamination,
  completeDoctorExamination
} from "../../../src/modules/appointments/doctor/doctor-examination.service.js";
import * as notifications from "../../../src/modules/notifications/notification-events.js";
import * as idUtils from "../../../src/shared/utils/id.js";
import * as petActivityLogs from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";

vi.mock("../../../src/modules/appointments/doctor/doctor-examination.repository.js");
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
vi.mock("../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js", () => ({
  upsertPetActivityLog: vi.fn().mockResolvedValue("elog_mock"),
}));

const mockRepo = vi.mocked(repo);
const mockTransactions = vi.mocked(transactions);
const mockIdUtils = vi.mocked(idUtils);
const mockNotifications = vi.mocked(notifications);

describe("doctor-examination.service unit tests", () => {
  const doctorUserId = "doc_001";
  const appointmentId = "appt_001";
  
  const baseRow = {
    appointment_id: appointmentId,
    exam_id: "mex_001",
    exam_type_id: "et_general",
    pet_id: "pet_001",
    pet_name: "Lucky",
    owner_id: "own_001",
    type_name: "General checkup",
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
    mockRepo.processExaminationBilling.mockResolvedValue(undefined as any);
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

  describe("listDoctorExaminations", () => {
    it("UTX-APPOINTMENTS-001 - listDoctorExaminations trả danh sách đúng filter, sort và phân trang", async () => {
      mockRepo.getDoctorExaminationsList.mockResolvedValue([
        {
          id: appointmentId,
          exam_id: "mex_001",
          pet_id: "pet_001",
          pet_name: "Lucky",
          species: "Dog",
          breed: "Poodle",
          birth_date: null,
          estimated_age: "2",
          owner_id: "own_001",
          owner_name: "Nguyen Van A",
          owner_phone: "0900000000",
          owner_email: "owner@example.com",
          exam_type_id: "et_general",
          type_code: "general_checkup",
          type_name: "General checkup",
          scheduled_at: "2026-06-08T08:00:00.000Z",
          examination_status: "completed",
          symptom_description: "Poor appetite",
          internal_note: null,
        }
      ] as any);
      mockRepo.getDoctorExaminationsCount.mockResolvedValue(1);
      mockRepo.getDoctorExaminationsStats.mockResolvedValue({
        total_count: "1",
        waiting_count: "0",
        examining_count: "0",
        completed_count: "1",
        follow_up_count: "0",
      } as any);
      mockRepo.getDoctorExaminationsTabStats.mockResolvedValue({
        total_count: "1",
        waiting_count: "0",
        examining_count: "0",
        completed_count: "1",
        follow_up_count: "0",
      } as any);

      const result = await listDoctorExaminations(doctorUserId, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(appointmentId);
      expect(result.stats.totalCount).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe("getDoctorExaminationDetail", () => {
    it("UTX-APPOINTMENTS-002 - getDoctorExaminationDetail trả đúng chi tiết tài nguyên hợp lệ", async () => {
      const result = await getDoctorExaminationDetail(doctorUserId, appointmentId);
      expect(result.id).toBe(appointmentId);
      expect(result.examId).toBe("mex_001");
      expect(result.pet.name).toBe("Lucky");
    });

    it("UTX-APPOINTMENTS-003 - getDoctorExaminationDetail trả lỗi khi tài nguyên không tồn tại", async () => {
      mockRepo.findDoctorExaminationDetail.mockResolvedValue(null);

      await expect(getDoctorExaminationDetail(doctorUserId, "appt_invalid")).rejects.toThrowError(
        expect.objectContaining({
          code: "EXAMINATION_NOT_FOUND",
          statusCode: 404,
        })
      );
    });
  });

  describe("startDoctorExamination", () => {
    it("UTX-APPOINTMENTS-004 - startDoctorExamination cập nhật/chuyển trạng thái thành công", async () => {
      mockRepo.findDoctorExaminationForUpdate.mockResolvedValue({
        appointment_id: appointmentId,
        exam_id: null, // no exam yet
        pet_id: "pet_001",
        owner_id: "own_001",
        pet_name: "Lucky",
        type_name: "General checkup",
      } as any);

      const result = await startDoctorExamination(doctorUserId, appointmentId);
      expect(mockRepo.createMedicalExamForAppointment).toHaveBeenCalledWith(
        "mex_mock",
        appointmentId,
        doctorUserId,
        expect.anything()
      );
      expect(mockRepo.updateMedicalExamLifecycle).toHaveBeenCalledWith(
        "mex_mock",
        doctorUserId,
        "examining",
        expect.anything()
      );
      expect(mockRepo.updateAppointmentExaminationStatus).toHaveBeenCalledWith(
        appointmentId,
        "examining",
        expect.anything()
      );
      expect(result.id).toBe(appointmentId);
    });

    it("UTX-APPOINTMENTS-005 - startDoctorExamination từ chối record không tồn tại", async () => {
      mockRepo.findDoctorExaminationForUpdate.mockResolvedValue(null);

      await expect(startDoctorExamination(doctorUserId, "appt_invalid")).rejects.toThrowError(
        expect.objectContaining({
          code: "EXAMINATION_NOT_FOUND",
          statusCode: 404,
        })
      );
    });
  });

  describe("saveDraftDoctorExamination", () => {
    it("UTX-APPOINTMENTS-006 - saveDraftDoctorExamination trả kết quả chính xác với dữ liệu điển hình", async () => {
      const body = {
        diagnosis: "Draft diagnosis",
        conclusion: "Draft conclusion",
        healthNote: "Draft note",
        fieldValues: []
      };

      const result = await saveDraftDoctorExamination(doctorUserId, appointmentId, body);
      expect(mockRepo.saveMedicalExamDraft).toHaveBeenCalledWith(
        "mex_001",
        body.diagnosis,
        body.conclusion,
        body.healthNote,
        expect.anything()
      );
      expect(mockRepo.replaceMedicalExamFieldValues).toHaveBeenCalledWith(
        "mex_001",
        [],
        expect.anything()
      );
      expect(mockRepo.updateAppointmentExaminationStatus).toHaveBeenCalledWith(
        appointmentId,
        "examining",
        expect.anything()
      );
      expect(result.id).toBe(appointmentId);
    });
  });

  describe("completeDoctorExamination", () => {
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
      expect(vi.mocked(petActivityLogs.upsertPetActivityLog)).toHaveBeenCalledWith(
        expect.objectContaining({
          petId: "pet_001",
          activityType: "medical_exam_completed",
        }),
        expect.anything(),
      );
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
});
