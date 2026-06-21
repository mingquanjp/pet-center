import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner, loginAsStaff } from "../helpers/integration-test-auth.js";

describe("reports authorization integration", () => {
  let ownerToken: string;
  let staffToken: string;

  beforeAll(async () => {
    await seedIntegrationTestData();
    [ownerToken, staffToken] = await Promise.all([loginAsOwner(), loginAsStaff()]);
  });

  afterAll(cleanupIntegrationTestData);

  const endpoints = [
    ["INTX-REPORTS-324", "get", "/api/v1/admin/reports"],
    ["INTX-REPORTS-327", "post", "/api/v1/admin/reports/export"]
  ] as const;

  it.each(endpoints)("%s - rejects unauthenticated and non-admin role access to %s %s", async (_id, method, path) => {
    // Unauthenticated
    expect((await request(app)[method](path)).status).toBe(401);
    // Non-admin (owner)
    expect((await request(app)[method](path).set("Authorization", `Bearer ${ownerToken}`)).status).toBe(403);
    // Non-admin (staff)
    expect((await request(app)[method](path).set("Authorization", `Bearer ${staffToken}`)).status).toBe(403);
  });
});
