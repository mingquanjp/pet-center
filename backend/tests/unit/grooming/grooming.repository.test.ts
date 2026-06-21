import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  findActiveGroomingServices,
  findOwnerBookingPets,
  findOwnerBookingPet,
  findStaffCounterPets
} from "../../../src/modules/grooming/grooming.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("grooming.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findActiveGroomingServices", () => {
    it("UTX-GROOMING-235 - findActiveGroomingServices generates parameterized query and maps rows correctly", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          { service_id: "s1", service_name: "Tắm sấy", description: "Mô tả", estimated_duration_minutes: 30, base_price: 100000 }
        ]
      } as any);

      const result = await findActiveGroomingServices();
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].serviceId).toBe("s1");
    });

    it("UTX-GROOMING-236 - findActiveGroomingServices handles empty result or database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database connection failed"));

      await expect(findActiveGroomingServices()).rejects.toThrow("Database connection failed");
    });
  });

  describe("findOwnerBookingPets", () => {
    it("UTX-GROOMING-237 - findOwnerBookingPets generates parameterized query and maps pet records correctly", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          { pet_id: "p1", pet_name: "Lu", species: "Dog", weight_kg: "12.5", profile_image_url: null }
        ]
      } as any);

      const result = await findOwnerBookingPets("own_1");
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["own_1"]);
      expect(result).toHaveLength(1);
      expect(result[0].petName).toBe("Lu");
    });

    it("UTX-GROOMING-238 - findOwnerBookingPets handles empty result or database errors", async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await findOwnerBookingPets("own_1");
      expect(result).toHaveLength(0);
    });
  });

  describe("findOwnerBookingPet", () => {
    it("UTX-GROOMING-239 - findOwnerBookingPet generates parameterized query and returns single pet record", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          { pet_id: "p1", pet_name: "Lu", species: "Dog", weight_kg: "12.5", profile_image_url: null }
        ]
      } as any);

      const result = await findOwnerBookingPet("own_1", "p1");
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["own_1", "p1"]);
      expect(result?.petName).toBe("Lu");
    });

    it("UTX-GROOMING-240 - findOwnerBookingPet handles empty result or database errors", async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await findOwnerBookingPet("own_1", "p1");
      expect(result).toBeNull();
    });
  });

  describe("findStaffCounterPets", () => {
    it("UTX-GROOMING-241 - findStaffCounterPets generates parameterized search query and maps details correctly", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            pet_id: "p1",
            pet_name: "Lu",
            species: "Dog",
            breed: "Pug",
            weight_kg: "12.5",
            profile_image_url: null,
            owner_user_id: "own_1",
            owner_name: "John",
            owner_phone_number: "0901234567"
          }
        ]
      } as any);

      const result = await findStaffCounterPets({ search: "Lu", limit: 5 });
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].breed).toBe("Pug");
      expect(result[0].ownerName).toBe("John");
    });

    it("UTX-GROOMING-242 - findStaffCounterPets handles empty result or database errors", async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await findStaffCounterPets({ search: "random", limit: 5 });
      expect(result).toHaveLength(0);
    });
  });
});
