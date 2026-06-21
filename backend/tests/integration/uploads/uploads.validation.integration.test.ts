import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

describe("uploads validation and errors integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-UPLOADS-349 - POST /uploads/image rejects missing file and invalid format", async () => {
    const token = await loginAsOwner();

    // 1. Missing file
    const res1 = await request(app)
      .post("/api/v1/uploads/image")
      .set("Authorization", `Bearer ${token}`);
    expect(res1.status).toBe(400);

    // 2. Invalid mimetype
    const res2 = await request(app)
      .post("/api/v1/uploads/image")
      .attach("file", Buffer.from("dummy"), "document.txt")
      .set("Authorization", `Bearer ${token}`);
    expect(res2.status).toBe(400);
  });

  it("INTX-UPLOADS-352 - POST /uploads/file rejects missing file and invalid format", async () => {
    const token = await loginAsOwner();

    // 1. Missing file
    const res1 = await request(app)
      .post("/api/v1/uploads/file")
      .set("Authorization", `Bearer ${token}`);
    expect(res1.status).toBe(400);

    // 2. Invalid mimetype (e.g., zip)
    const res2 = await request(app)
      .post("/api/v1/uploads/file")
      .attach("file", Buffer.from("dummy"), "archive.zip")
      .set("Authorization", `Bearer ${token}`);
    expect(res2.status).toBe(400);
  });

  it("INTX-UPLOADS-355 - POST /uploads/file/view-url rejects missing or invalid URL", async () => {
    const token = await loginAsOwner();

    // 1. Missing url
    const res1 = await request(app)
      .post("/api/v1/uploads/file/view-url")
      .send({})
      .set("Authorization", `Bearer ${token}`);
    expect(res1.status).toBe(400);

    // 2. External domain URL
    const res2 = await request(app)
      .post("/api/v1/uploads/file/view-url")
      .send({ url: "https://google.com/doc.pdf" })
      .set("Authorization", `Bearer ${token}`);
    expect(res2.status).toBe(400);
  });
});
