import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

describe("admin users authorization integration", () => {
  let ownerToken: string;
  beforeAll(async () => {
    await seedIntegrationTestData();
    ownerToken = await loginAsOwner();
  });
  afterAll(cleanupIntegrationTestData);

  const endpoints = [
    ["INTX-USERS-357", "get", "/api/v1/admin/users"],
    ["INTX-USERS-360", "post", "/api/v1/admin/users"],
    ["INTX-USERS-363", "get", `/api/v1/admin/users/${integrationTestIds.ownerUserId}`],
    ["INTX-USERS-366", "get", `/api/v1/admin/users/${integrationTestIds.ownerUserId}/activities`],
    ["INTX-USERS-369", "patch", `/api/v1/admin/users/${integrationTestIds.ownerUserId}`],
    ["INTX-USERS-372", "delete", `/api/v1/admin/users/${integrationTestIds.ownerUserId}`],
  ] as const;

  it.each(endpoints)("%s - rejects unauthenticated and non-admin role access to %s %s", async (_id, method, path) => {
    // Unauthenticated
    expect((await request(app)[method](path)).status).toBe(401);
    // Non-admin (owner)
    expect((await request(app)[method](path).set("Authorization", `Bearer ${ownerToken}`)).status).toBe(403);
  });
});
