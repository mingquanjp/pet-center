import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../src/app.js";
import { cleanupIntegrationTestData, integrationTestIds, seedIntegrationTestData } from "../helpers/integration-test-db.js";
import { loginAsOwner } from "../helpers/integration-test-auth.js";
import { pool } from "../../../src/db/pool.js";

describe("notifications happy path API integration", () => {
  beforeEach(async () => {
    await seedIntegrationTestData();
    // Insert a dummy notification for the owner user
    await pool.query(`
      INSERT INTO pet_center.notifications (
        notification_id, receiver_user_id, title, message, delivery_channel, notification_status
      ) VALUES (
        'it_notif_001', $1, 'Test Title', 'Test Message', 'app', 'unread'
      )
    `, [integrationTestIds.ownerUserId]);
  });

  afterAll(cleanupIntegrationTestData);

  it("INTX-NOTIFICATIONS-261 - owner gets all notifications", async () => {
    const token = await loginAsOwner();
    const response = await request(app).get("/api/v1/notifications").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.items[0]).toMatchObject({
      id: "it_notif_001",
      receiverUserId: integrationTestIds.ownerUserId,
      title: "Test Title",
      message: "Test Message",
      notificationStatus: "unread"
    });
  });

  it("INTX-NOTIFICATIONS-263 - owner gets unread count", async () => {
    const token = await loginAsOwner();
    const response = await request(app).get("/api/v1/notifications/unread-count").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({ count: 1 });
  });

  it("INTX-NOTIFICATIONS-268 - owner marks notification as read", async () => {
    const token = await loginAsOwner();
    const response = await request(app).patch("/api/v1/notifications/it_notif_001/read").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notificationStatus).toBe("read");

    // Verify unread count is now 0
    const countResponse = await request(app).get("/api/v1/notifications/unread-count").set("Authorization", `Bearer ${token}`);
    expect(countResponse.body.data.count).toBe(0);
  });

  it("INTX-NOTIFICATIONS-265 - owner marks all notifications as read", async () => {
    const token = await loginAsOwner();
    // Add another unread notification first
    await pool.query(`
      INSERT INTO pet_center.notifications (
        notification_id, receiver_user_id, title, message, delivery_channel, notification_status
      ) VALUES (
        'it_notif_002', $1, 'Test Title 2', 'Test Message 2', 'app', 'unread'
      )
    `, [integrationTestIds.ownerUserId]);

    const response = await request(app).patch("/api/v1/notifications/read-all").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({ updatedCount: 2 });

    const countResponse = await request(app).get("/api/v1/notifications/unread-count").set("Authorization", `Bearer ${token}`);
    expect(countResponse.body.data.count).toBe(0);
  });
});
