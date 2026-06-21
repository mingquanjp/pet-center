import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";

describe("notifications authorization integration", () => {
  const endpoints = [
    ["INTX-NOTIFICATIONS-262", "get", "/api/v1/notifications"],
    ["INTX-NOTIFICATIONS-264", "get", "/api/v1/notifications/unread-count"],
    ["INTX-NOTIFICATIONS-266", "patch", "/api/v1/notifications/read-all"],
    ["INTX-NOTIFICATIONS-269", "patch", "/api/v1/notifications/it_notif_001/read"]
  ] as const;

  it.each(endpoints)("%s - rejects unauthenticated request to %s %s", async (_id, method, path) => {
    const response = await request(app)[method](path);
    expect(response.status).toBe(401);
  });
});
