import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";

describe("uploads authorization integration", () => {
  const endpoints = [
    ["INTX-UPLOADS-348", "post", "/api/v1/uploads/image"],
    ["INTX-UPLOADS-351", "post", "/api/v1/uploads/file"],
    ["INTX-UPLOADS-354", "post", "/api/v1/uploads/file/view-url"]
  ] as const;

  it.each(endpoints)("%s - rejects unauthenticated request to %s %s", async (_id, method, path) => {
    const response = await request(app)[method](path);
    expect(response.status).toBe(401);
  });
});
