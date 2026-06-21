import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner, loginAsStaff } from "../helpers/integration-test-auth.js";

describe("pets core authorization integration", () => {
  let ownerToken: string; let staffToken: string;
  beforeAll(async () => { await seedIntegrationTestData(); [ownerToken, staffToken] = await Promise.all([loginAsOwner(), loginAsStaff()]); });
  afterAll(cleanupIntegrationTestData);
  const endpoints = [
    ["INTX-PETS-120", "get", "/api/v1/staff/pets", "owner"], ["INTX-PETS-123", "get", "/api/v1/staff/owners/search?q=owner", "owner"],
    ["INTX-PETS-126", "post", "/api/v1/staff/owners", "owner"], ["INTX-PETS-129", "post", "/api/v1/staff/pets", "owner"],
    ["INTX-PETS-132", "patch", `/api/v1/staff/pets/${integrationTestIds.petId}`, "owner"], ["INTX-PETS-135", "get", `/api/v1/staff/pets/${integrationTestIds.petId}`, "owner"],
    ["INTX-PETS-138", "get", "/api/v1/pets", "staff"], ["INTX-PETS-141", "post", "/api/v1/pets", "staff"],
    ["INTX-PETS-144", "get", `/api/v1/pets/${integrationTestIds.petId}`, "staff"], ["INTX-PETS-147", "patch", `/api/v1/pets/${integrationTestIds.petId}`, "staff"],
  ] as const;
  it.each(endpoints)("%s - rejects unauthenticated and wrong-role access", async (_id, method, path, wrongRole) => {
    expect((await request(app)[method](path)).status).toBe(401);
    const token = wrongRole === "owner" ? ownerToken : staffToken;
    expect((await request(app)[method](path).set("Authorization", `Bearer ${token}`)).status).toBe(403);
  });
});
