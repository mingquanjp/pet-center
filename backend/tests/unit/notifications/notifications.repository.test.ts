import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  createNotification,
  getNotificationByDedupeKey,
  listUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getActiveUsersByRole
} from "../../../src/modules/notifications/notifications.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn()
}));

vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("mock-noti-id")
}));

const mockQuery = vi.mocked(query);

describe("notifications.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNotification", () => {
    it("UTX-NOTIFICATIONS-349 - createNotification generates parameterized insert query and returns created row", async () => {
      const mockRow = { notification_id: "noti_123", title: "Test" };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await createNotification({
        receiverUserId: "user_1",
        title: "Hello",
        message: "World",
        deliveryChannel: "app",
        notificationType: "INFO",
        relatedObjectType: "medical_appointment",
        relatedObjectId: "appt_1",
        metadata: { a: 1 },
        dedupeKey: "key_1"
      });

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("INSERT INTO pet_center.notifications");
      expect(params).toContain("user_1");
      expect(params).toContain("Hello");
      expect(params).toContain("World");
      expect(params).toContain("app");
      expect(params).toContain("INFO");
      expect(params).toContain("medical_appointment");
      expect(params).toContain("appt_1");
      expect(params).toContain("key_1");
      expect(result).toEqual(mockRow);
    });

    it("UTX-NOTIFICATIONS-350 - createNotification propagates database insert errors", async () => {
      mockQuery.mockRejectedValue(new Error("Insert conflict"));

      await expect(createNotification({
        receiverUserId: "user_1",
        title: "Hello",
        message: "World",
        deliveryChannel: "app",
        notificationType: "INFO"
      })).rejects.toThrow("Insert conflict");
    });
  });

  describe("getNotificationByDedupeKey", () => {
    it("UTX-NOTIFICATIONS-351 - getNotificationByDedupeKey executes select query and returns matched row", async () => {
      const mockRow = { notification_id: "noti_1", dedupe_key: "key_1" };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await getNotificationByDedupeKey("key_1");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM pet_center.notifications WHERE dedupe_key = $1"),
        ["key_1"]
      );
      expect(result).toEqual(mockRow);
    });

    it("UTX-NOTIFICATIONS-352 - getNotificationByDedupeKey returns null when no matching row is found", async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getNotificationByDedupeKey("non_existent");

      expect(result).toBeNull();
    });
  });

  describe("listUserNotifications", () => {
    it("UTX-NOTIFICATIONS-353 - listUserNotifications builds parameterized list and count queries with filters", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ notification_id: "noti_1", receiver_user_id: "user_1" }]
      } as any); // data query
      mockQuery.mockResolvedValueOnce({
        rows: [{ total: "1" }]
      } as any); // count query

      const result = await listUserNotifications("user_1", {
        page: 2,
        limit: 10,
        status: "unread"
      });

      expect(mockQuery).toHaveBeenCalledTimes(2);

      const [dataSql, dataParams] = mockQuery.mock.calls[0];
      expect(dataSql).toContain("SELECT * FROM pet_center.notifications");
      expect(dataSql).toContain("notification_status = 'unread'");
      expect(dataParams).toEqual(["user_1", 10, 10]);

      const [countSql, countParams] = mockQuery.mock.calls[1];
      expect(countSql).toContain("SELECT COUNT(*)::text as total");
      expect(countSql).toContain("notification_status = 'unread'");
      expect(countParams).toEqual(["user_1"]);

      expect(result).toEqual({
        items: [{ notification_id: "noti_1", receiver_user_id: "user_1" }],
        total: 1,
        page: 2,
        limit: 10,
        totalPages: 1
      });
    });

    it("UTX-NOTIFICATIONS-354 - listUserNotifications handles query errors and rejects promise", async () => {
      mockQuery.mockRejectedValue(new Error("Connection error"));

      await expect(listUserNotifications("user_1", {})).rejects.toThrow("Connection error");
    });
  });

  describe("getUnreadCount & markAsRead & markAllAsRead & getActiveUsersByRole", () => {
    it("UTX-NOTIFICATIONS-355 - getUnreadCount and markAsRead execute correct query structures", async () => {
      // 1. getUnreadCount
      mockQuery.mockResolvedValueOnce({ rows: [{ count: "3" }] } as any);
      const count = await getUnreadCount("user_1");
      expect(mockQuery).toHaveBeenLastCalledWith(
        expect.stringContaining("receiver_user_id = $1 AND notification_status = 'unread'"),
        ["user_1"]
      );
      expect(count).toBe(3);

      // 2. markAsRead
      const mockRow = { notification_id: "noti_1", notification_status: "read" };
      mockQuery.mockResolvedValueOnce({ rows: [mockRow] } as any);
      const readRow = await markAsRead("noti_1", "user_1");
      expect(mockQuery).toHaveBeenCalled();
      const calls = mockQuery.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toContain("UPDATE pet_center.notifications");
      expect(lastCall[0]).toContain("notification_status = 'read'");
      expect(lastCall[1]).toEqual(["noti_1", "user_1"]);
      expect(readRow).toEqual(mockRow);

      // 3. markAllAsRead
      mockQuery.mockResolvedValueOnce({ rowCount: 4 } as any);
      const markedCount = await markAllAsRead("user_1");
      expect(mockQuery).toHaveBeenCalled();
      const callsAfterMarkAll = mockQuery.mock.calls;
      const markAllCall = callsAfterMarkAll[callsAfterMarkAll.length - 1];
      expect(markAllCall[0]).toContain("UPDATE pet_center.notifications");
      expect(markAllCall[0]).toContain("receiver_user_id = $1");
      expect(markAllCall[1]).toEqual(["user_1"]);
      expect(markedCount).toBe(4);

      // 4. getActiveUsersByRole
      mockQuery.mockResolvedValueOnce({ rows: [{ user_id: "u_1" }, { user_id: "u_2" }] } as any);
      const users = await getActiveUsersByRole("Staff");
      expect(mockQuery).toHaveBeenLastCalledWith(
        expect.stringContaining("SELECT user_id FROM pet_center.users WHERE role = $1 AND account_status = 'active'"),
        ["Staff"]
      );
      expect(users).toEqual(["u_1", "u_2"]);
    });

    it("UTX-NOTIFICATIONS-356 - markAsRead and markAllAsRead propagate database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Update failed"));

      await expect(markAsRead("noti_1", "user_1")).rejects.toThrow("Update failed");
      await expect(markAllAsRead("user_1")).rejects.toThrow("Update failed");
    });
  });
});
