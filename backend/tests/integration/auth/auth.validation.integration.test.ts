import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import {
  cleanupIntegrationTestData,
  integrationTestCredentials,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

describe("auth API integration validation negative tests", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("INTX-AUTH-047 - POST /auth/register rejects invalid email", async () => {
    const payload = {
      fullName: "Integration Owner",
      email: "invalid-email", // Invalid email
      password: "Password@123"
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("INTX-AUTH-049 - POST /auth/login rejects missing password", async () => {
    const payload = {
      email: integrationTestCredentials.owner.email,
      password: "" // Missing password
    };

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("INTX-AUTH-051 - POST /auth/forgot-password rejects invalid email format", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("INTX-AUTH-054 - POST /auth/reset-password rejects short token or mismatched passwords", async () => {
    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: "short", // Token must be min 32 chars
        newPassword: "NewPassword@123",
        confirmPassword: "NewPassword@123"
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    const mismatchResponse = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: "a".repeat(32),
        newPassword: "NewPassword@123",
        confirmPassword: "MismatchedPassword@123" // Mismatched
      });

    expect(mismatchResponse.status).toBe(400);
    expect(mismatchResponse.body.success).toBe(false);
  });

  it("INTX-AUTH-057 - POST /auth/logout handles dummy payloads gracefully", async () => {
    const ownerToken = await loginAsOwner();

    // logout endpoint does not validate body, should ignore and logout successfully
    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ extra: "dummy" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-AUTH-060 - GET /auth/me handles dummy query parameters gracefully", async () => {
    const ownerToken = await loginAsOwner();

    const response = await request(app)
      .get("/api/v1/auth/me?extra=dummy")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-AUTH-063 - PATCH /auth/profile rejects invalid phone number", async () => {
    const ownerToken = await loginAsOwner();
    const payload = {
      fullName: "Updated Name",
      phoneNumber: "abc" // Invalid phone regex
    };

    const response = await request(app)
      .patch("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("INTX-AUTH-066 - PATCH /auth/password rejects mismatched confirm password", async () => {
    const ownerToken = await loginAsOwner();
    const payload = {
      currentPassword: integrationTestCredentials.owner.password,
      newPassword: "NewPassword@123",
      confirmPassword: "ConfirmMismatched@123" // Mismatched
    };

    const response = await request(app)
      .patch("/api/v1/auth/password")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
