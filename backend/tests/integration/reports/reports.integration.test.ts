import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("reports happy path API integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-REPORTS-323 - admin gets reports dashboard data", async () => {
    const token = await loginAsAdmin();
    const response = await request(app)
      .get("/api/v1/admin/reports")
      .query({ timeRange: "LAST_30_DAYS", groupBy: "DAY" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("revenue");
    expect(response.body.data).toHaveProperty("services");
  });

  it("INTX-REPORTS-326 - admin requests report export", async () => {
    const token = await loginAsAdmin();
    const response = await request(app)
      .post("/api/v1/admin/reports/export")
      .send({ timeRange: "LAST_30_DAYS", format: "excel" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("pending");
    expect(response.body.data.format).toBe("excel");
  });
});
