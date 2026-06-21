import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDoctorMedicalRecords, getDoctorMedicalRecordDetail } from "../../../src/modules/medical-records/medical-records.service.js";
import * as repository from "../../../src/modules/medical-records/medical-records.repository.js";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";

vi.mock("../../../src/modules/medical-records/medical-records.repository.js");

const mockRepo = vi.mocked(repository);

describe("medical-records.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDoctorMedicalRecords", () => {
    it("UTX-MEDICAL_RECORDS-290 - getDoctorMedicalRecords maps results correctly with valid query", async () => {
      const mockDate = new Date("2026-06-20T08:00:00.000Z");
      mockRepo.findDoctorMedicalRecords.mockResolvedValue({
        rows: [
          {
            pet_id: "pet_1",
            pet_name: "Lu",
            species: "Dog",
            breed: "Poodle",
            avatar_url: "avatar_url",
            owner_id: "owner_1",
            owner_name: "Anh A",
            owner_phone: "0901234567",
            latest_exam_id: "exam_1",
            latest_exam_date: mockDate,
            latest_diagnosis: "Sốt nhẹ",
            exam_type_code: "EXAM_GP",
            exam_type_name: "Khám tổng quát",
            exam_status: "completed"
          }
        ],
        total: 1
      });

      const result = await getDoctorMedicalRecords({
        page: 1,
        limit: 10,
        keyword: "Lu",
        species: "Dog",
        examStatus: "completed"
      });

      expect(mockRepo.findDoctorMedicalRecords).toHaveBeenCalledWith({
        keyword: "Lu",
        species: "Dog",
        examStatus: "completed",
        limit: 10,
        offset: 0
      });

      expect(result).toEqual({
        items: [
          {
            petId: "pet_1",
            petName: "Lu",
            species: "Dog",
            breed: "Poodle",
            avatarUrl: "avatar_url",
            ownerId: "owner_1",
            ownerName: "Anh A",
            ownerPhone: "0901234567",
            latestExamId: "exam_1",
            latestExamDate: mockDate.toISOString(),
            latestDiagnosis: "Sốt nhẹ",
            latestExamTypeCode: "EXAM_GP",
            latestExamTypeName: "Khám tổng quát",
            examStatus: "completed"
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });

    it("UTX-MEDICAL_RECORDS-291 - getDoctorMedicalRecords handles default empty or boundary values in query", async () => {
      mockRepo.findDoctorMedicalRecords.mockResolvedValue({
        rows: [],
        total: 0
      });

      const result = await getDoctorMedicalRecords({
        page: 2,
        limit: 5
      });

      expect(mockRepo.findDoctorMedicalRecords).toHaveBeenCalledWith({
        keyword: undefined,
        species: undefined,
        examStatus: undefined,
        limit: 5,
        offset: 5
      });

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0
      });
    });
  });

  describe("getDoctorMedicalRecordDetail", () => {
    it("UTX-MEDICAL_RECORDS-292 - getDoctorMedicalRecordDetail maps complete detail including relations correctly", async () => {
      const mockPet = {
        pet_id: "pet_1",
        pet_name: "Lu",
        species: "Dog",
        breed: "Poodle",
        gender: "male",
        birth_date: new Date("2025-01-01"),
        estimated_age: "1.5",
        fur_color: "Brown",
        weight_kg: "5.5",
        avatar_url: "avatar_url",
        owner_id: "owner_1",
        owner_name: "Anh A",
        owner_phone: "0901234567",
        owner_email: "a@example.com",
        owner_address: "123 Street"
      };

      const mockExams = [
        {
          exam_id: "exam_1",
          appointment_id: "appt_1",
          exam_date: new Date("2026-06-20T08:00:00.000Z"),
          exam_type_code: "EXAM_GP",
          exam_type_name: "Khám tổng quát",
          veterinarian_id: "vet_1",
          veterinarian_name: "Bác sĩ B",
          symptom_description: "Ho nhẹ",
          diagnosis: "Cảm lạnh",
          conclusion: "Theo dõi",
          health_note: "Tránh tắm nước lạnh",
          exam_status: "completed"
        }
      ];

      const mockFieldValues = [
        {
          field_value_id: "fv_1",
          exam_id: "exam_1",
          field_label: "Nhiệt độ",
          field_type: "number",
          value_text: null,
          value_number: "38.5",
          value_date: null,
          file_url: null,
          display_order: 1
        }
      ];

      const mockVaccinations = [
        {
          vaccination_id: "vac_1",
          exam_id: "exam_1",
          vaccine_name: "Rabies",
          vaccination_date: new Date("2026-06-01"),
          note: "Hàng năm"
        }
      ];

      const mockPrescriptions = [
        {
          prescription_id: "pres_1",
          exam_id: "exam_1",
          prescribed_at: new Date("2026-06-20"),
          general_note: "Uống sau ăn"
        }
      ];

      const mockPrescriptionItems = [
        {
          prescription_id: "pres_1",
          prescription_item_id: "pi_1",
          medicine_name: "Paracetamol",
          medicine_unit: "Viên",
          quantity: 10,
          dosage: "1 viên / lần",
          frequency: "2 lần / ngày",
          duration: 5,
          usage_instruction: "Sau ăn",
          note: "Theo dõi phản ứng phụ"
        }
      ];

      const mockFollowUps = [
        {
          follow_up_id: "fup_1",
          exam_id: "exam_1",
          follow_up_date: new Date("2026-06-27"),
          reason: "Tái khám phổi",
          owner_note: "Gọi trước",
          follow_up_status: "scheduled",
          completed_at: null
        }
      ];

      mockRepo.findDoctorMedicalRecordDetailRows.mockResolvedValue({
        pet: mockPet,
        exams: mockExams,
        fieldValues: mockFieldValues,
        vaccinations: mockVaccinations,
        prescriptions: mockPrescriptions,
        prescriptionItems: mockPrescriptionItems,
        followUps: mockFollowUps
      } as any);

      const result = await getDoctorMedicalRecordDetail("pet_1");

      expect(mockRepo.findDoctorMedicalRecordDetailRows).toHaveBeenCalledWith("pet_1");

      expect(result).toEqual({
        pet: {
          petId: "pet_1",
          petName: "Lu",
          species: "Dog",
          breed: "Poodle",
          gender: "male",
          birthDate: "2025-01-01",
          estimatedAge: 1.5,
          furColor: "Brown",
          weightKg: 5.5,
          avatarUrl: "avatar_url",
          owner: {
            ownerId: "owner_1",
            fullName: "Anh A",
            phoneNumber: "0901234567",
            email: "a@example.com",
            address: "123 Street"
          }
        },
        exams: [
          {
            examId: "exam_1",
            appointmentId: "appt_1",
            examDate: "2026-06-20T08:00:00.000Z",
            examTypeCode: "EXAM_GP",
            examTypeName: "Khám tổng quát",
            veterinarianId: "vet_1",
            veterinarianName: "Bác sĩ B",
            symptomDescription: "Ho nhẹ",
            diagnosis: "Cảm lạnh",
            conclusion: "Theo dõi",
            healthNote: "Tránh tắm nước lạnh",
            examStatus: "completed"
          }
        ],
        examFieldValues: [
          {
            fieldValueId: "fv_1",
            examId: "exam_1",
            fieldLabel: "Nhiệt độ",
            fieldType: "number",
            valueText: null,
            valueNumber: 38.5,
            valueDate: null,
            fileUrl: null,
            displayOrder: 1
          }
        ],
        vaccinations: [
          {
            vaccinationId: "vac_1",
            examId: "exam_1",
            vaccineName: "Rabies",
            vaccinationDate: "2026-06-01",
            note: "Hàng năm"
          }
        ],
        prescriptions: [
          {
            prescriptionId: "pres_1",
            examId: "exam_1",
            prescribedAt: "2026-06-20",
            generalNote: "Uống sau ăn",
            items: [
              {
                prescriptionItemId: "pi_1",
                medicineName: "Paracetamol",
                medicineUnit: "Viên",
                quantity: 10,
                dosage: "1 viên / lần",
                frequency: "2 lần / ngày",
                duration: 5,
                usageInstruction: "Sau ăn",
                note: "Theo dõi phản ứng phụ"
              }
            ]
          }
        ],
        followUps: [
          {
            followUpId: "fup_1",
            examId: "exam_1",
            followUpDate: "2026-06-27",
            reason: "Tái khám phổi",
            ownerNote: "Gọi trước",
            followUpStatus: "scheduled",
            completedAt: null
          }
        ]
      });
    });

    it("UTX-MEDICAL_RECORDS-293 - getDoctorMedicalRecordDetail throws AppError 404 when pet record or exams is empty", async () => {
      mockRepo.findDoctorMedicalRecordDetailRows.mockResolvedValue({
        pet: null,
        exams: [],
        fieldValues: [],
        vaccinations: [],
        prescriptions: [],
        prescriptionItems: [],
        followUps: []
      } as any);

      await expect(getDoctorMedicalRecordDetail("non_existent")).rejects.toThrow(
        new AppError("Không tìm thấy bệnh án", "MEDICAL_RECORD_NOT_FOUND", httpStatus.NOT_FOUND)
      );
    });
  });
});
