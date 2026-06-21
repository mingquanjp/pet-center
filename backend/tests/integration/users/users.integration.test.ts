import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("admin users happy path API integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-USERS-356 - admin lists users with pagination and stats", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.stats).toHaveProperty("totalCount");
    expect(response.body.pagination).toMatchObject({ page: 1, limit: 10 });
  });

  it("INTX-USERS-356 - admin filters users by role and search", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/users").query({ role: "Owner", search: "owner.integration" }).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: integrationTestIds.ownerUserId, role: "Owner" })]));
  });

  it("INTX-USERS-359 - admin creates a user", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).post("/api/v1/admin/users").set("Authorization", `Bearer ${token}`).send({
      fullName: "Integration Created User", email: "created.integration@example.com", password: "Created@123", role: "Staff", accountStatus: "active",
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ email: "created.integration@example.com", role: "Staff", status: "active" });
  });

  it("INTX-USERS-362 - admin gets user detail", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get(`/api/v1/admin/users/${integrationTestIds.ownerUserId}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.user.id).toBe(integrationTestIds.ownerUserId);
    expect(Array.isArray(response.body.data.pets)).toBe(true);
  });

  it("INTX-USERS-365 - admin lists user activities", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get(`/api/v1/admin/users/${integrationTestIds.ownerUserId}/activities`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toHaveProperty("total");
  });

  it("INTX-USERS-368 - admin updates a user", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).patch(`/api/v1/admin/users/${integrationTestIds.ownerUserId}`).set("Authorization", `Bearer ${token}`).send({ fullName: "Updated Integration Owner" });
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ id: integrationTestIds.ownerUserId, name: "Updated Integration Owner" });
  });

  it("INTX-USERS-371 - admin deletes a user", async () => {
    const token = await loginAsAdmin();
    const createResponse = await request(app).post("/api/v1/admin/users").set("Authorization", `Bearer ${token}`).send({
      fullName: "To Be Deleted", email: "tobedeleted.integration@example.com", password: "Password@123", role: "Staff", accountStatus: "active"
    });
    const deleteId = createResponse.body.data.id;

    const response = await request(app).delete(`/api/v1/admin/users/${deleteId}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
