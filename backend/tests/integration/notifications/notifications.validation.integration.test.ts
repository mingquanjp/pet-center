import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";

describe("notifications validation and errors integration", () => {
  beforeEach(seedIntegrationTestData);
  afterAll(cleanupIntegrationTestData);

  it("INTX-NOTIFICATIONS-267 - PATCH /notifications/read-all handles dummy parameters gracefully", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .patch("/api/v1/notifications/read-all")
      .query({ extra: "dummy" })
      .send({ extra: "dummy" })
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("INTX-NOTIFICATIONS-270 - PATCH /notifications/:notificationId/read returns 404 for non-existent notification", async () => {
    const token = await loginAsOwner();
    const response = await request(app)
      .patch("/api/v1/notifications/it_missing_notif/read")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
  });
});
