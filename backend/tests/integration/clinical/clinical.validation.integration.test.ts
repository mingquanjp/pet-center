import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedClinicalIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsDoctor, loginAsOwner } from "../helpers/integration-test-auth.js";

describe("clinical and pet history validation integration", () => {
  beforeEach(seedClinicalIntegrationTestData); afterAll(cleanupIntegrationTestData);
  it("INTX-CLINICAL-151 - rejects invalid medical exams query",async()=>{const t=await loginAsOwner(); expect((await request(app).get(`/api/v1/pets/${integrationTestIds.petId}/medical-exams?page=0&limit=101&examType=bad`).set("Authorization",`Bearer ${t}`)).status).toBe(400);});
  it("INTX-CLINICAL-154 - medical exam detail returns not found",async()=>{const t=await loginAsOwner(); expect((await request(app).get(`/api/v1/pets/${integrationTestIds.petId}/medical-exams/it_missing_exam`).set("Authorization",`Bearer ${t}`)).status).toBe(404);});
  it("INTX-CLINICAL-157 - rejects invalid vaccination query",async()=>{const t=await loginAsOwner(); expect((await request(app).get(`/api/v1/pets/${integrationTestIds.petId}/vaccinations?status=bad&page=0`).set("Authorization",`Bearer ${t}`)).status).toBe(400);});
  it("INTX-CLINICAL-160 - rejects invalid spa history query",async()=>{const t=await loginAsOwner(); expect((await request(app).get(`/api/v1/pets/${integrationTestIds.petId}/spa-history?from=bad-date&limit=101`).set("Authorization",`Bearer ${t}`)).status).toBe(400);});
  it("INTX-CLINICAL-163 - rejects invalid medical records query",async()=>{const t=await loginAsDoctor(); expect((await request(app).get("/api/v1/doctor/medical-records?page=0&limit=101&species=Bird").set("Authorization",`Bearer ${t}`)).status).toBe(400);});
  it("INTX-CLINICAL-166 - medical record returns not found",async()=>{const t=await loginAsDoctor(); expect((await request(app).get("/api/v1/doctor/medical-records/it_missing_pet").set("Authorization",`Bearer ${t}`)).status).toBe(404);});
  it("INTX-CLINICAL-169 - rejects invalid prescriptions query",async()=>{const t=await loginAsDoctor(); expect((await request(app).get("/api/v1/doctor/prescriptions?page=0&limit=51&status=bad").set("Authorization",`Bearer ${t}`)).status).toBe(400);});
  it("INTX-CLINICAL-172 - prescription returns not found",async()=>{const t=await loginAsDoctor(); expect((await request(app).get("/api/v1/doctor/prescriptions/it_missing_rx").set("Authorization",`Bearer ${t}`)).status).toBe(404);});
  it("INTX-CLINICAL-175 - rejects invalid follow-ups query",async()=>{const t=await loginAsDoctor(); expect((await request(app).get("/api/v1/doctor/follow-ups?page=0&limit=51&status=bad").set("Authorization",`Bearer ${t}`)).status).toBe(400);});
  it("INTX-CLINICAL-178 - follow-up returns not found",async()=>{const t=await loginAsDoctor(); expect((await request(app).get("/api/v1/doctor/follow-ups/it_missing_followup").set("Authorization",`Bearer ${t}`)).status).toBe(404);});
});
