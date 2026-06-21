import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("admin service categories validation and errors integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);
  it("INTX-SERVICE-CATEGORIES-103 - rejects invalid list query", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).get("/api/v1/admin/service-categories").query({ page: 0, limit: 101, category: "other" }).set("Authorization", `Bearer ${token}`)).status).toBe(400);
  });
  it("INTX-SERVICE-CATEGORIES-106 - rejects invalid create and duplicate name", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).post("/api/v1/admin/service-categories").set("Authorization", `Bearer ${token}`).send({ serviceName: "", category: "other", basePrice: -1 })).status).toBe(400);
    const existing = await request(app).get(`/api/v1/admin/service-categories/${integrationTestIds.serviceId}`).set("Authorization", `Bearer ${token}`);
    const duplicate = await request(app).post("/api/v1/admin/service-categories").set("Authorization", `Bearer ${token}`).send({ serviceName: existing.body.data.serviceName, category: "medical", basePrice: 1000 });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.error.code).toBe("SERVICE_CATEGORY_NAME_EXISTS");
  });
  it("INTX-SERVICE-CATEGORIES-109 - returns not found for unknown category", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).get("/api/v1/admin/service-categories/it_missing_service").set("Authorization", `Bearer ${token}`)).status).toBe(404);
  });
  it("INTX-SERVICE-CATEGORIES-112 - rejects empty update payload", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).patch(`/api/v1/admin/service-categories/${integrationTestIds.serviceId}`).set("Authorization", `Bearer ${token}`).send({})).status).toBe(400);
  });
  it("INTX-SERVICE-CATEGORIES-115 - rejects invalid status", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).patch(`/api/v1/admin/service-categories/${integrationTestIds.serviceId}/status`).set("Authorization", `Bearer ${token}`).send({ status: "archived" })).status).toBe(400);
  });
  it("INTX-SERVICE-CATEGORIES-118 - delete returns not found for unknown category", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).delete("/api/v1/admin/service-categories/it_missing_service").set("Authorization", `Bearer ${token}`)).status).toBe(404);
  });
});
