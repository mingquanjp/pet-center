import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  findUserByEmail,
  findUserById,
  createOwnerUser,
  updateCurrentUserProfile
} from "../../../src/modules/auth/auth.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn()
}));

const mockQuery = vi.mocked(query);

describe("auth.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserRow = {
    user_id: "user_123",
    full_name: "Test User",
    email: "test@example.com",
    password_hash: "hashed_pass",
    phone_number: "0987654321",
    address: "123 Street",
    role: "Owner" as const,
    account_status: "active" as const,
    created_at: new Date("2026-06-21T00:00:00.000Z")
  };

  const expectedMappedUser = {
    userId: "user_123",
    fullName: "Test User",
    email: "test@example.com",
    passwordHash: "hashed_pass",
    role: "OWNER",
    accountStatus: "active",
    phoneNumber: "0987654321",
    address: "123 Street",
    createdAt: "2026-06-21T00:00:00.000Z"
  };

  describe("findUserByEmail", () => {
    it("UTX-AUTH-075 - findUserByEmail returns mapped user when email matches", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [mockUserRow]
      } as any);

      const result = await findUserByEmail("test@example.com");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("from pet_center.users");
      expect(sql).toContain("where email = $1");
      expect(params).toEqual(["test@example.com"]);
      expect(result).toEqual(expectedMappedUser);
    });

    it("UTX-AUTH-076 - findUserByEmail returns null when no user matches or db fails", async () => {
      // Return empty rows
      mockQuery.mockResolvedValueOnce({
        rows: []
      } as any);

      const result = await findUserByEmail("unknown@example.com");
      expect(result).toBeNull();

      // DB exception propagation
      mockQuery.mockRejectedValueOnce(new Error("Database error"));
      await expect(findUserByEmail("test@example.com")).rejects.toThrow("Database error");
    });
  });

  describe("findUserById", () => {
    it("UTX-AUTH-077 - findUserById returns mapped user when ID matches", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [mockUserRow]
      } as any);

      const result = await findUserById("user_123");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("from pet_center.users");
      expect(sql).toContain("where user_id = $1");
      expect(params).toEqual(["user_123"]);
      expect(result).toEqual(expectedMappedUser);
    });

    it("UTX-AUTH-078 - findUserById returns null when ID is not found or db fails", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: []
      } as any);

      const result = await findUserById("unknown_id");
      expect(result).toBeNull();

      mockQuery.mockRejectedValueOnce(new Error("Database error"));
      await expect(findUserById("user_123")).rejects.toThrow("Database error");
    });
  });

  describe("createOwnerUser", () => {
    it("UTX-AUTH-079 - createOwnerUser inserts new user and returns mapped record", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [mockUserRow]
      } as any);

      const input = {
        userId: "user_123",
        fullName: "Test User",
        email: "test@example.com",
        passwordHash: "hashed_pass",
        phoneNumber: "0987654321",
        address: "123 Street"
      };

      const result = await createOwnerUser(input);

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("insert into pet_center.users");
      expect(sql).toContain("'Owner'");
      expect(params).toEqual([
        "user_123",
        "Test User",
        "test@example.com",
        "hashed_pass",
        "0987654321",
        "123 Street"
      ]);
      expect(result).toEqual(expectedMappedUser);
    });

    it("UTX-AUTH-080 - createOwnerUser propagates db execution errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Duplicate key error"));

      const input = {
        userId: "user_123",
        fullName: "Test User",
        email: "test@example.com",
        passwordHash: "hashed_pass"
      };

      await expect(createOwnerUser(input)).rejects.toThrow("Duplicate key error");
    });
  });

  describe("updateCurrentUserProfile", () => {
    it("UTX-AUTH-081 - updateCurrentUserProfile executes update and returns mapped user", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [mockUserRow]
      } as any);

      const input = {
        fullName: "Test User Updated",
        phoneNumber: "0987654321",
        address: "123 Street"
      };

      const result = await updateCurrentUserProfile("user_123", input);

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("update pet_center.users");
      expect(sql).toContain("set full_name = $2");
      expect(params).toEqual(["user_123", "Test User Updated", "0987654321", "123 Street"]);
      expect(result).toEqual(expectedMappedUser);
    });

    it("UTX-AUTH-082 - updateCurrentUserProfile returns null if user not found or db fails", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: []
      } as any);

      const input = {
        fullName: "Test User",
        phoneNumber: null,
        address: null
      };

      const result = await updateCurrentUserProfile("unknown_id", input);
      expect(result).toBeNull();

      mockQuery.mockRejectedValueOnce(new Error("Database error"));
      await expect(updateCurrentUserProfile("user_123", input)).rejects.toThrow("Database error");
    });
  });
});
