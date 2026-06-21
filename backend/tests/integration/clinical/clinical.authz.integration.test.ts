import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedClinicalIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner, loginAsStaff } from "../helpers/integration-test-auth.js";

describe("clinical and pet history authorization integration", () => {
  let owner:string; let staff:string; beforeAll(async()=>{await seedClinicalIntegrationTestData(); [owner,staff]=await Promise.all([loginAsOwner(),loginAsStaff()]);}); afterAll(cleanupIntegrationTestData);
  const cases=[
    ["150","get",`/api/v1/pets/${integrationTestIds.petId}/medical-exams`,"staff"],["153","get",`/api/v1/pets/${integrationTestIds.petId}/medical-exams/${integrationTestIds.clinicalExamId}`,"staff"],["156","get",`/api/v1/pets/${integrationTestIds.petId}/vaccinations`,"staff"],["159","get",`/api/v1/pets/${integrationTestIds.petId}/spa-history`,"staff"],
    ["162","get","/api/v1/doctor/medical-records","owner"],["165","get",`/api/v1/doctor/medical-records/${integrationTestIds.petId}`,"owner"],["168","get","/api/v1/doctor/prescriptions","owner"],["171","get",`/api/v1/doctor/prescriptions/${integrationTestIds.prescriptionId}`,"owner"],["174","get","/api/v1/doctor/follow-ups","owner"],["177","get",`/api/v1/doctor/follow-ups/${integrationTestIds.followUpId}`,"owner"],
  ] as const;
  it.each(cases)("INTX-CLINICAL-%s - rejects missing token and wrong role",async(_id,method,path,role)=>{expect((await request(app)[method](path)).status).toBe(401); expect((await request(app)[method](path).set("Authorization",`Bearer ${role==="staff"?staff:owner}`)).status).toBe(403);});
});
