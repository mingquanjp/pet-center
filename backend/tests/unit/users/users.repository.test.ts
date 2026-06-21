import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  listAdminUsers,
  countAdminUsers,
  getAdminUserStats,
  findAdminUserById
} from "../../../src/modules/users/users.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("users.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAdminUsers", () => {
    it("UTX-USERS-499 - listAdminUsers generates parameterized query and returns matched user rows", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            user_id: "user_1",
            full_name: "Nguyễn Văn A",
            email: "a@gmail.com",
            phone_number: "0901234567",
            address: "123 Đường A",
            role: "Owner",
            account_status: "active",
            created_at: "2026-06-20T00:00:00.000Z",
            pet_count: "2"
          }
        ]
      } as any);

      const result = await listAdminUsers({
        search: "Văn A",
        role: "Owner",
        status: "active",
        page: 2,
        limit: 5
      });

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("pet_center.users u");
      expect(sql).toContain("LIKE");
      expect(sql).toContain("u.role =");
      expect(sql).toContain("u.account_status =");
      expect(sql).toContain("limit");
      expect(sql).toContain("offset");

      // Verify normalization search param (Accent chars stripped, normalized to lowercase plain text)
      // "Văn A" normalized: vao -> lower, lowercase and stripping accents
      // "Văn A" in search text is "van a" after stripping accents. Let's make sure it contains %van a%
      expect(params).toContain("%van a%");
      expect(params).toContain("Owner");
      expect(params).toContain("active");
      expect(params).toContain(5); // limit
      expect(params).toContain(5); // offset = (2-1)*5

      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe("user_1");
    });

    it("UTX-USERS-500 - listAdminUsers handles empty results or database errors gracefully", async () => {
      mockQuery.mockRejectedValue(new Error("Database connection lost"));

      await expect(listAdminUsers({})).rejects.toThrow("Database connection lost");
    });
  });

  describe("countAdminUsers", () => {
    it("UTX-USERS-501 - countAdminUsers generates correct parameterized count query", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ total: "15" }]
      } as any);

      const result = await countAdminUsers({ search: "test", role: "Owner" });

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("select count(*)::text as total");
      expect(sql).toContain("pet_center.users u");
      expect(params).toContain("%test%");
      expect(params).toContain("Owner");
      expect(result).toBe(15);
    });

    it("UTX-USERS-502 - countAdminUsers handles database errors gracefully", async () => {
      mockQuery.mockRejectedValue(new Error("Count query failed"));

      await expect(countAdminUsers({})).rejects.toThrow("Count query failed");
    });
  });

  describe("getAdminUserStats", () => {
    it("UTX-USERS-503 - getAdminUserStats generates stats query and returns stats mapping", async () => {
      const mockStats = {
        total_count: "20",
        active_count: "15",
        locked_count: "5",
        owner_count: "12",
        staff_count: "4",
        doctor_count: "4",
        needs_attention_count: "5"
      };

      mockQuery.mockResolvedValue({
        rows: [mockStats]
      } as any);

      const result = await getAdminUserStats();

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it("UTX-USERS-504 - getAdminUserStats handles empty results or database errors correctly", async () => {
      mockQuery.mockRejectedValue(new Error("Stats fetch failed"));

      await expect(getAdminUserStats()).rejects.toThrow("Stats fetch failed");
    });
  });

  describe("findAdminUserById", () => {
    it("UTX-USERS-505 - findAdminUserById generates correct parameterized query and returns matched user row", async () => {
      const mockUser = {
        user_id: "user_1",
        full_name: "Nguyễn Văn A",
        email: "a@gmail.com",
        phone_number: "0901234567",
        address: "123 Đường A",
        role: "Owner",
        account_status: "active",
        created_at: "2026-06-20T00:00:00.000Z",
        pet_count: "1"
      };

      mockQuery.mockResolvedValue({
        rows: [mockUser]
      } as any);

      const result = await findAdminUserById("user_1");

      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("u.user_id = $1"), ["user_1"]);
      expect(result).toEqual(mockUser);
    });

    it("UTX-USERS-506 - findAdminUserById returns null if user not found or handles database error", async () => {
      // User not found
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const result = await findAdminUserById("invalid_id");
      expect(result).toBeNull();

      // Database error
      mockQuery.mockRejectedValue(new Error("Query by ID failed"));
      await expect(findAdminUserById("user_1")).rejects.toThrow("Query by ID failed");
    });
  });
});
