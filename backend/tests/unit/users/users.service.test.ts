import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/users/users.repository.js";
import {
  listAdminUsers,
  getAdminUserDetail,
  listAdminUserActivities,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from "../../../src/modules/users/users.service.js";

vi.mock("../../../src/modules/users/users.repository.js");
vi.mock("../../../src/shared/security/password.service.js", () => ({
  hashPassword: vi.fn().mockResolvedValue("mocked_hashed_password")
}));
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockImplementation((prefix) => Promise.resolve(`${prefix}_new`))
}));

const mockRepo = vi.mocked(repo);

describe("users.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAdminUsers", () => {
    it("UTX-USERS-479 - listAdminUsers returns users list with filters, stats, and pagination mapping", async () => {
      const mockUserRow = {
        user_id: "user_1",
        full_name: "Nguyễn Văn A",
        email: "a@gmail.com",
        phone_number: "0901234567",
        address: "123 Đường A",
        role: "Owner",
        account_status: "active",
        created_at: "2026-06-20T00:00:00.000Z",
        pet_count: "2"
      };

      const mockStats = {
        total_count: "10",
        active_count: "8",
        locked_count: "2",
        owner_count: "6",
        staff_count: "2",
        doctor_count: "2",
        needs_attention_count: "2"
      };

      mockRepo.listAdminUsers.mockResolvedValue([mockUserRow]);
      mockRepo.countAdminUsers.mockResolvedValue(10);
      mockRepo.getAdminUserStats.mockResolvedValue(mockStats);

      const result = await listAdminUsers({ page: 1, limit: 10, role: "Owner" });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: "user_1",
        name: "Nguyễn Văn A",
        email: "a@gmail.com",
        phone: "0901234567",
        address: "123 Đường A",
        role: "Owner",
        status: "active",
        createdAt: new Date("2026-06-20T00:00:00.000Z").toISOString(),
        petCount: 2
      });
      expect(result.stats).toEqual({
        totalCount: 10,
        activeCount: 8,
        lockedCount: 2,
        ownerCount: 6,
        staffCount: 2,
        doctorCount: 2,
        needsAttentionCount: 2
      });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 10,
        totalPages: 1
      });
      expect(mockRepo.listAdminUsers).toHaveBeenCalledWith({ page: 1, limit: 10, role: "Owner" });
    });
  });

  describe("getAdminUserDetail", () => {
    it("UTX-USERS-480 - getAdminUserDetail returns detailed info including pets and activity logs", async () => {
      const mockUserRow = {
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

      const mockPetRow = {
        pet_id: "pet_1",
        pet_name: "Milu",
        species: "Dog" as const,
        breed: "Golden",
        gender: "male" as const,
        birth_date: "2024-06-20",
        estimated_age: "2.0",
        profile_image_url: null
      };

      const mockActivityRow = {
        activity_log_id: "act_1",
        pet_id: "pet_1",
        pet_name: "Milu",
        actor_name: "Staff B",
        activity_category: "medical" as const,
        activity_type: "Examination",
        activity_status: "completed" as const,
        occurred_at: "2026-06-20T10:00:00.000Z",
        title: "Khám sức khỏe",
        summary: "Sức khỏe tốt",
        source_type: "medical_records",
        source_id: "rec_1"
      };

      mockRepo.findAdminUserById.mockResolvedValue(mockUserRow);
      mockRepo.findAdminUserPets.mockResolvedValue([mockPetRow]);
      mockRepo.findAdminUserActivities.mockResolvedValue([mockActivityRow]);
      mockRepo.countAdminUserActivities.mockResolvedValue(1);

      const result = await getAdminUserDetail("user_1");

      expect(result.user.id).toBe("user_1");
      expect(result.pets).toHaveLength(1);
      expect(result.pets[0]).toEqual({
        id: "pet_1",
        name: "Milu",
        species: "Dog",
        speciesLabel: "Chó",
        breed: "Golden",
        gender: "male",
        genderLabel: "Đực",
        birthDate: "2024-06-20",
        estimatedAge: 2,
        ageLabel: "2 năm tuổi",
        profileImageUrl: null
      });
      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].categoryLabel).toBe("Khám bệnh");
      expect(result.activities[0].statusLabel).toBe("Hoàn thành");
    });

    it("UTX-USERS-481 - getAdminUserDetail throws AppError when user not found", async () => {
      mockRepo.findAdminUserById.mockResolvedValue(null);

      await expect(getAdminUserDetail("invalid_id")).rejects.toThrowError(
        expect.objectContaining({
          code: "USER_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("listAdminUserActivities", () => {
    it("UTX-USERS-482 - listAdminUserActivities returns paginated user activity logs", async () => {
      const mockActivityRow = {
        activity_log_id: "act_1",
        pet_id: "pet_1",
        pet_name: "Milu",
        actor_name: "Staff B",
        activity_category: "medical" as const,
        activity_type: "Examination",
        activity_status: "completed" as const,
        occurred_at: "2026-06-20T10:00:00.000Z",
        title: "Khám sức khỏe",
        summary: "Sức khỏe tốt",
        source_type: "medical_records",
        source_id: "rec_1"
      };

      mockRepo.findAdminUserById.mockResolvedValue({ user_id: "user_1" } as any);
      mockRepo.findAdminUserActivities.mockResolvedValue([mockActivityRow]);
      mockRepo.countAdminUserActivities.mockResolvedValue(10);

      const result = await listAdminUserActivities("user_1", { limit: 5, offset: 0 });

      expect(result.activities).toHaveLength(1);
      expect(result.pagination).toEqual({
        total: 10,
        limit: 5,
        offset: 0,
        hasMore: true
      });
    });
  });

  describe("createAdminUser", () => {
    const payload = {
      fullName: "Nguyễn Văn A",
      email: "a@gmail.com",
      password: "password123",
      phoneNumber: "0901234567",
      address: "123 Đường A",
      role: "Owner" as const,
      accountStatus: "active" as const
    };

    it("UTX-USERS-483 - createAdminUser creates new user with password hashing and prefix mapping", async () => {
      const mockResultRow = {
        user_id: "own_new",
        full_name: "Nguyễn Văn A",
        email: "a@gmail.com",
        phone_number: "0901234567",
        address: "123 Đường A",
        role: "Owner",
        account_status: "active",
        created_at: "2026-06-20T00:00:00.000Z",
        pet_count: "0"
      };

      mockRepo.createAdminUser.mockResolvedValue(mockResultRow);

      const result = await createAdminUser(payload);

      expect(result.id).toBe("own_new");
      expect(result.email).toBe("a@gmail.com");
      expect(mockRepo.createAdminUser).toHaveBeenCalledWith({
        userId: "own_new",
        fullName: payload.fullName,
        email: payload.email,
        passwordHash: "mocked_hashed_password",
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        role: payload.role,
        accountStatus: payload.accountStatus
      });
    });

    it("UTX-USERS-484 - createAdminUser throws AppError with CONFLICT when email exists", async () => {
      const errorWithCode = new Error("Duplicate key");
      (errorWithCode as any).code = "23505";
      mockRepo.createAdminUser.mockRejectedValue(errorWithCode);

      await expect(createAdminUser(payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "EMAIL_ALREADY_EXISTS",
          statusCode: httpStatus.CONFLICT
        })
      );
    });
  });

  describe("updateAdminUser", () => {
    const payload = {
      fullName: "Nguyễn Văn B",
      email: "b@gmail.com",
      phoneNumber: "0901234568",
      address: "456 Đường B",
      role: "Staff" as const,
      accountStatus: "active" as const
    };

    it("UTX-USERS-485 - updateAdminUser updates user details successfully", async () => {
      const mockResultRow = {
        user_id: "user_1",
        full_name: "Nguyễn Văn B",
        email: "b@gmail.com",
        phone_number: "0901234568",
        address: "456 Đường B",
        role: "Staff",
        account_status: "active",
        created_at: "2026-06-20T00:00:00.000Z",
        pet_count: "1"
      };

      mockRepo.updateAdminUser.mockResolvedValue(mockResultRow);

      const result = await updateAdminUser("user_1", payload);

      expect(result.id).toBe("user_1");
      expect(result.name).toBe("Nguyễn Văn B");
      expect(mockRepo.updateAdminUser).toHaveBeenCalledWith("user_1", {
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        role: payload.role,
        accountStatus: payload.accountStatus
      });
    });

    it("UTX-USERS-486 - updateAdminUser throws AppError when user not found or email duplicate conflicts", async () => {
      // Not found
      mockRepo.updateAdminUser.mockResolvedValue(null);
      await expect(updateAdminUser("invalid_id", payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "USER_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );

      // Email conflict
      const errorWithCode = new Error("Duplicate key");
      (errorWithCode as any).code = "23505";
      mockRepo.updateAdminUser.mockRejectedValue(errorWithCode);
      await expect(updateAdminUser("user_1", payload)).rejects.toThrowError(
        expect.objectContaining({
          code: "EMAIL_ALREADY_EXISTS",
          statusCode: httpStatus.CONFLICT
        })
      );
    });
  });

  describe("deleteAdminUser", () => {
    it("UTX-USERS-487 - deleteAdminUser deactivates user account status to inactive", async () => {
      const mockResultRow = {
        user_id: "user_1",
        full_name: "Nguyễn Văn A",
        email: "a@gmail.com",
        phone_number: "0901234567",
        address: "123 Đường A",
        role: "Owner",
        account_status: "inactive",
        created_at: "2026-06-20T00:00:00.000Z",
        pet_count: "1"
      };

      mockRepo.updateAdminUser.mockResolvedValue(mockResultRow);

      const result = await deleteAdminUser("user_1", "admin_user");

      expect(result.status).toBe("inactive");
      expect(mockRepo.updateAdminUser).toHaveBeenCalledWith("user_1", { accountStatus: "inactive" });
    });

    it("UTX-USERS-488 - deleteAdminUser throws AppError when trying to delete self or user not found", async () => {
      // Self delete
      await expect(deleteAdminUser("user_1", "user_1")).rejects.toThrowError(
        expect.objectContaining({
          code: "CANNOT_DELETE_SELF",
          statusCode: httpStatus.BAD_REQUEST
        })
      );

      // User not found
      mockRepo.updateAdminUser.mockResolvedValue(null);
      await expect(deleteAdminUser("invalid_id", "admin_user")).rejects.toThrowError(
        expect.objectContaining({
          code: "USER_NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });
});
