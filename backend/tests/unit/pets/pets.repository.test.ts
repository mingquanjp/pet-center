import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  findPets,
  findOwnerCandidates,
  findOwnerById,
  findOwnerByEmail
} from "../../../src/modules/pets/pets.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("pets.repository unit tests", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("findPets", () => {
    it("UTX-PETS-413 - findPets generates parameterized query and maps query results to DTO list successfully", async () => {
      // findPets calls two queries in Promise.all:
      // 1. SELECT pet fields
      // 2. SELECT count
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            {
              pet_id: "pet_001",
              pet_name: "Chopper",
              species: "Dog",
              breed: "Reindeer",
              gender: "male",
              birth_date: "2020-01-01",
              estimated_age: 3,
              fur_color: "Brown",
              weight_kg: 10,
              profile_image_url: "https://example.com/chopper.jpg",
              identifying_marks: "Blue Nose"
            }
          ]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total: "1" }]
        } as any);

      const filters = {
        ownerUserId: "own_123",
        q: "chop",
        species: "Dog" as const,
        gender: "male" as const,
        limit: 10,
        offset: 0,
        sort: "petName:asc"
      };

      const result = await findPets(filters);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      
      const [listSql, listParams] = mockQuery.mock.calls[0];
      const [countSql, countParams] = mockQuery.mock.calls[1];

      // Assert parameter structure
      expect(listSql).toContain("select");
      expect(listSql).toContain("from pet_center.pets p");
      expect(listSql).toContain("where p.owner_user_id = $1");
      expect(listSql).toContain("limit $5 offset $6");

      expect(listParams).toEqual([
        "own_123",
        "%chop%",
        "Dog",
        "male",
        10,
        0
      ]);

      expect(countSql).toContain("select count(*)::text as total");
      expect(countParams).toEqual([
        "own_123",
        "%chop%",
        "Dog",
        "male"
      ]);

      expect(result.pets).toHaveLength(1);
      expect(result.pets[0].petId).toBe("pet_001");
      expect(result.pets[0].petName).toBe("Chopper");
      expect(result.pets[0].speciesLabel).toBe("Chó");
      expect(result.pets[0].genderLabel).toBe("Đực");
      expect(result.total).toBe(1);
    });

    it("UTX-PETS-414 - findPets handles empty results or database errors correctly", async () => {
      // Empty results
      mockQuery
        .mockResolvedValueOnce({ rows: [] } as any)
        .mockResolvedValueOnce({ rows: [{ total: "0" }] } as any);

      const result = await findPets({
        ownerUserId: "own_123",
        limit: 10,
        offset: 0
      });

      expect(result.pets).toHaveLength(0);
      expect(result.total).toBe(0);

      // Database error
      mockQuery.mockRejectedValue(new Error("Query failed"));
      await expect(findPets({
        ownerUserId: "own_123",
        limit: 10,
        offset: 0
      })).rejects.toThrow("Query failed");
    });
  });

  describe("findOwnerCandidates", () => {
    it("UTX-PETS-415 - findOwnerCandidates generates query and returns list of owner candidates", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            user_id: "usr_owner",
            full_name: "Nguyễn Văn Owner",
            email: "owner@gmail.com",
            phone_number: "0909123456",
            address: "Hồ Chí Minh"
          }
        ]
      } as any);

      const result = await findOwnerCandidates("Owner", 5);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("role = 'Owner'"),
        ["%owner%", 5]
      );

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe("usr_owner");
      expect(result[0].fullName).toBe("Nguyễn Văn Owner");
      expect(result[0].email).toBe("owner@gmail.com");
    });

    it("UTX-PETS-416 - findOwnerCandidates handles empty results or database errors correctly", async () => {
      // Empty result
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const result = await findOwnerCandidates("nonexistent");
      expect(result).toHaveLength(0);

      // Database error
      mockQuery.mockRejectedValue(new Error("Owner candidate query failed"));
      await expect(findOwnerCandidates("test")).rejects.toThrow("Owner candidate query failed");
    });
  });

  describe("findOwnerById", () => {
    it("UTX-PETS-417 - findOwnerById generates parameterized query and returns matching candidate", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            user_id: "usr_owner_1",
            full_name: "Lê Văn Owner",
            email: "leowner@gmail.com",
            phone_number: "0912345678",
            address: "Hà Nội"
          }
        ]
      } as any);

      const result = await findOwnerById("usr_owner_1");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("where u.user_id = $1"),
        ["usr_owner_1"]
      );

      expect(result).not.toBeNull();
      expect(result?.userId).toBe("usr_owner_1");
      expect(result?.fullName).toBe("Lê Văn Owner");
    });

    it("UTX-PETS-418 - findOwnerById handles empty result (returns null) or database error", async () => {
      // Empty
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const result = await findOwnerById("invalid_id");
      expect(result).toBeNull();

      // Database error
      mockQuery.mockRejectedValue(new Error("Owner by ID failed"));
      await expect(findOwnerById("usr_owner_1")).rejects.toThrow("Owner by ID failed");
    });
  });

  describe("findOwnerByEmail", () => {
    it("UTX-PETS-419 - findOwnerByEmail generates query and returns candidate", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            user_id: "usr_owner_2",
            full_name: "Trần Thị Owner",
            email: "tranowner@gmail.com",
            phone_number: "0987654321",
            address: "Đà Nẵng"
          }
        ]
      } as any);

      const result = await findOwnerByEmail("tranowner@gmail.com");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("where u.email = $1"),
        ["tranowner@gmail.com"]
      );

      expect(result).not.toBeNull();
      expect(result?.userId).toBe("usr_owner_2");
      expect(result?.email).toBe("tranowner@gmail.com");
    });

    it("UTX-PETS-420 - findOwnerByEmail handles empty result or database error", async () => {
      // Empty
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const result = await findOwnerByEmail("nonexistent@gmail.com");
      expect(result).toBeNull();

      // Database error
      mockQuery.mockRejectedValue(new Error("Owner by email failed"));
      await expect(findOwnerByEmail("test@gmail.com")).rejects.toThrow("Owner by email failed");
    });
  });
});
