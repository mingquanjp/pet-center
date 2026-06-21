import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { query } from "../../../src/db/query.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("admin service categories happy path API integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-SERVICE-CATEGORIES-101 - admin lists service categories", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/service-categories").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 10 });
  });
  it("INTX-SERVICE-CATEGORIES-104 - admin creates service category", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).post("/api/v1/admin/service-categories").set("Authorization", `Bearer ${token}`).send({
      serviceName: "Integration Created Grooming", category: "grooming", durationMinutes: 45, basePrice: 180000,
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ serviceName: "Integration Created Grooming", category: "grooming", basePrice: 180000 });
    await query("DELETE FROM pet_center.services WHERE service_id = $1", [response.body.data.id]);
  });
  it("INTX-SERVICE-CATEGORIES-107 - admin gets service category detail", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get(`/api/v1/admin/service-categories/${integrationTestIds.serviceId}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(integrationTestIds.serviceId);
  });
  it("INTX-SERVICE-CATEGORIES-110 - admin updates service category", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).patch(`/api/v1/admin/service-categories/${integrationTestIds.serviceId}`).set("Authorization", `Bearer ${token}`).send({ basePrice: 175000, durationMinutes: 75 });
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ basePrice: 175000, durationMinutes: 75 });
  });
  it("INTX-SERVICE-CATEGORIES-113 - admin updates service category status", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).patch(`/api/v1/admin/service-categories/${integrationTestIds.serviceId}/status`).set("Authorization", `Bearer ${token}`).send({ status: "inactive" });
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("inactive");
  });
  it("INTX-SERVICE-CATEGORIES-116 - admin deletes unused service category", async () => {
    await query(`INSERT INTO pet_center.services (service_id, service_name, service_category, estimated_duration_minutes, base_price, service_status) VALUES ('it_service_delete', 'Integration Delete Service', 'grooming', 30, 100000, 'active')`);
    const token = await loginAsAdmin();
    const response = await request(app).delete("/api/v1/admin/service-categories/it_service_delete").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ deleted: true, deactivated: false, id: "it_service_delete" });
  });
});
