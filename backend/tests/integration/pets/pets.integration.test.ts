import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { query } from "../../../src/db/query.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner, loginAsStaff } from "../helpers/integration-test-auth.js";

describe("pets core happy path API integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);
  it("INTX-PETS-119 - staff lists pets", async () => {
    const token = await loginAsStaff(); const response = await request(app).get("/api/v1/staff/pets").query({ q: "Milo Integration" }).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200); expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ petId: integrationTestIds.petId })]));
  });
  it("INTX-PETS-122 - staff searches owners", async () => {
    const token = await loginAsStaff(); const response = await request(app).get("/api/v1/staff/owners/search").query({ q: "owner.integration" }).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200); expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ userId: integrationTestIds.ownerUserId })]));
  });
  it("INTX-PETS-125 - staff creates owner", async () => {
    const token = await loginAsStaff(); const response = await request(app).post("/api/v1/staff/owners").set("Authorization", `Bearer ${token}`).send({ fullName: "Staff Created Owner", phoneNumber: "0901234567", email: "staff-created.integration@example.com" });
    expect(response.status).toBe(201); expect(response.body.data).toMatchObject({ fullName: "Staff Created Owner", email: "staff-created.integration@example.com" });
  });
  it("INTX-PETS-128 - staff creates pet for owner", async () => {
    const token = await loginAsStaff(); const response = await request(app).post("/api/v1/staff/pets").set("Authorization", `Bearer ${token}`).send({ ownerUserId: integrationTestIds.ownerUserId, petName: "Staff Created Pet", species: "Cat", estimatedAge: 2 });
    expect(response.status).toBe(201); expect(response.body.data).toMatchObject({ petName: "Staff Created Pet", species: "Cat" });
    await query("DELETE FROM pet_center.pets WHERE pet_id = $1", [response.body.data.petId]);
  });
  it("INTX-PETS-131 - staff updates pet", async () => {
    const token = await loginAsStaff(); const response = await request(app).patch(`/api/v1/staff/pets/${integrationTestIds.petId}`).set("Authorization", `Bearer ${token}`).send({ weightKg: 7.2 });
    expect(response.status).toBe(200); expect(response.body.data.weightKg).toBe(7.2);
  });
  it("INTX-PETS-134 - staff gets pet detail", async () => {
    const token = await loginAsStaff(); const response = await request(app).get(`/api/v1/staff/pets/${integrationTestIds.petId}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200); expect(response.body.data.petId).toBe(integrationTestIds.petId); expect(response.body.data.owner.userId).toBe(integrationTestIds.ownerUserId);
  });
  it("INTX-PETS-137 - owner lists owned pets", async () => {
    const token = await loginAsOwner(); const response = await request(app).get("/api/v1/pets").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200); expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ petId: integrationTestIds.petId })]));
  });
  it("INTX-PETS-140 - owner creates pet", async () => {
    const token = await loginAsOwner(); const response = await request(app).post("/api/v1/pets").set("Authorization", `Bearer ${token}`).send({ petName: "Owner Created Pet", species: "Dog", estimatedAge: 1 });
    expect(response.status).toBe(201); expect(response.body.data.petName).toBe("Owner Created Pet"); await query("DELETE FROM pet_center.pets WHERE pet_id = $1", [response.body.data.petId]);
  });
  it("INTX-PETS-143 - owner gets owned pet detail", async () => {
    const token = await loginAsOwner(); const response = await request(app).get(`/api/v1/pets/${integrationTestIds.petId}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200); expect(response.body.data.petId).toBe(integrationTestIds.petId);
  });
  it("INTX-PETS-146 - owner updates owned pet", async () => {
    const token = await loginAsOwner(); const response = await request(app).patch(`/api/v1/pets/${integrationTestIds.petId}`).set("Authorization", `Bearer ${token}`).send({ petName: "Milo Updated" });
    expect(response.status).toBe(200); expect(response.body.data.petName).toBe("Milo Updated");
  });
});
