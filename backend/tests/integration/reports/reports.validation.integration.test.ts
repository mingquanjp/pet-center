import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsAdmin } from "../helpers/integration-test-auth.js";

describe("reports validation and errors integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-REPORTS-325 - GET /admin/reports rejects invalid query parameters", async () => {
    const token = await loginAsAdmin();

    // 1. fromDate > toDate
    const res1 = await request(app)
      .get("/api/v1/admin/reports")
      .query({ fromDate: "2026-06-21", toDate: "2026-06-20" })
      .set("Authorization", `Bearer ${token}`);
    expect(res1.status).toBe(400);

    // 2. timeRange is CUSTOM but missing dates
    const res2 = await request(app)
      .get("/api/v1/admin/reports")
      .query({ timeRange: "CUSTOM" })
      .set("Authorization", `Bearer ${token}`);
    expect(res2.status).toBe(400);
  });

  it("INTX-REPORTS-328 - POST /admin/reports/export rejects invalid body parameters", async () => {
    const token = await loginAsAdmin();

    // Invalid format
    const response = await request(app)
      .post("/api/v1/admin/reports/export")
      .send({ format: "html" }) // format must be excel or pdf
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
