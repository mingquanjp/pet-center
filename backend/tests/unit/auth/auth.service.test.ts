import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as authRepository from "../../../src/modules/auth/auth.repository.js";
import { login, verifyAccessToken } from "../../../src/modules/auth/auth.service.js";
import { createAuthUserRecord, createTestPasswordHash } from "../../helpers/auth-test-utils.js";

vi.mock("../../../src/modules/auth/auth.repository.js", () => ({
  findUserByEmail: vi.fn(),
}));

const findUserByEmailMock = vi.mocked(authRepository.findUserByEmail);

describe("authService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UT-LOGIN-001 - Login OWNER successfully with valid email and password", async () => {
    // Arrange
    const password = "Valid@123";
    const user = createAuthUserRecord({
      userId: "owner-001",
      fullName: "Owner User",
      email: "owner.petcenter@example.com",
      passwordHash: await createTestPasswordHash(password),
      role: "OWNER",
      accountStatus: "active",
    });
    findUserByEmailMock.mockResolvedValue(user);

    // Act
    const result = await login({ email: user.email, password });

    // Assert
    expect(findUserByEmailMock).toHaveBeenCalledWith(user.email);
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.accessToken.length).toBeGreaterThan(0);
    expect(result.user).toMatchObject({
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: "OWNER",
    });
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(verifyAccessToken(result.accessToken)).toMatchObject({
      userId: user.userId,
      email: user.email,
      role: "OWNER",
    });
  });

  it("UT-LOGIN-002 - Login STAFF successfully with valid email and password", async () => {
    // Arrange
    const password = "Staff@123";
    const user = createAuthUserRecord({
      userId: "staff-001",
      fullName: "Staff User",
      email: "staff.petcenter@example.com",
      passwordHash: await createTestPasswordHash(password),
      role: "STAFF",
      accountStatus: "active",
    });
    findUserByEmailMock.mockResolvedValue(user);

    // Act
    const result = await login({ email: user.email, password });

    // Assert
    expect(findUserByEmailMock).toHaveBeenCalledWith(user.email);
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.accessToken.length).toBeGreaterThan(0);
    expect(result.user.role).toBe("STAFF");
    expect(result.user.email).toBe(user.email);
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(verifyAccessToken(result.accessToken)).toMatchObject({
      userId: user.userId,
      email: user.email,
      role: "STAFF",
    });
  });

  it("UT-LOGIN-003 - Login DOCTOR successfully with valid email and password", async () => {
    // Arrange
    const password = "Doctor@123";
    const user = createAuthUserRecord({
      userId: "doctor-001",
      fullName: "Doctor User",
      email: "doctor.petcenter@example.com",
      passwordHash: await createTestPasswordHash(password),
      role: "DOCTOR",
      accountStatus: "active",
    });
    findUserByEmailMock.mockResolvedValue(user);

    // Act
    const result = await login({ email: user.email, password });

    // Assert
    expect(findUserByEmailMock).toHaveBeenCalledWith(user.email);
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.accessToken.length).toBeGreaterThan(0);
    expect(result.user.role).toBe("DOCTOR");
    expect(result.user.email).toBe(user.email);
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(verifyAccessToken(result.accessToken)).toMatchObject({
      userId: user.userId,
      email: user.email,
      role: "DOCTOR",
    });
  });

  it("UT-LOGIN-006 - reject login when email does not exist", async () => {
    // Arrange
    findUserByEmailMock.mockResolvedValue(null);

    // Act
    const action = login({
      email: "missing@example.com",
      password: "Valid@123",
    });

    // Assert
    await expect(action).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      statusCode: httpStatus.UNAUTHORIZED,
    });
    expect(findUserByEmailMock).toHaveBeenCalledWith("missing@example.com");
  });

  it("UT-LOGIN-007 - reject login when password is incorrect", async () => {
    // Arrange
    const user = createAuthUserRecord({
      email: "owner@example.com",
      passwordHash: await createTestPasswordHash("Correct@123"),
      role: "OWNER",
      accountStatus: "active",
    });
    findUserByEmailMock.mockResolvedValue(user);

    // Act
    const action = login({
      email: user.email,
      password: "Wrong@123",
    });

    // Assert
    await expect(action).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      statusCode: httpStatus.UNAUTHORIZED,
    });
    expect(findUserByEmailMock).toHaveBeenCalledWith(user.email);
  });

  it("UT-LOGIN-008 - reject login when account is not active", async () => {
    // Arrange
    const password = "Valid@123";
    const user = createAuthUserRecord({
      email: "locked@example.com",
      passwordHash: await createTestPasswordHash(password),
      role: "OWNER",
      accountStatus: "locked",
    });
    findUserByEmailMock.mockResolvedValue(user);

    // Act
    const action = login({
      email: user.email,
      password,
    });

    // Assert
    await expect(action).rejects.toMatchObject({
      code: "ACCOUNT_NOT_ACTIVE",
      statusCode: httpStatus.FORBIDDEN,
    });
    expect(findUserByEmailMock).toHaveBeenCalledWith(user.email);
  });
});
