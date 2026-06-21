import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as petsRepository from "../../../src/modules/pets/pets.repository.js";
import * as petActivityLogs from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";
import * as passwordService from "../../../src/shared/security/password.service.js";
import * as idUtils from "../../../src/shared/utils/id.js";
import {
  listOwnerPets,
  listStaffPets,
  getStaffPet,
  searchStaffOwners,
  createStaffOwner,
  createStaffPet,
  updateStaffPet,
  getOwnerPet,
  listOwnerPetMedicalExams,
  getOwnerPetMedicalExam,
  listOwnerPetVaccinations,
  listOwnerPetSpaHistory,
  createOwnerPet,
  updateOwnerPet
} from "../../../src/modules/pets/pets.service.js";

vi.mock("../../../src/modules/pets/pets.repository.js");
vi.mock("../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js", () => ({
  upsertPetActivityLog: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../src/shared/security/password.service.js", () => ({
  hashGeneratedPassword: vi.fn().mockResolvedValue("mock_hashed_pass"),
}));
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("mock_id"),
}));

const mockRepo = vi.mocked(petsRepository);
const mockActivityLogs = vi.mocked(petActivityLogs);

describe("Pets Service Unit Tests", () => {
  const ownerUser = { userId: "own_001", role: "OWNER" as const };
  const staffUser = { userId: "stf_001", role: "STAFF" as const };
  const doctorUser = { userId: "doc_001", role: "DOCTOR" as const };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listOwnerPets", () => {
    it("UTX-PETS-378 - listOwnerPets returns paginated list of pets for the owner", async () => {
      mockRepo.findPets.mockResolvedValue({
        pets: [{ petId: "pet_1", petName: "Buddy" }] as any,
        total: 1
      });

      const result = await listOwnerPets(ownerUser, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toMatchObject({ page: 1, limit: 10, total: 1 });
      expect(mockRepo.findPets).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: ownerUser.userId }));
    });

    it("throws forbidden if non-owner calls listOwnerPets", async () => {
      await expect(listOwnerPets(staffUser, {})).rejects.toThrowError(
        expect.objectContaining({ code: "FORBIDDEN" })
      );
    });
  });

  describe("listStaffPets", () => {
    it("UTX-PETS-379 - listStaffPets returns paginated list of all pets for staff", async () => {
      mockRepo.findStaffPets.mockResolvedValue({
        pets: [{ petId: "pet_1", petName: "Buddy" }] as any,
        total: 1
      });

      const result = await listStaffPets(staffUser, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(mockRepo.findStaffPets).toHaveBeenCalled();
    });

    it("throws forbidden if owner calls listStaffPets", async () => {
      await expect(listStaffPets(ownerUser, {})).rejects.toThrowError(
        expect.objectContaining({ code: "FORBIDDEN" })
      );
    });
  });

  describe("getStaffPet", () => {
    it("UTX-PETS-380 - getStaffPet returns pet detail for valid ID", async () => {
      mockRepo.findStaffPetById.mockResolvedValue({ petId: "pet_1", petName: "Buddy" } as any);

      const result = await getStaffPet(staffUser, "pet_1");
      expect(result).toMatchObject({ petId: "pet_1" });
    });

    it("UTX-PETS-381 - getStaffPet throws NOT_FOUND for non-existent pet ID", async () => {
      mockRepo.findStaffPetById.mockResolvedValue(null);

      await expect(getStaffPet(staffUser, "missing")).rejects.toThrowError(
        expect.objectContaining({ code: "PET_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("searchStaffOwners", () => {
    it("UTX-PETS-382 - searchStaffOwners returns owner candidates", async () => {
      mockRepo.findOwnerCandidates.mockResolvedValue([{ userId: "own_1", fullName: "John" }] as any);

      const result = await searchStaffOwners(staffUser, { q: "John" });
      expect(result).toHaveLength(1);
      expect(mockRepo.findOwnerCandidates).toHaveBeenCalledWith("John", 5);
    });
  });

  describe("createStaffOwner", () => {
    const payload = {
      fullName: "Jane Doe",
      phoneNumber: "0987654321",
      email: "jane@example.com",
      address: "Hanoi",
      notes: "VIP"
    };

    it("UTX-PETS-383 - createStaffOwner creates owner successfully", async () => {
      mockRepo.findOwnerByPhoneNumber.mockResolvedValue(null);
      mockRepo.findOwnerByEmail.mockResolvedValue(null);
      mockRepo.createStaffOwner.mockResolvedValue({ userId: "own_mock", fullName: "Jane Doe" } as any);

      const result = await createStaffOwner(staffUser, payload);
      expect(result).toMatchObject({ fullName: "Jane Doe" });
      expect(mockRepo.createStaffOwner).toHaveBeenCalled();
    });

    it("UTX-PETS-384 - createStaffOwner throws conflict for duplicate phone or email", async () => {
      // Duplicate phone
      mockRepo.findOwnerByPhoneNumber.mockResolvedValue({ userId: "existing" } as any);
      await expect(createStaffOwner(staffUser, payload)).rejects.toThrowError(
        expect.objectContaining({ code: "OWNER_PHONE_ALREADY_EXISTS", statusCode: httpStatus.CONFLICT })
      );

      // Duplicate email
      mockRepo.findOwnerByPhoneNumber.mockResolvedValue(null);
      mockRepo.findOwnerByEmail.mockResolvedValue({ userId: "existing" } as any);
      await expect(createStaffOwner(staffUser, payload)).rejects.toThrowError(
        expect.objectContaining({ code: "OWNER_EMAIL_ALREADY_EXISTS", statusCode: httpStatus.CONFLICT })
      );
    });
  });

  describe("createStaffPet", () => {
    const payload = {
      ownerUserId: "own_1",
      petName: "Buddy",
      species: "Dog" as const
    };

    it("UTX-PETS-385 - createStaffPet creates pet and logs activity", async () => {
      mockRepo.findOwnerById.mockResolvedValue({ userId: "own_1" } as any);
      mockRepo.createPet.mockResolvedValue({ petId: "pet_mock", petName: "Buddy" } as any);
      mockRepo.findStaffPetById.mockResolvedValue({ petId: "pet_mock", petName: "Buddy" } as any);

      const result = await createStaffPet(staffUser, payload);
      expect(result).toMatchObject({ petId: "pet_mock" });
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: "pet_profile_created" })
      );
    });

    it("UTX-PETS-386 - createStaffPet throws NOT_FOUND when owner is invalid", async () => {
      mockRepo.findOwnerById.mockResolvedValue(null);

      await expect(createStaffPet(staffUser, payload)).rejects.toThrowError(
        expect.objectContaining({ code: "OWNER_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("updateStaffPet", () => {
    const payload = { petName: "Buddy Updated" };

    it("UTX-PETS-387 - updateStaffPet updates details and logs activity", async () => {
      mockRepo.findStaffPetById.mockResolvedValueOnce({
        petId: "pet_1",
        petName: "Buddy",
        owner: { userId: "own_1" }
      } as any);
      mockRepo.updatePet.mockResolvedValue({ petId: "pet_1", petName: "Buddy Updated" } as any);
      mockRepo.findStaffPetById.mockResolvedValueOnce({
        petId: "pet_1",
        petName: "Buddy Updated",
        owner: { userId: "own_1" }
      } as any);

      const result = await updateStaffPet(staffUser, "pet_1", payload);
      expect(result).toMatchObject({ petName: "Buddy Updated" });
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: "pet_profile_updated" })
      );
    });

    it("UTX-PETS-388 - updateStaffPet throws NOT_FOUND when pet does not exist", async () => {
      mockRepo.findStaffPetById.mockResolvedValue(null);

      await expect(updateStaffPet(staffUser, "missing", payload)).rejects.toThrowError(
        expect.objectContaining({ code: "PET_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("getOwnerPet", () => {
    it("UTX-PETS-389 - getOwnerPet returns details if pet belongs to owner", async () => {
      mockRepo.findPetById.mockResolvedValue({ petId: "pet_1", petName: "Buddy" } as any);

      const result = await getOwnerPet(ownerUser, "pet_1");
      expect(result).toMatchObject({ petId: "pet_1" });
    });

    it("UTX-PETS-390 - getOwnerPet throws NOT_FOUND if pet does not exist or belongs to another owner", async () => {
      mockRepo.findPetById.mockResolvedValue(null);

      await expect(getOwnerPet(ownerUser, "pet_1")).rejects.toThrowError(
        expect.objectContaining({ code: "PET_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("listOwnerPetMedicalExams", () => {
    it("UTX-PETS-391 - listOwnerPetMedicalExams returns paginated medical exams for the pet", async () => {
      mockRepo.findPetById.mockResolvedValue({ petId: "pet_1" } as any);
      mockRepo.findPetMedicalExams.mockResolvedValue({
        exams: [{ examId: "mex_1", diagnosis: "Viêm da" }] as any,
        total: 1
      });

      const result = await listOwnerPetMedicalExams(ownerUser, "pet_1", { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toMatchObject({ total: 1 });
    });
  });

  describe("getOwnerPetMedicalExam", () => {
    it("UTX-PETS-392 - getOwnerPetMedicalExam returns medical exam details", async () => {
      mockRepo.findPetMedicalExamDetail.mockResolvedValue({ examId: "mex_1", diagnosis: "Viêm da" } as any);

      const result = await getOwnerPetMedicalExam(ownerUser, "pet_1", "mex_1");
      expect(result).toMatchObject({ examId: "mex_1" });
    });

    it("UTX-PETS-393 - getOwnerPetMedicalExam throws NOT_FOUND if exam is not found", async () => {
      mockRepo.findPetMedicalExamDetail.mockResolvedValue(null);

      await expect(getOwnerPetMedicalExam(ownerUser, "pet_1", "mex_1")).rejects.toThrowError(
        expect.objectContaining({ code: "PET_EXAM_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("listOwnerPetVaccinations", () => {
    it("UTX-PETS-394 - listOwnerPetVaccinations returns paginated list of vaccinations", async () => {
      mockRepo.findPetById.mockResolvedValue({ petId: "pet_1" } as any);
      mockRepo.findPetVaccinations.mockResolvedValue({
        vaccinations: [{ vaccinationId: "vac_1", vaccineName: "Rabies" }] as any,
        total: 1
      });

      const result = await listOwnerPetVaccinations(ownerUser, "pet_1", { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("listOwnerPetSpaHistory", () => {
    it("UTX-PETS-395 - listOwnerPetSpaHistory returns paginated spa history", async () => {
      mockRepo.findPetById.mockResolvedValue({ petId: "pet_1" } as any);
      mockRepo.findPetSpaHistory.mockResolvedValue({
        records: [{ groomingTicketId: "spa_1", serviceName: "Tắm sấy" }] as any,
        total: 1
      });

      const result = await listOwnerPetSpaHistory(ownerUser, "pet_1", { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("Owner-specific mutators (createOwnerPet & updateOwnerPet)", () => {
    it("creates owner pet successfully", async () => {
      mockRepo.createPet.mockResolvedValue({ petId: "pet_mock", petName: "Kitty" } as any);

      const result = await createOwnerPet(ownerUser, { petName: "Kitty", species: "Cat" });
      expect(result).toMatchObject({ petId: "pet_mock" });
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: "pet_profile_created" })
      );
    });

    it("updates owner pet successfully", async () => {
      mockRepo.updatePet.mockResolvedValue({ petId: "pet_1", petName: "Buddy Updated" } as any);

      const result = await updateOwnerPet(ownerUser, "pet_1", { petName: "Buddy Updated" });
      expect(result).toMatchObject({ petName: "Buddy Updated" });
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: "pet_profile_updated" })
      );
    });
  });
});
