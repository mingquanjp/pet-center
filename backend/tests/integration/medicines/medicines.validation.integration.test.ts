import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("admin medicines validation and errors integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-MEDICINES-082 - rejects invalid list query", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/medicines").query({ page: 0, limit: 101, status: "INVALID" }).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
  });
  it("INTX-MEDICINES-085 - units endpoint tolerates irrelevant query", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/medicines-units?extra=dummy").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
  it("INTX-MEDICINES-088 - rejects invalid create and duplicate name", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).post("/api/v1/admin/medicines").set("Authorization", `Bearer ${token}`).send({ medicineName: "", unit: "", unitPrice: -1 })).status).toBe(400);
    const existing = await request(app).get(`/api/v1/admin/medicines/${integrationTestIds.medicineId}`).set("Authorization", `Bearer ${token}`);
    const duplicate = await request(app).post("/api/v1/admin/medicines").set("Authorization", `Bearer ${token}`).send({ medicineName: existing.body.data.medicineName, unit: "tablet", unitPrice: 1 });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.error.code).toBe("MEDICINE_NAME_EXISTS");
  });
  it("INTX-MEDICINES-091 - returns not found for unknown medicine", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).get("/api/v1/admin/medicines/it_missing_med").set("Authorization", `Bearer ${token}`)).status).toBe(404);
  });
  it("INTX-MEDICINES-094 - rejects empty update payload", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).patch(`/api/v1/admin/medicines/${integrationTestIds.medicineId}`).set("Authorization", `Bearer ${token}`).send({})).status).toBe(400);
  });
  it("INTX-MEDICINES-097 - rejects invalid medicine status", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).patch(`/api/v1/admin/medicines/${integrationTestIds.medicineId}/status`).set("Authorization", `Bearer ${token}`).send({ medicineStatus: "archived" })).status).toBe(400);
  });
  it("INTX-MEDICINES-100 - delete returns not found for unknown medicine", async () => {
    const token = await loginAsAdmin();
    expect((await request(app).delete("/api/v1/admin/medicines/it_missing_med").set("Authorization", `Bearer ${token}`)).status).toBe(404);
  });
});
