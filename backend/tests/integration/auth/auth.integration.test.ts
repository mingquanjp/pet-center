import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import {
  cleanupIntegrationTestData,
  integrationTestCredentials,
  seedIntegrationTestData,
} from "../helpers/integration-test-db.js";

describe("auth API integration", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
  });

  afterAll(async () => {
    await cleanupIntegrationTestData();
  });

  it("IT-AUTH-001 - login API returns token for valid owner credentials", async () => {
    // Arrange
    const payload = {
      email: integrationTestCredentials.owner.email,
      password: integrationTestCredentials.owner.password,
    };

    // Act
    const response = await request(app).post("/api/v1/auth/login").send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.accessToken.length).toBeGreaterThan(0);
    expect(response.body.data.user.role).toBe("OWNER");
  });

  it("IT-AUTH-002 - login API rejects wrong password", async () => {
    // Arrange
    const payload = {
      email: integrationTestCredentials.owner.email,
      password: "Wrong@123",
    };

    // Act
    const response = await request(app).post("/api/v1/auth/login").send(payload);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("IT-AUTH-003 - me API rejects missing token", async () => {
    // Arrange

    // Act
    const response = await request(app).get("/api/v1/auth/me");

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
