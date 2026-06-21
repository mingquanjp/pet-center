import { beforeEach, describe, expect, it, vi } from "vitest";
import * as followUpRepo from "../../../src/modules/follow-ups/follow-ups.repository.js";
import { getDoctorFollowUpDetail, listDoctorFollowUps } from "../../../src/modules/follow-ups/follow-ups.service.js";
import * as prescriptionRepo from "../../../src/modules/prescriptions/prescriptions.repository.js";
import { getDoctorPrescriptionDetail, listDoctorPrescriptions } from "../../../src/modules/prescriptions/prescriptions.service.js";
import * as medicalRepo from "../../../src/modules/medical-records/medical-records.repository.js";
import { getDoctorMedicalRecordDetail, getDoctorMedicalRecords } from "../../../src/modules/medical-records/medical-records.service.js";

vi.mock("../../../src/modules/follow-ups/follow-ups.repository.js");
vi.mock("../../../src/modules/prescriptions/prescriptions.repository.js");
vi.mock("../../../src/modules/medical-records/medical-records.repository.js");

const followUps = vi.mocked(followUpRepo);
const prescriptions = vi.mocked(prescriptionRepo);
const medical = vi.mocked(medicalRepo);

const clinicalBase = {
  exam_id: "mex_001", appointment_id: "appt_001", exam_date: "2026-06-20",
  diagnosis: "Healthy", conclusion: "Monitor", pet_id: "pet_001", pet_name: "Lucky",
  species: "Dog", breed: "Poodle", birth_date: null, estimated_age: "2", profile_image_url: null,
  owner_id: "owner_001", owner_name: "Owner", owner_phone: "0900000000", owner_email: "owner@example.com",
  doctor_id: "doctor_001", doctor_name: "Doctor", medicine_count: "2",
};

describe("follow-up service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UTX-FOLLOW-UPS-SERVICE-001 maps list, stats and pagination", async () => {
    followUps.getDoctorFollowUpsList.mockResolvedValue([{
      ...clinicalBase, follow_up_id: "fui_001", follow_up_date: "2026-07-01", reason: "Recheck",
      owner_note: null, follow_up_status: "pending", completed_at: null, effective_status: "upcoming", gender: "male",
    }] as any);
    followUps.getDoctorFollowUpsCount.mockResolvedValue(11);
    followUps.getDoctorFollowUpsStats.mockResolvedValue({ upcoming_count: "3", overdue_count: "2", completed_count: "6" } as any);

    const result = await listDoctorFollowUps("doctor_001", { page: 2, limit: 5 } as any);

    expect(result.data[0]).toMatchObject({ followUpCode: "TK-001", status: "upcoming", exam: { medicineCount: 2 } });
    expect(result.stats).toEqual({ upcomingCount: 3, overdueCount: 2, completedCount: 6 });
    expect(result.pagination).toEqual({ page: 2, limit: 5, total: 11, totalPages: 3 });
  });

  it("UTX-FOLLOW-UPS-SERVICE-002 handles empty data and missing stats", async () => {
    followUps.getDoctorFollowUpsList.mockResolvedValue([]);
    followUps.getDoctorFollowUpsCount.mockResolvedValue(0);
    followUps.getDoctorFollowUpsStats.mockResolvedValue(null);
    await expect(listDoctorFollowUps("doctor_001", { page: 1, limit: 10 } as any)).resolves.toMatchObject({ data: [], stats: { upcomingCount: 0 }, pagination: { totalPages: 0 } });
  });

  it("UTX-FOLLOW-UPS-SERVICE-003 maps detail with prescription and history", async () => {
    followUps.getDoctorFollowUpDetail.mockResolvedValue({
      ...clinicalBase, follow_up_id: "fui_001", follow_up_date: "2026-07-01", reason: "Recheck",
      owner_note: "Bring results", follow_up_status: "completed", completed_at: "2026-07-01T08:00:00Z",
      effective_status: "completed", gender: "female", health_note: "Stable", prescription_id: "pre_001",
      prescribed_at: "2026-06-20", general_note: "After meals",
    } as any);
    const result = await getDoctorFollowUpDetail("doctor_001", "fui_001");
    expect(result.exam.prescription).toMatchObject({ prescriptionId: "pre_001", medicineCount: 2 });
    expect(result.reminderHistory).toHaveLength(2);
  });

  it("UTX-FOLLOW-UPS-SERVICE-004 rejects missing detail", async () => {
    followUps.getDoctorFollowUpDetail.mockResolvedValue(null);
    await expect(getDoctorFollowUpDetail("doctor_001", "missing")).rejects.toMatchObject({ code: "FOLLOW_UP_NOT_FOUND", statusCode: 404 });
  });
});

describe("prescription service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UTX-PRESCRIPTIONS-SERVICE-001 maps list, stats and pagination", async () => {
    prescriptions.getDoctorPrescriptionsList.mockResolvedValue([{
      ...clinicalBase, prescription_id: "pre_001", prescribed_at: "2026-06-20", exam_status: "prescribed",
      general_note: null, has_follow_up: true,
    }] as any);
    prescriptions.getDoctorPrescriptionsCount.mockResolvedValue(6);
    prescriptions.getDoctorPrescriptionsStats.mockResolvedValue({ total_count: "6", today_count: "1", follow_up_count: "2" } as any);
    const result = await listDoctorPrescriptions("doctor_001", { page: 2, limit: 5 } as any);
    expect(result.data[0]).toMatchObject({ prescriptionId: "pre_001", medicineCount: 2, hasFollowUp: true });
    expect(result.stats).toEqual({ totalCount: 6, todayCount: 1, followUpCount: 2 });
    expect(result.pagination.totalPages).toBe(2);
  });

  it("UTX-PRESCRIPTIONS-SERVICE-002 handles empty list", async () => {
    prescriptions.getDoctorPrescriptionsList.mockResolvedValue([]);
    prescriptions.getDoctorPrescriptionsCount.mockResolvedValue(0);
    prescriptions.getDoctorPrescriptionsStats.mockResolvedValue(null);
    await expect(listDoctorPrescriptions("doctor_001", { page: 1, limit: 10 } as any)).resolves.toMatchObject({ data: [], stats: { totalCount: 0 }, pagination: { totalPages: 0 } });
  });

  it("UTX-PRESCRIPTIONS-SERVICE-003 maps detail, medicines and follow-up", async () => {
    prescriptions.getDoctorPrescriptionDetail.mockResolvedValue({
      ...clinicalBase, prescription_id: "pre_001", prescribed_at: "2026-06-20", exam_status: "prescribed",
      general_note: null, follow_up_id: "fui_001", follow_up_date: "2026-07-01", follow_up_reason: "Recheck", follow_up_owner_note: null,
    } as any);
    prescriptions.getDoctorPrescriptionItems.mockResolvedValue([{
      prescription_item_id: "pri_001", medicine_id: "med_001", medicine_name: "Medicine", medicine_unit: "tablet",
      quantity: "2", dosage: "1 tablet", frequency: "twice daily", duration: "5 days", usage_instruction: "After meal", note: null,
    }] as any);
    const result = await getDoctorPrescriptionDetail("doctor_001", "pre_001");
    expect(result.medicines[0]).toMatchObject({ medicineId: "med_001", quantity: "2" });
    expect(result.followUp).toMatchObject({ followUpId: "fui_001" });
  });

  it("UTX-PRESCRIPTIONS-SERVICE-004 rejects missing detail without loading items", async () => {
    prescriptions.getDoctorPrescriptionDetail.mockResolvedValue(null);
    await expect(getDoctorPrescriptionDetail("doctor_001", "missing")).rejects.toMatchObject({ code: "PRESCRIPTION_NOT_FOUND", statusCode: 404 });
    expect(prescriptions.getDoctorPrescriptionItems).not.toHaveBeenCalled();
  });
});

describe("medical record service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UTX-MEDICAL-RECORDS-SERVICE-001 maps list with calculated offset", async () => {
    medical.findDoctorMedicalRecords.mockResolvedValue({ rows: [{
      pet_id: "pet_001", pet_name: "Lucky", species: "Dog", breed: null, avatar_url: null,
      owner_id: "owner_001", owner_name: "Owner", owner_phone: null, latest_exam_id: "mex_001",
      latest_exam_date: new Date("2026-06-20T00:00:00Z"), latest_diagnosis: null, exam_type_code: null,
      exam_type_name: null, exam_status: "result_recorded",
    }], total: 21 } as any);
    const result = await getDoctorMedicalRecords({ keyword: "", species: "ALL", examStatus: "ALL", page: 2, limit: 10 });
    expect(medical.findDoctorMedicalRecords).toHaveBeenCalledWith(expect.objectContaining({ limit: 10, offset: 10 }));
    expect(result).toMatchObject({ total: 21, totalPages: 3, items: [{ petId: "pet_001" }] });
  });

  it.each([
    [{ pet: null, exams: [] }],
    [{ pet: { pet_id: "pet_001" }, exams: [] }],
  ])("UTX-MEDICAL-RECORDS-SERVICE-002 rejects missing/incomplete record %#", async (rows) => {
    medical.findDoctorMedicalRecordDetailRows.mockResolvedValue(rows as any);
    await expect(getDoctorMedicalRecordDetail("pet_001")).rejects.toMatchObject({ code: "MEDICAL_RECORD_NOT_FOUND", statusCode: 404 });
  });
});
