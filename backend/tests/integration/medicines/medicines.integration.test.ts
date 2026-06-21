import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { query } from "../../../src/db/query.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("admin medicines happy path API integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-MEDICINES-080 - admin lists medicines", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/medicines").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 10 });
  });

  it("INTX-MEDICINES-083 - admin lists medicine units", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get("/api/v1/admin/medicines-units").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("INTX-MEDICINES-086 - admin creates medicine", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).post("/api/v1/admin/medicines").set("Authorization", `Bearer ${token}`).send({
      medicineName: "Integration Created Medicine", unit: "tablet", unitPrice: 25000, stockQuantity: 20,
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ medicineName: "Integration Created Medicine", unitPrice: 25000, stockQuantity: 20 });
    await query("DELETE FROM pet_center.medicines WHERE medicine_id = $1", [response.body.data.id]);
  });

  it("INTX-MEDICINES-089 - admin gets medicine detail", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).get(`/api/v1/admin/medicines/${integrationTestIds.medicineId}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(integrationTestIds.medicineId);
  });

  it("INTX-MEDICINES-092 - admin updates medicine", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).patch(`/api/v1/admin/medicines/${integrationTestIds.medicineId}`).set("Authorization", `Bearer ${token}`).send({ unitPrice: 12000, stockQuantity: 88 });
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ unitPrice: 12000, stockQuantity: 88 });
  });

  it("INTX-MEDICINES-095 - admin updates medicine status", async () => {
    const token = await loginAsAdmin();
    const response = await request(app).patch(`/api/v1/admin/medicines/${integrationTestIds.medicineId}/status`).set("Authorization", `Bearer ${token}`).send({ medicineStatus: "inactive" });
    expect(response.status).toBe(200);
    expect(response.body.data.medicineStatus).toBe("inactive");
  });

  it("INTX-MEDICINES-098 - admin deletes unused medicine", async () => {
    await query(`INSERT INTO pet_center.medicines (medicine_id, medicine_name, unit, unit_price, stock_quantity, medicine_status) VALUES ('it_med_delete', 'Integration Delete Medicine', 'tablet', 1000, 1, 'active')`);
    const token = await loginAsAdmin();
    const response = await request(app).delete("/api/v1/admin/medicines/it_med_delete").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ deleted: true, deactivated: false, id: "it_med_delete" });
  });
});
