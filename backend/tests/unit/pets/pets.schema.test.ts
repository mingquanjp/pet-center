import { describe, expect, it } from "vitest";
import {
  petSpeciesSchema,
  petGenderSchema,
  listPetsQuerySchema,
  petParamsSchema,
  petMedicalExamParamsSchema,
  petMedicalExamsQuerySchema,
  createPetSchema,
  staffCreatePetSchema,
  staffCreateOwnerSchema,
  updatePetSchema
} from "../../../src/modules/pets/pets.schema.js";

describe("pets schema validation", () => {
  describe("petSpeciesSchema", () => {
    it("UTX-PETS-396 - petSpeciesSchema accepts valid values", () => {
      expect(petSpeciesSchema.safeParse("Dog").success).toBe(true);
      expect(petSpeciesSchema.safeParse("Cat").success).toBe(true);
      expect(petSpeciesSchema.safeParse("Other").success).toBe(true);
    });

    it("UTX-PETS-397 - petSpeciesSchema rejects invalid values", () => {
      expect(petSpeciesSchema.safeParse("Bird").success).toBe(false);
      expect(petSpeciesSchema.safeParse("").success).toBe(false);
    });
  });

  describe("petGenderSchema", () => {
    it("UTX-PETS-398 - petGenderSchema accepts valid values", () => {
      expect(petGenderSchema.safeParse("male").success).toBe(true);
      expect(petGenderSchema.safeParse("female").success).toBe(true);
      expect(petGenderSchema.safeParse("unknown").success).toBe(true);
    });

    it("UTX-PETS-399 - petGenderSchema rejects invalid values", () => {
      expect(petGenderSchema.safeParse("boy").success).toBe(false);
      expect(petGenderSchema.safeParse("").success).toBe(false);
    });
  });

  describe("listPetsQuerySchema", () => {
    it("UTX-PETS-400 - listPetsQuerySchema accepts valid parameters and transforms values", () => {
      const result1 = listPetsQuerySchema.parse({
        q: "Lucky",
        species: "Dog",
        gender: "male",
        sort: "petName:desc",
        page: "2",
        limit: "20"
      });
      expect(result1).toMatchObject({
        q: "Lucky",
        species: "Dog",
        gender: "male",
        sort: "petName:desc",
        page: 2,
        limit: 20
      });

      // Test "all" transform to undefined
      const result2 = listPetsQuerySchema.parse({
        species: "all",
        gender: "all"
      });
      expect(result2.species).toBeUndefined();
      expect(result2.gender).toBeUndefined();
    });

    it("UTX-PETS-401 - listPetsQuerySchema rejects invalid inputs", () => {
      expect(listPetsQuerySchema.safeParse({ q: "a".repeat(101) }).success).toBe(false);
      expect(listPetsQuerySchema.safeParse({ species: "InvalidSpecies" }).success).toBe(false);
      expect(listPetsQuerySchema.safeParse({ page: 0 }).success).toBe(false);
      expect(listPetsQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
    });
  });

  describe("petParamsSchema", () => {
    it("UTX-PETS-402 - petParamsSchema accepts valid petId", () => {
      expect(petParamsSchema.safeParse({ petId: "pet_001" }).success).toBe(true);
    });

    it("UTX-PETS-403 - petParamsSchema rejects invalid petId", () => {
      expect(petParamsSchema.safeParse({ petId: "" }).success).toBe(false);
      expect(petParamsSchema.safeParse({ petId: "a".repeat(31) }).success).toBe(false);
    });
  });

  describe("petMedicalExamParamsSchema", () => {
    it("UTX-PETS-404 - petMedicalExamParamsSchema accepts valid parameters", () => {
      expect(petMedicalExamParamsSchema.safeParse({ petId: "pet_001", examId: "mex_001" }).success).toBe(true);
    });

    it("UTX-PETS-405 - petMedicalExamParamsSchema rejects invalid parameters", () => {
      expect(petMedicalExamParamsSchema.safeParse({ petId: "", examId: "mex_001" }).success).toBe(false);
      expect(petMedicalExamParamsSchema.safeParse({ petId: "pet_001", examId: "" }).success).toBe(false);
    });
  });

  describe("petMedicalExamsQuerySchema", () => {
    it("UTX-PETS-406 - petMedicalExamsQuerySchema accepts valid query", () => {
      const result = petMedicalExamsQuerySchema.parse({
        q: "checkup",
        examType: "general_checkup",
        from: "2026-06-20",
        to: "2026-06-21",
        page: "1",
        limit: "10"
      });
      expect(result.q).toBe("checkup");
      expect(result.examType).toBe("general_checkup");
      expect(result.from).toBeInstanceOf(Date);
      expect(result.to).toBeInstanceOf(Date);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("UTX-PETS-407 - petMedicalExamsQuerySchema rejects invalid inputs", () => {
      expect(petMedicalExamsQuerySchema.safeParse({ examType: "invalid" }).success).toBe(false);
      expect(petMedicalExamsQuerySchema.safeParse({ page: -1 }).success).toBe(false);
    });
  });

  describe("createPetSchema and staffCreatePetSchema", () => {
    const validBasePet = {
      petName: "Bob",
      species: "Cat" as const,
      birthDate: "2025-01-01"
    };

    it("validates createPetSchema correctly", () => {
      expect(createPetSchema.safeParse(validBasePet).success).toBe(true);
      
      // birthDate or estimatedAge required
      const noAgePet = { petName: "Bob", species: "Cat" as const };
      expect(createPetSchema.safeParse(noAgePet).success).toBe(false);

      // Future birth date rejected
      const futurePet = { ...validBasePet, birthDate: "2030-01-01" };
      expect(createPetSchema.safeParse(futurePet).success).toBe(false);
    });

    it("validates staffCreatePetSchema correctly", () => {
      const validStaffPet = { ...validBasePet, ownerUserId: "own_001" };
      expect(staffCreatePetSchema.safeParse(validStaffPet).success).toBe(true);

      const missingOwner = { ...validBasePet };
      expect(staffCreatePetSchema.safeParse(missingOwner).success).toBe(false);
    });
  });

  describe("staffCreateOwnerSchema", () => {
    it("validates staffCreateOwnerSchema correctly", () => {
      const validOwner = {
        fullName: "Nguyen Van B",
        phoneNumber: "0987654321",
        email: "owner.b@example.com",
        address: "Hanoi"
      };
      expect(staffCreateOwnerSchema.safeParse(validOwner).success).toBe(true);

      // Invalid phone
      expect(staffCreateOwnerSchema.safeParse({ ...validOwner, phoneNumber: "abc" }).success).toBe(false);
      // Invalid email
      expect(staffCreateOwnerSchema.safeParse({ ...validOwner, email: "invalid" }).success).toBe(false);
    });
  });

  describe("updatePetSchema", () => {
    it("validates updatePetSchema correctly", () => {
      expect(updatePetSchema.safeParse({ petName: "New Name" }).success).toBe(true);
      
      // Needs at least one field
      expect(updatePetSchema.safeParse({}).success).toBe(false);
    });
  });
});
