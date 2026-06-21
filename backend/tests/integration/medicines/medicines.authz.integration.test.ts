import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

describe("admin medicines authorization integration", () => {
  let ownerToken: string;
  beforeAll(async () => { await seedIntegrationTestData(); ownerToken = await loginAsOwner(); });
  afterAll(cleanupIntegrationTestData);

  const endpoints = [
    ["INTX-MEDICINES-081", "get", "/api/v1/admin/medicines"],
    ["INTX-MEDICINES-084", "get", "/api/v1/admin/medicines-units"],
    ["INTX-MEDICINES-087", "post", "/api/v1/admin/medicines"],
    ["INTX-MEDICINES-090", "get", `/api/v1/admin/medicines/${integrationTestIds.medicineId}`],
    ["INTX-MEDICINES-093", "patch", `/api/v1/admin/medicines/${integrationTestIds.medicineId}`],
    ["INTX-MEDICINES-096", "patch", `/api/v1/admin/medicines/${integrationTestIds.medicineId}/status`],
    ["INTX-MEDICINES-099", "delete", `/api/v1/admin/medicines/${integrationTestIds.medicineId}`],
  ] as const;

  it.each(endpoints)("%s - rejects unauthenticated and owner access", async (_id, method, path) => {
    const anonymous = await request(app)[method](path);
    expect(anonymous.status).toBe(401);
    const wrongRole = await request(app)[method](path).set("Authorization", `Bearer ${ownerToken}`);
    expect(wrongRole.status).toBe(403);
  });
});
