import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import {
  cleanupIntegrationTestData,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";

describe("auth API integration authorization security negative tests", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("INTX-AUTH-053 - POST /auth/reset-password rejects invalid/non-existent token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: "a".repeat(32), // Non-existent token
        newPassword: "NewPassword@123",
        confirmPassword: "NewPassword@123"
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("PASSWORD_RESET_TOKEN_INVALID");
  });

  it("INTX-AUTH-056 - POST /auth/logout rejects missing or invalid token", async () => {
    const responseNoToken = await request(app)
      .post("/api/v1/auth/logout");
    expect(responseNoToken.status).toBe(401);
    expect(responseNoToken.body.success).toBe(false);
    expect(responseNoToken.body.error.code).toBe("UNAUTHORIZED");

    const responseInvalidToken = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", "Bearer invalid-token");
    expect(responseInvalidToken.status).toBe(401);
    expect(responseInvalidToken.body.success).toBe(false);
    expect(responseInvalidToken.body.error.code).toBe("UNAUTHORIZED");
  });

  it("INTX-AUTH-059 - GET /auth/me rejects missing or invalid token", async () => {
    const responseNoToken = await request(app)
      .get("/api/v1/auth/me");
    expect(responseNoToken.status).toBe(401);
    expect(responseNoToken.body.success).toBe(false);
    expect(responseNoToken.body.error.code).toBe("UNAUTHORIZED");

    const responseInvalidToken = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");
    expect(responseInvalidToken.status).toBe(401);
    expect(responseInvalidToken.body.success).toBe(false);
    expect(responseInvalidToken.body.error.code).toBe("UNAUTHORIZED");
  });

  it("INTX-AUTH-062 - PATCH /auth/profile rejects missing or invalid token", async () => {
    const responseNoToken = await request(app)
      .patch("/api/v1/auth/profile")
      .send({ fullName: "New Name" });
    expect(responseNoToken.status).toBe(401);
    expect(responseNoToken.body.success).toBe(false);
    expect(responseNoToken.body.error.code).toBe("UNAUTHORIZED");

    const responseInvalidToken = await request(app)
      .patch("/api/v1/auth/profile")
      .set("Authorization", "Bearer invalid-token")
      .send({ fullName: "New Name" });
    expect(responseInvalidToken.status).toBe(401);
    expect(responseInvalidToken.body.success).toBe(false);
    expect(responseInvalidToken.body.error.code).toBe("UNAUTHORIZED");
  });

  it("INTX-AUTH-065 - PATCH /auth/password rejects missing or invalid token", async () => {
    const responseNoToken = await request(app)
      .patch("/api/v1/auth/password")
      .send({ currentPassword: "pwd", newPassword: "newpwd", confirmPassword: "newpwd" });
    expect(responseNoToken.status).toBe(401);
    expect(responseNoToken.body.success).toBe(false);
    expect(responseNoToken.body.error.code).toBe("UNAUTHORIZED");

    const responseInvalidToken = await request(app)
      .patch("/api/v1/auth/password")
      .set("Authorization", "Bearer invalid-token")
      .send({ currentPassword: "pwd", newPassword: "newpwd", confirmPassword: "newpwd" });
    expect(responseInvalidToken.status).toBe(401);
    expect(responseInvalidToken.body.success).toBe(false);
    expect(responseInvalidToken.body.error.code).toBe("UNAUTHORIZED");
  });
});
