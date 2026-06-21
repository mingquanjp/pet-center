import { describe, expect, it } from "vitest";
import {
  toDateInput,
  toNumber,
  getSpeciesLabel,
  getGenderLabel,
  getAgeLabel,
  mapPet,
  mapStaffPet,
  mapStaffPetDetail,
  mapStaffOwnerCandidate,
  mapPetDetail,
  normalizeMetadata,
  mapPetActivityLog,
  mapPetMedicalExam,
  mapPetMedicalExamFieldValue,
  mapPrescriptionItem,
  mapPetVaccination,
  mapPetSpaHistory,
  getSpaTicketStatusLabel
} from "../../../src/modules/pets/pets.mapper.js";

describe("pets mapper", () => {
  it("UTX-PETS-408 - toDateInput maps Date objects to YYYY-MM-DD strings", () => {
    expect(toDateInput(new Date("2026-06-20T12:00:00.000Z"))).toBe("2026-06-20");
    expect(toDateInput(null)).toBeNull();
    expect(toDateInput(undefined)).toBeNull();
  });

  it("UTX-PETS-409 - toNumber coerces inputs to numbers or null", () => {
    expect(toNumber("12.34")).toBe(12.34);
    expect(toNumber(56)).toBe(56);
    expect(toNumber(null)).toBeNull();
  });

  it("UTX-PETS-410 - getSpeciesLabel maps species enum to Vietnamese labels", () => {
    expect(getSpeciesLabel("Dog")).toBe("Chó");
    expect(getSpeciesLabel("Cat")).toBe("Mèo");
    expect(getSpeciesLabel("Other")).toBe("Khác");
  });

  it("UTX-PETS-411 - getGenderLabel maps gender enum to Vietnamese labels", () => {
    expect(getGenderLabel("male")).toBe("Đực");
    expect(getGenderLabel("female")).toBe("Cái");
    expect(getGenderLabel("unknown")).toBe("Chưa rõ");
    expect(getGenderLabel(null)).toBe("Chưa cập nhật");
  });

  it("UTX-PETS-412 - getAgeLabel computes human-readable ages from birth_date or estimated_age", () => {
    // birthDate
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    expect(getAgeLabel({ birth_date: tenYearsAgo } as any)).toBe("10 năm tuổi");

    const lessThanOneYearAgo = new Date();
    lessThanOneYearAgo.setMonth(lessThanOneYearAgo.getMonth() - 2);
    expect(getAgeLabel({ birth_date: lessThanOneYearAgo } as any)).toBe("Dưới 1 năm tuổi");

    // estimated_age
    expect(getAgeLabel({ birth_date: null, estimated_age: 5 } as any)).toBe("5 năm tuổi");
    expect(getAgeLabel({ birth_date: null, estimated_age: 0.5 } as any)).toBe("Dưới 1 năm tuổi");
    expect(getAgeLabel({ birth_date: null, estimated_age: null } as any)).toBe("Chưa cập nhật");
  });

  it("maps simple PetRow to PetDto", () => {
    const row = {
      pet_id: "pet_001",
      pet_name: "Lucky",
      species: "Dog" as const,
      breed: "Golden",
      gender: "male" as const,
      birth_date: null,
      estimated_age: "3",
      fur_color: "Yellow",
      weight_kg: "25.5",
      profile_image_url: null,
      identifying_marks: null
    };

    const dto = mapPet(row as any);
    expect(dto).toMatchObject({
      petId: "pet_001",
      petName: "Lucky",
      species: "Dog",
      speciesLabel: "Chó",
      breed: "Golden",
      gender: "male",
      genderLabel: "Đực",
      birthDate: null,
      estimatedAge: 3,
      ageLabel: "3 năm tuổi",
      furColor: "Yellow",
      weightKg: 25.5,
      profileImageUrl: null,
      identifyingMarks: null
    });
  });

  it("maps StaffPetRow to StaffPetDto", () => {
    const row = {
      pet_id: "pet_001",
      pet_name: "Lucky",
      species: "Dog" as const,
      owner_user_id: "own_001",
      owner_name: "Nguyen Van A",
      owner_phone_number: "0900000000"
    };
    const dto = mapStaffPet(row as any);
    expect(dto.owner).toMatchObject({
      userId: "own_001",
      fullName: "Nguyen Van A",
      phoneNumber: "0900000000"
    });
  });

  it("normalizeMetadata parses JSON strings or returns object", () => {
    expect(normalizeMetadata(null)).toEqual({});
    expect(normalizeMetadata('{"a": 1}')).toEqual({ a: 1 });
    expect(normalizeMetadata('invalid json')).toEqual({});
    expect(normalizeMetadata({ b: 2 })).toEqual({ b: 2 });
  });

  it("maps PetActivityLogRow to PetActivityLogDto", () => {
    const row = {
      activity_log_id: "act_001",
      pet_id: "pet_001",
      owner_user_id: "own_001",
      actor_user_id: "usr_001",
      actor_name: "Staff 1",
      activity_category: "profile" as const,
      activity_type: "pet_profile_updated" as const,
      activity_status: "completed" as const,
      occurred_at: new Date(),
      title: "Title",
      summary: "Summary",
      source_type: "pet" as const,
      source_id: "pet_001",
      metadata: '{"changed": "name"}'
    };
    const dto = mapPetActivityLog(row as any);
    expect(dto.metadata).toEqual({ changed: "name" });
  });

  it("maps PetMedicalExamRow to PetMedicalExamDto", () => {
    const row = {
      exam_id: "mex_001",
      appointment_id: "appt_001",
      pet_id: "pet_001",
      exam_type_id: "et_1",
      type_code: "general_checkup" as const,
      type_name: "General Checkup",
      scheduled_at: new Date(),
      exam_date: "2026-06-20",
      veterinarian_user_id: "vet_001",
      veterinarian_name: "Dr. House",
      diagnosis: "Good health",
      conclusion: "Monitor",
      health_note: null,
      exam_status: "completed" as const,
      symptom_description: "Checkup",
      has_prescription: true,
      has_follow_up: false,
      follow_up_date: null,
      follow_up_reason: null
    };
    const dto = mapPetMedicalExam(row as any);
    expect(dto.examTypeName).toBe("General Checkup");
    expect(dto.hasPrescription).toBe(true);
  });

  it("maps PetSpaHistoryRow to PetSpaHistoryDto", () => {
    const row = {
      grooming_ticket_id: "ticket_001",
      pet_id: "pet_001",
      service_name: "Spa combo",
      service_type_name: "Grooming",
      scheduled_at: new Date(),
      scheduled_date: "2026-06-20",
      scheduled_time: "09:00",
      ticket_status: "completed" as const,
      special_request: "Careful",
      total_amount: "500000",
      included_services: ["bath", "haircut"]
    };
    const dto = mapPetSpaHistory(row as any);
    expect(dto.ticketStatusLabel).toBe("Hoàn thành");
    expect(dto.totalAmount).toBe(500000);
  });
});
