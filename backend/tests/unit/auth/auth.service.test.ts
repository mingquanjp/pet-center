import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as authRepository from "../../../src/modules/auth/auth.repository.js";
import * as mailService from "../../../src/modules/mail/mail.service.js";
import {
  login,
  verifyAccessToken,
  register,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from "../../../src/modules/auth/auth.service.js";
import { createAuthUserRecord, createTestPasswordHash } from "../../helpers/auth-test-utils.js";
import { env } from "../../../src/config/env.js";

vi.mock("../../../src/modules/auth/auth.repository.js");
vi.mock("../../../src/modules/mail/mail.service.js", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const mockRepo = vi.mocked(authRepository);
const mockMail = vi.mocked(mailService);

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("UT-LOGIN-001 - Login OWNER successfully with valid email and password", async () => {
      const password = "Valid@123";
      const user = createAuthUserRecord({
        userId: "owner-001",
        fullName: "Owner User",
        email: "owner.petcenter@example.com",
        passwordHash: await createTestPasswordHash(password),
        role: "OWNER",
        accountStatus: "active",
      });
      mockRepo.findUserByEmail.mockResolvedValue(user);

      const result = await login({ email: user.email, password });

      expect(mockRepo.findUserByEmail).toHaveBeenCalledWith(user.email);
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.user.userId).toBe(user.userId);
    });

    it("UT-LOGIN-002 - Login STAFF successfully with valid email and password", async () => {
      const password = "Staff@123";
      const user = createAuthUserRecord({
        userId: "staff-001",
        fullName: "Staff User",
        email: "staff.petcenter@example.com",
        passwordHash: await createTestPasswordHash(password),
        role: "STAFF",
        accountStatus: "active",
      });
      mockRepo.findUserByEmail.mockResolvedValue(user);

      const result = await login({ email: user.email, password });
      expect(result.user.role).toBe("STAFF");
    });

    it("UT-LOGIN-003 - Login DOCTOR successfully with valid email and password", async () => {
      const password = "Doctor@123";
      const user = createAuthUserRecord({
        userId: "doctor-001",
        fullName: "Doctor User",
        email: "doctor.petcenter@example.com",
        passwordHash: await createTestPasswordHash(password),
        role: "DOCTOR",
        accountStatus: "active",
      });
      mockRepo.findUserByEmail.mockResolvedValue(user);

      const result = await login({ email: user.email, password });
      expect(result.user.role).toBe("DOCTOR");
    });

    it("UT-LOGIN-006 - reject login when email does not exist", async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);

      const action = login({
        email: "missing@example.com",
        password: "Valid@123",
      });

      await expect(action).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        statusCode: httpStatus.UNAUTHORIZED,
      });
    });

    it("UT-LOGIN-007 - reject login when password is incorrect", async () => {
      const user = createAuthUserRecord({
        email: "owner@example.com",
        passwordHash: await createTestPasswordHash("Correct@123"),
        role: "OWNER",
        accountStatus: "active",
      });
      mockRepo.findUserByEmail.mockResolvedValue(user);

      const action = login({
        email: user.email,
        password: "Wrong@123",
      });

      await expect(action).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        statusCode: httpStatus.UNAUTHORIZED,
      });
    });

    it("UT-LOGIN-008 - reject login when account is not active", async () => {
      const password = "Valid@123";
      const user = createAuthUserRecord({
        email: "locked@example.com",
        passwordHash: await createTestPasswordHash(password),
        role: "OWNER",
        accountStatus: "locked",
      });
      mockRepo.findUserByEmail.mockResolvedValue(user);

      const action = login({
        email: user.email,
        password,
      });

      await expect(action).rejects.toMatchObject({
        code: "ACCOUNT_NOT_ACTIVE",
        statusCode: httpStatus.FORBIDDEN,
      });
    });

    it("UTX-AUTH-052 - login success with valid credentials", async () => {
      const password = "ValidPassword123";
      const user = createAuthUserRecord({
        userId: "owner-100",
        fullName: "Owner 100",
        email: "owner100@example.com",
        passwordHash: await createTestPasswordHash(password),
        role: "OWNER",
        accountStatus: "active",
      });
      mockRepo.findUserByEmail.mockResolvedValue(user);

      const result = await login({ email: user.email, password });
      expect(result.accessToken).toBeDefined();
      expect(result.user.userId).toBe("owner-100");
    });

    it("UTX-AUTH-053 - login rejects invalid credentials", async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);
      await expect(login({ email: "nonexistent@example.com", password: "pwd" })).rejects.toThrow();
    });
  });

  describe("verifyAccessToken", () => {
    it("UTX-AUTH-048 - verifyAccessToken verifies a valid signed token", async () => {
      const password = "Valid@123";
      const user = createAuthUserRecord({
        userId: "owner-001",
        email: "owner.petcenter@example.com",
        passwordHash: await createTestPasswordHash(password),
        role: "OWNER",
        accountStatus: "active",
      });
      mockRepo.findUserByEmail.mockResolvedValue(user);

      const response = await login({ email: user.email, password });
      const decoded = verifyAccessToken(response.accessToken);

      expect(decoded).toMatchObject({
        userId: user.userId,
        email: user.email,
        role: "OWNER",
      });
    });

    it("UTX-AUTH-049 - verifyAccessToken throws for invalid/malformed token signature", () => {
      expect(() => verifyAccessToken("malformed.token.here")).toThrow();
      expect(() => verifyAccessToken("a.b.c")).toThrow();
    });
  });

  describe("register", () => {
    const payload = {
      fullName: "New Owner",
      email: "new.owner@example.com",
      password: "ValidPassword123",
      phoneNumber: "0900000000",
      address: "Hanoi",
    };

    it("UTX-AUTH-050 - register creates owner user successfully and returns token", async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);
      mockRepo.createOwnerUser.mockResolvedValue({
        userId: "own_mock",
        fullName: payload.fullName,
        email: payload.email,
        role: "OWNER",
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        createdAt: new Date().toISOString()
      } as any);

      const result = await register(payload);
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.user.email).toBe(payload.email);
      expect(mockRepo.createOwnerUser).toHaveBeenCalled();
    });

    it("UTX-AUTH-051 - register throws conflict AppError if email already exists", async () => {
      mockRepo.findUserByEmail.mockResolvedValue({ userId: "existing" } as any);

      await expect(register(payload)).rejects.toThrowError(
        expect.objectContaining({ code: "EMAIL_ALREADY_EXISTS", statusCode: httpStatus.CONFLICT })
      );
    });
  });

  describe("me", () => {
    it("UTX-AUTH-054 - me returns active user profile successfully", async () => {
      const activeUser = createAuthUserRecord({ userId: "user-1", accountStatus: "active" });
      mockRepo.findUserById.mockResolvedValue(activeUser);

      const result = await me({ userId: "user-1", role: "OWNER", email: activeUser.email, fullName: activeUser.fullName });
      expect(result.userId).toBe("user-1");
    });

    it("throws unauthorized if me user is not found or account is not active", async () => {
      mockRepo.findUserById.mockResolvedValue(null);
      await expect(me({ userId: "missing", role: "OWNER", email: "", fullName: "" })).rejects.toThrowError(
        expect.objectContaining({ code: "USER_NOT_FOUND", statusCode: httpStatus.UNAUTHORIZED })
      );

      const lockedUser = createAuthUserRecord({ userId: "user-1", accountStatus: "locked" });
      mockRepo.findUserById.mockResolvedValue(lockedUser);
      await expect(me({ userId: "user-1", role: "OWNER", email: lockedUser.email, fullName: lockedUser.fullName })).rejects.toThrowError(
        expect.objectContaining({ code: "ACCOUNT_NOT_ACTIVE", statusCode: httpStatus.FORBIDDEN })
      );
    });
  });

  describe("updateProfile", () => {
    it("UTX-AUTH-055 - updateProfile updates user details successfully", async () => {
      const originalUser = createAuthUserRecord({ userId: "user-1", fullName: "Original" });
      mockRepo.updateCurrentUserProfile.mockResolvedValue({ ...originalUser, fullName: "Updated Name" });

      const result = await updateProfile(
        { userId: "user-1", role: "OWNER", email: originalUser.email, fullName: "Original" },
        { fullName: "Updated Name", phoneNumber: "0900000000", address: "Hanoi" }
      );
      expect(result.fullName).toBe("Updated Name");
    });

    it("UTX-AUTH-056 - updateProfile throws not found AppError if user does not exist", async () => {
      mockRepo.updateCurrentUserProfile.mockResolvedValue(null);

      await expect(updateProfile(
        { userId: "missing", role: "OWNER", email: "", fullName: "" },
        { fullName: "Test", phoneNumber: "0900000000", address: "Hanoi" }
      )).rejects.toThrowError(
        expect.objectContaining({ code: "USER_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("changePassword", () => {
    it("UTX-AUTH-057 - changePassword updates password when current is valid", async () => {
      const user = createAuthUserRecord({
        userId: "user-1",
        passwordHash: await createTestPasswordHash("Current@123")
      });
      mockRepo.findUserById.mockResolvedValue(user);
      mockRepo.updateCurrentUserPassword.mockResolvedValue(undefined as any);

      await changePassword(
        { userId: "user-1", role: "OWNER", email: user.email, fullName: user.fullName },
        { currentPassword: "Current@123", newPassword: "NewSecure@123" }
      );

      expect(mockRepo.updateCurrentUserPassword).toHaveBeenCalled();
    });

    it("UTX-AUTH-058 - changePassword rejects if current password is wrong or same as new password", async () => {
      const user = createAuthUserRecord({
        userId: "user-1",
        passwordHash: await createTestPasswordHash("Current@123")
      });
      mockRepo.findUserById.mockResolvedValue(user);

      // Wrong current password
      await expect(changePassword(
        { userId: "user-1", role: "OWNER", email: user.email, fullName: user.fullName },
        { currentPassword: "WrongCurrent", newPassword: "NewSecure@123" }
      )).rejects.toThrowError(
        expect.objectContaining({ code: "CURRENT_PASSWORD_INVALID" })
      );

      // Same as new password
      await expect(changePassword(
        { userId: "user-1", role: "OWNER", email: user.email, fullName: user.fullName },
        { currentPassword: "Current@123", newPassword: "Current@123" }
      )).rejects.toThrowError(
        expect.objectContaining({ code: "PASSWORD_UNCHANGED" })
      );
    });
  });

  describe("forgotPassword", () => {
    it("UTX-AUTH-059 - forgotPassword creates reset token and sends email for active user", async () => {
      const user = createAuthUserRecord({ email: "active@example.com", accountStatus: "active" });
      mockRepo.findUserByEmail.mockResolvedValue(user);
      mockRepo.createPasswordResetToken.mockResolvedValue(undefined as any);

      await forgotPassword({ email: "active@example.com" });

      expect(mockRepo.createPasswordResetToken).toHaveBeenCalled();
      expect(mockMail.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it("UTX-AUTH-060 - forgotPassword does not create token or send email for missing or locked user", async () => {
      // Locked user
      const lockedUser = createAuthUserRecord({ email: "locked@example.com", accountStatus: "locked" });
      mockRepo.findUserByEmail.mockResolvedValue(lockedUser);
      await forgotPassword({ email: "locked@example.com" });
      expect(mockRepo.createPasswordResetToken).not.toHaveBeenCalled();

      // Missing user
      mockRepo.findUserByEmail.mockResolvedValue(null);
      await forgotPassword({ email: "missing@example.com" });
      expect(mockRepo.createPasswordResetToken).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("UTX-AUTH-061 - resetPassword resets password with valid token and consumes it", async () => {
      const resetToken = {
        reset_token_id: "prt_1",
        user_id: "user-1",
        token_hash: "hash",
        expires_at: new Date(Date.now() + 100000)
      };
      const user = createAuthUserRecord({
        userId: "user-1",
        passwordHash: await createTestPasswordHash("OldPassword")
      });

      mockRepo.findValidPasswordResetToken.mockResolvedValue(resetToken as any);
      mockRepo.findUserById.mockResolvedValue(user);
      mockRepo.consumePasswordResetToken.mockResolvedValue(true);

      await resetPassword({ token: "valid-token", newPassword: "NewPassword@123" });

      expect(mockRepo.consumePasswordResetToken).toHaveBeenCalled();
    });

    it("UTX-AUTH-062 - resetPassword throws BAD_REQUEST if token is invalid or new password is same as old", async () => {
      // Invalid token
      mockRepo.findValidPasswordResetToken.mockResolvedValue(null);
      await expect(resetPassword({ token: "invalid-token", newPassword: "NewPassword@123" })).rejects.toThrowError(
        expect.objectContaining({ code: "PASSWORD_RESET_TOKEN_INVALID" })
      );

      // Same as old password
      const resetToken = {
        reset_token_id: "prt_1",
        user_id: "user-1",
        token_hash: "hash"
      };
      const user = createAuthUserRecord({
        userId: "user-1",
        passwordHash: await createTestPasswordHash("SamePassword@123")
      });

      mockRepo.findValidPasswordResetToken.mockResolvedValue(resetToken as any);
      mockRepo.findUserById.mockResolvedValue(user);

      await expect(resetPassword({ token: "valid-token", newPassword: "SamePassword@123" })).rejects.toThrowError(
        expect.objectContaining({ code: "PASSWORD_UNCHANGED" })
      );
    });
  });
});
