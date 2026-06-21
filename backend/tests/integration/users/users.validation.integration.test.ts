import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestCredentials, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("admin users validation and errors integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-USERS-358 - rejects invalid list pagination", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/users").query({ page: 0, limit: 51 }).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
  });

  it("INTX-USERS-361 - rejects invalid create payload", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).post("/api/v1/admin/users").set("Authorization", `Bearer ${token}`).send({ fullName: "A", email: "invalid", password: "short", role: "Unknown" });
    expect(response.status).toBe(400);
  });

  it("INTX-USERS-361 - rejects duplicate email", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).post("/api/v1/admin/users").set("Authorization", `Bearer ${token}`).send({
      fullName: "Duplicate Owner", email: integrationTestCredentials.owner.email, password: "Duplicate@123", role: "Owner",
    });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("INTX-USERS-364 - returns not found for unknown user", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/users/it_missing_user").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
  });

  it("INTX-USERS-367 - rejects invalid activities pagination", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get(`/api/v1/admin/users/${integrationTestIds.ownerUserId}/activities`).query({ limit: -1 }).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
  });

  it("INTX-USERS-370 - rejects invalid update payload", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).patch(`/api/v1/admin/users/${integrationTestIds.ownerUserId}`).set("Authorization", `Bearer ${token}`).send({ email: "not-an-email" });
    expect(response.status).toBe(400);
  });

  it("INTX-USERS-373 - returns not found when deleting unknown user", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).delete("/api/v1/admin/users/it_missing_user").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
  });
});
