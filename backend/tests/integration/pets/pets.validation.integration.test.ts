import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner, loginAsStaff } from "../helpers/integration-test-auth.js";

describe("pets core validation and errors integration", () => {
  beforeEach(seedIntegrationTestData); afterAll(cleanupIntegrationTestData);
  it("INTX-PETS-121 - rejects invalid staff pets query", async () => { const t = await loginAsStaff(); expect((await request(app).get("/api/v1/staff/pets?page=0&limit=101&species=Bird").set("Authorization", `Bearer ${t}`)).status).toBe(400); });
  it("INTX-PETS-124 - rejects missing owner search query", async () => { const t = await loginAsStaff(); expect((await request(app).get("/api/v1/staff/owners/search").set("Authorization", `Bearer ${t}`)).status).toBe(400); });
  it("INTX-PETS-127 - rejects invalid staff owner payload", async () => { const t = await loginAsStaff(); expect((await request(app).post("/api/v1/staff/owners").set("Authorization", `Bearer ${t}`).send({ fullName: "A", phoneNumber: "123" })).status).toBe(400); });
  it("INTX-PETS-130 - rejects invalid staff pet payload", async () => { const t = await loginAsStaff(); expect((await request(app).post("/api/v1/staff/pets").set("Authorization", `Bearer ${t}`).send({ ownerUserId: integrationTestIds.ownerUserId, petName: "", species: "Bird" })).status).toBe(400); });
  it("INTX-PETS-133 - rejects empty staff pet update", async () => { const t = await loginAsStaff(); expect((await request(app).patch(`/api/v1/staff/pets/${integrationTestIds.petId}`).set("Authorization", `Bearer ${t}`).send({})).status).toBe(400); });
  it("INTX-PETS-136 - staff pet detail returns not found", async () => { const t = await loginAsStaff(); expect((await request(app).get("/api/v1/staff/pets/it_missing_pet").set("Authorization", `Bearer ${t}`)).status).toBe(404); });
  it("INTX-PETS-139 - rejects invalid owner pets query", async () => { const t = await loginAsOwner(); expect((await request(app).get("/api/v1/pets?sort=bad&page=0").set("Authorization", `Bearer ${t}`)).status).toBe(400); });
  it("INTX-PETS-142 - rejects invalid owner pet payload", async () => { const t = await loginAsOwner(); expect((await request(app).post("/api/v1/pets").set("Authorization", `Bearer ${t}`).send({ petName: "", species: "Bird", estimatedAge: -1 })).status).toBe(400); });
  it("INTX-PETS-145 - owner pet detail returns not found", async () => { const t = await loginAsOwner(); expect((await request(app).get("/api/v1/pets/it_missing_pet").set("Authorization", `Bearer ${t}`)).status).toBe(404); });
  it("INTX-PETS-148 - rejects empty owner pet update", async () => { const t = await loginAsOwner(); expect((await request(app).patch(`/api/v1/pets/${integrationTestIds.petId}`).set("Authorization", `Bearer ${t}`).send({})).status).toBe(400); });
});
