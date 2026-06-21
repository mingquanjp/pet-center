import request from "supertest";
import { app } from "../../../src/app.js";
import { integrationTestCredentials } from "./integration-test-db.js";

async function loginAndGetToken(email: string, password: string): Promise<string> {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);

  return response.body.data.accessToken as string;
}

export function loginAsOwner(): Promise<string> {
  return loginAndGetToken(integrationTestCredentials.owner.email, integrationTestCredentials.owner.password);
}

export function loginAsStaff(): Promise<string> {
  return loginAndGetToken(integrationTestCredentials.staff.email, integrationTestCredentials.staff.password);
}

export function loginAsDoctor(): Promise<string> {
  return loginAndGetToken(integrationTestCredentials.doctor.email, integrationTestCredentials.doctor.password);
}

export function loginAsAdmin(): Promise<string> {
  return loginAndGetToken(integrationTestCredentials.admin.email, integrationTestCredentials.admin.password);
}
