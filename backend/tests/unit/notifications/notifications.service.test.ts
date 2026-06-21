import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNotification,
  notifyUser,
  notifyRole,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from "../../../src/modules/notifications/notifications.service.js";
import * as repo from "../../../src/modules/notifications/notifications.repository.js";
import { emitToUser } from "../../../src/realtime/notification.gateway.js";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";

vi.mock("../../../src/modules/notifications/notifications.repository.js");
vi.mock("../../../src/realtime/notification.gateway.js", () => ({
  emitToUser: vi.fn()
}));

const mockRepo = vi.mocked(repo);
const mockEmit = vi.mocked(emitToUser);

describe("notifications.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.getNotificationByDedupeKey.mockResolvedValue(null);
  });

  describe("createNotification", () => {
    it("UTX-NOTIFICATIONS-335 - createNotification saves to repo and emits real-time event when channel is app", async () => {
      const mockRow = {
        notification_id: "noti_1",
        receiver_user_id: "user_1",
        title: "Test Title",
        message: "Test Message",
        delivery_channel: "app",
        notification_type: "APPOINTMENT_CONFIRMED",
        created_at: new Date(),
        notification_status: "unread",
        read_at: null,
        related_object_type: "medical_appointment",
        related_object_id: "appt_1",
        metadata: { foo: "bar" },
        dedupe_key: null
      };

      mockRepo.createNotification.mockResolvedValue(mockRow as any);

      const payload = {
        receiverUserId: "user_1",
        title: "Test Title",
        message: "Test Message",
        deliveryChannel: "app" as const,
        notificationType: "APPOINTMENT_CONFIRMED",
        relatedObjectType: "medical_appointment",
        relatedObjectId: "appt_1",
        metadata: { foo: "bar" }
      };

      const result = await createNotification(payload);

      expect(mockRepo.createNotification).toHaveBeenCalledWith({
        receiverUserId: "user_1",
        title: "Test Title",
        message: "Test Message",
        deliveryChannel: "app",
        notificationType: "APPOINTMENT_CONFIRMED",
        relatedObjectType: "medical_appointment",
        relatedObjectId: "appt_1",
        metadata: { foo: "bar" },
        dedupeKey: undefined
      });

      expect(mockEmit).toHaveBeenCalledWith("user_1", "notification:new", result);
      expect(result.id).toBe("noti_1");
    });

    it("UTX-NOTIFICATIONS-336 - createNotification returns existing notification if dedupeKey matches", async () => {
      const mockRow = {
        notification_id: "noti_1",
        receiver_user_id: "user_1",
        title: "Test Title",
        message: "Test Message",
        delivery_channel: "app",
        notification_type: "APPOINTMENT_CONFIRMED",
        created_at: new Date(),
        notification_status: "unread",
        read_at: null,
        related_object_type: "medical_appointment",
        related_object_id: "appt_1",
        metadata: { foo: "bar" },
        dedupe_key: "dedupe_123"
      };

      mockRepo.getNotificationByDedupeKey.mockResolvedValue(mockRow as any);

      const payload = {
        receiverUserId: "user_1",
        title: "Test Title",
        message: "Test Message",
        deliveryChannel: "app" as const,
        notificationType: "APPOINTMENT_CONFIRMED",
        dedupeKey: "dedupe_123"
      };

      const result = await createNotification(payload);

      expect(mockRepo.getNotificationByDedupeKey).toHaveBeenCalledWith("dedupe_123");
      expect(mockRepo.createNotification).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
      expect(result.id).toBe("noti_1");
    });
  });

  describe("notifyUser", () => {
    it("UTX-NOTIFICATIONS-337 - notifyUser calls createNotification with receiverUserId", async () => {
      const mockRow = {
        notification_id: "noti_1",
        receiver_user_id: "user_1",
        title: "User Title",
        message: "User Message",
        delivery_channel: "app"
      };
      mockRepo.createNotification.mockResolvedValue(mockRow as any);

      const result = await notifyUser("user_1", {
        title: "User Title",
        message: "User Message",
        notificationType: "INFO"
      });

      expect(mockRepo.createNotification).toHaveBeenCalled();
      expect(result.receiverUserId).toBe("user_1");
    });

    it("UTX-NOTIFICATIONS-338 - notifyUser handles empty parameters correctly", async () => {
      const mockRow = {
        notification_id: "noti_1",
        receiver_user_id: "user_1",
        title: "",
        message: "",
        delivery_channel: "app"
      };
      mockRepo.createNotification.mockResolvedValue(mockRow as any);

      const result = await notifyUser("user_1", {
        title: "",
        message: "",
        notificationType: "INFO"
      });

      expect(result.title).toBe("");
    });
  });

  describe("notifyRole", () => {
    it("UTX-NOTIFICATIONS-339 - notifyRole retrieves active users and creates notifications for each with dedupe suffix", async () => {
      mockRepo.getActiveUsersByRole.mockResolvedValue(["user_1", "user_2"]);
      mockRepo.createNotification.mockImplementation(async (payload) => ({
        notification_id: `noti_${payload.receiverUserId}`,
        receiver_user_id: payload.receiverUserId,
        title: payload.title,
        message: payload.message,
        dedupe_key: payload.dedupeKey
      } as any));

      await notifyRole("Staff", {
        title: "Role Alert",
        message: "Check scheduling",
        notificationType: "ALERT",
        dedupeKey: "role_alert_key"
      });

      expect(mockRepo.getActiveUsersByRole).toHaveBeenCalledWith("Staff");
      expect(mockRepo.createNotification).toHaveBeenCalledTimes(2);
      expect(mockRepo.createNotification).toHaveBeenNthCalledWith(1, expect.objectContaining({
        receiverUserId: "user_1",
        dedupeKey: "role_alert_key:user_1"
      }));
      expect(mockRepo.createNotification).toHaveBeenNthCalledWith(2, expect.objectContaining({
        receiverUserId: "user_2",
        dedupeKey: "role_alert_key:user_2"
      }));
    });

    it("UTX-NOTIFICATIONS-340 - notifyRole completes successfully when no active users are found", async () => {
      mockRepo.getActiveUsersByRole.mockResolvedValue([]);

      await notifyRole("Doctor", {
        title: "Doctor Alert",
        message: "No doctor found",
        notificationType: "ALERT"
      });

      expect(mockRepo.createNotification).not.toHaveBeenCalled();
    });
  });

  describe("getNotifications", () => {
    it("UTX-NOTIFICATIONS-341 - getNotifications returns mapped items and pagination metadata", async () => {
      const mockResult = {
        items: [
          {
            notification_id: "noti_1",
            receiver_user_id: "user_1",
            title: "T1",
            message: "M1",
            delivery_channel: "app",
            notification_type: "INFO",
            created_at: new Date(),
            notification_status: "unread"
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      mockRepo.listUserNotifications.mockResolvedValue(mockResult as any);

      const result = await getNotifications("user_1", { page: 1, limit: 10, status: "unread" });

      expect(mockRepo.listUserNotifications).toHaveBeenCalledWith("user_1", { page: 1, limit: 10, status: "unread" });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("noti_1");
    });

    it("UTX-NOTIFICATIONS-342 - getNotifications handles empty database response correctly", async () => {
      mockRepo.listUserNotifications.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      });

      const result = await getNotifications("user_1", {});

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getUnreadCount", () => {
    it("UTX-NOTIFICATIONS-343 - getUnreadCount returns correct unread count object", async () => {
      mockRepo.getUnreadCount.mockResolvedValue(5);

      const result = await getUnreadCount("user_1");

      expect(mockRepo.getUnreadCount).toHaveBeenCalledWith("user_1");
      expect(result).toEqual({ count: 5 });
    });

    it("UTX-NOTIFICATIONS-344 - getUnreadCount returns count 0 when no unread notifications exist", async () => {
      mockRepo.getUnreadCount.mockResolvedValue(0);

      const result = await getUnreadCount("user_1");

      expect(result).toEqual({ count: 0 });
    });
  });

  describe("markAsRead", () => {
    it("UTX-NOTIFICATIONS-345 - markAsRead updates notification status and returns mapped DTO", async () => {
      const mockRow = {
        notification_id: "noti_1",
        receiver_user_id: "user_1",
        title: "T1",
        message: "M1",
        delivery_channel: "app",
        notification_status: "read",
        read_at: new Date()
      };

      mockRepo.markAsRead.mockResolvedValue(mockRow as any);

      const result = await markAsRead("noti_1", "user_1");

      expect(mockRepo.markAsRead).toHaveBeenCalledWith("noti_1", "user_1");
      expect(result.notificationStatus).toBe("read");
      expect(result.readAt).toBeDefined();
    });

    it("UTX-NOTIFICATIONS-346 - markAsRead throws 404 AppError when notification is not found or user unauthorized", async () => {
      mockRepo.markAsRead.mockResolvedValue(null);

      await expect(markAsRead("noti_1", "user_1")).rejects.toThrow(
        new AppError("Không tìm thấy thông báo hoặc không có quyền truy cập", "NOT_FOUND", httpStatus.NOT_FOUND)
      );
    });
  });

  describe("markAllAsRead", () => {
    it("UTX-NOTIFICATIONS-347 - markAllAsRead updates all unread notifications to read and returns updatedCount", async () => {
      mockRepo.markAllAsRead.mockResolvedValue(10);

      const result = await markAllAsRead("user_1");

      expect(mockRepo.markAllAsRead).toHaveBeenCalledWith("user_1");
      expect(result).toEqual({ updatedCount: 10 });
    });

    it("UTX-NOTIFICATIONS-348 - markAllAsRead returns updatedCount 0 when no notifications are updated", async () => {
      mockRepo.markAllAsRead.mockResolvedValue(0);

      const result = await markAllAsRead("user_1");

      expect(result).toEqual({ updatedCount: 0 });
    });
  });
});
