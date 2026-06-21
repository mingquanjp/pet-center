import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";
import { query } from "../../../src/db/query.js";
import {
  cleanupIntegrationTestData,
  integrationTestCredentials,
  integrationTestIds,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";
import * as mailService from "../../../src/modules/mail/mail.service.js";

vi.mock("../../../src/modules/mail/mail.service.js", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const mockMail = vi.mocked(mailService);

describe("auth API integration happy path tests", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("INTX-AUTH-046 - POST /auth/register registers a new owner account successfully", async () => {
    const payload = {
      fullName: "New Owner Integration",
      email: "newowner.integration@example.com",
      password: "Password@123",
      phoneNumber: "0901234568",
      address: "Da Nang"
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.email).toBe("newowner.integration@example.com");

    // Clean up created user manually to avoid database conflicts later
    await query("DELETE FROM pet_center.users WHERE email = $1", ["newowner.integration@example.com"]);
  });

  it("INTX-AUTH-048 - POST /auth/login authenticates user and returns accessToken", async () => {
    const payload = {
      email: integrationTestCredentials.owner.email,
      password: integrationTestCredentials.owner.password
    };

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.role).toBe("OWNER");
  });

  it("INTX-AUTH-050 - POST /auth/forgot-password handles valid email and triggers reset email", async () => {
    mockMail.sendPasswordResetEmail.mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: integrationTestCredentials.owner.email });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockMail.sendPasswordResetEmail).toHaveBeenCalled();
  });

  it("INTX-AUTH-052 - POST /auth/reset-password resets password using a valid token", async () => {
    mockMail.sendPasswordResetEmail.mockResolvedValueOnce(undefined);

    // 1. Trigger forgot password to generate token
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: integrationTestCredentials.owner.email });

    expect(mockMail.sendPasswordResetEmail).toHaveBeenCalled();
    const args = mockMail.sendPasswordResetEmail.mock.calls[0][0];
    const resetUrl = args.resetUrl;
    const urlObj = new URL(resetUrl);
    const token = urlObj.searchParams.get("token");
    expect(token).toBeDefined();

    // 2. Perform reset password
    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: token!,
        newPassword: "NewSecurePassword@123",
        confirmPassword: "NewSecurePassword@123"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // 3. Verify we can login with the new password
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: integrationTestCredentials.owner.email,
        password: "NewSecurePassword@123"
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.accessToken).toBeDefined();
  });

  it("INTX-AUTH-055 - POST /auth/logout logs out current authenticated user", async () => {
    const ownerToken = await loginAsOwner();

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Đăng xuất thành công");
  });

  it("INTX-AUTH-058 - GET /auth/me returns current user information", async () => {
    const ownerToken = await loginAsOwner();

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBe(integrationTestIds.ownerUserId);
    expect(response.body.data.email).toBe(integrationTestCredentials.owner.email);
  });

  it("INTX-AUTH-061 - PATCH /auth/profile updates profile details", async () => {
    const ownerToken = await loginAsOwner();
    const payload = {
      fullName: "Updated Name Integration",
      phoneNumber: "0999999999",
      address: "Ho Chi Minh City"
    };

    const response = await request(app)
      .patch("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.fullName).toBe("Updated Name Integration");
    expect(response.body.data.phoneNumber).toBe("0999999999");
    expect(response.body.data.address).toBe("Ho Chi Minh City");
  });

  it("INTX-AUTH-064 - PATCH /auth/password updates user password successfully", async () => {
    const ownerToken = await loginAsOwner();
    const payload = {
      currentPassword: integrationTestCredentials.owner.password,
      newPassword: "AnotherSecurePassword@123",
      confirmPassword: "AnotherSecurePassword@123"
    };

    const response = await request(app)
      .patch("/api/v1/auth/password")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
