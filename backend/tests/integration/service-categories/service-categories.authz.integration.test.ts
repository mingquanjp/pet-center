import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

describe("admin service categories authorization integration", () => {
  let ownerToken: string;
  beforeAll(async () => { await seedIntegrationTestData(); ownerToken = await loginAsOwner(); });
  afterAll(cleanupIntegrationTestData);
  const endpoints = [
    ["INTX-SERVICE-CATEGORIES-102", "get", "/api/v1/admin/service-categories"],
    ["INTX-SERVICE-CATEGORIES-105", "post", "/api/v1/admin/service-categories"],
    ["INTX-SERVICE-CATEGORIES-108", "get", `/api/v1/admin/service-categories/${integrationTestIds.serviceId}`],
    ["INTX-SERVICE-CATEGORIES-111", "patch", `/api/v1/admin/service-categories/${integrationTestIds.serviceId}`],
    ["INTX-SERVICE-CATEGORIES-114", "patch", `/api/v1/admin/service-categories/${integrationTestIds.serviceId}/status`],
    ["INTX-SERVICE-CATEGORIES-117", "delete", `/api/v1/admin/service-categories/${integrationTestIds.serviceId}`],
  ] as const;
  it.each(endpoints)("%s - rejects unauthenticated and owner access", async (_id, method, path) => {
    expect((await request(app)[method](path)).status).toBe(401);
    expect((await request(app)[method](path).set("Authorization", `Bearer ${ownerToken}`)).status).toBe(403);
  });
});
