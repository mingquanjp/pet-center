import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";

describe("health API integration", () => {
  it("INTX-HEALTH-216 - GET /health checks API status", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({ status: "ok" });
  });

  it("INTX-HEALTH-217 - GET /db/health checks database health status", async () => {
    const response = await request(app).get("/api/v1/db/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.database).toBe("connected");
    expect(response.body.data).toHaveProperty("now");
  });
});
