import * as repo from "./notifications.repository.js";
import type { CreateNotificationPayload, NotificationDto, NotificationFilters, NotificationRow } from "./notifications.types.js";
import { emitToUser } from "../../realtime/notification.gateway.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";

function mapToDto(row: NotificationRow): NotificationDto {
  return {
    id: row.notification_id,
    receiverUserId: row.receiver_user_id,
    title: row.title,
    message: row.message,
    deliveryChannel: row.delivery_channel,
    notificationType: (row.notification_type as any) || null,
    createdAt: row.created_at,
    notificationStatus: row.notification_status,
    readAt: row.read_at,
    relatedObjectType: row.related_object_type,
    relatedObjectId: row.related_object_id,
    metadata: row.metadata,
  };
}

export async function createNotification(payload: CreateNotificationPayload): Promise<NotificationDto> {
  if (payload.dedupeKey) {
    const existing = await repo.getNotificationByDedupeKey(payload.dedupeKey);
    if (existing) {
      return mapToDto(existing);
    }
  }

  const deliveryChannel = payload.deliveryChannel ?? "app";
  
  const row = await repo.createNotification({
    receiverUserId: payload.receiverUserId,
    title: payload.title,
    message: payload.message,
    deliveryChannel,
    notificationType: payload.notificationType,
    relatedObjectType: payload.relatedObjectType,
    relatedObjectId: payload.relatedObjectId,
    metadata: payload.metadata,
    dedupeKey: payload.dedupeKey,
  });

  const dto = mapToDto(row);

  if (deliveryChannel === "app" || deliveryChannel === "email") {
    // Both app and email notifications can trigger an app notification bell (if we want)
    // Actually the logic is: if we save it to DB, we emit.
    emitToUser(payload.receiverUserId, "notification:new", dto);
  }

  return dto;
}

export async function notifyUser(userId: string, payload: Omit<CreateNotificationPayload, "receiverUserId">) {
  return createNotification({
    ...payload,
    receiverUserId: userId
  });
}

export async function notifyRole(role: "Owner" | "Staff" | "Doctor" | "Admin", payload: Omit<CreateNotificationPayload, "receiverUserId">) {
  const userIds = await repo.getActiveUsersByRole(role);
  
  const promises = userIds.map(userId => 
    createNotification({
      ...payload,
      receiverUserId: userId,
      dedupeKey: payload.dedupeKey ? `${payload.dedupeKey}:${userId}` : undefined
    })
  );
  
  await Promise.allSettled(promises);
}

export async function getNotifications(userId: string, filters: NotificationFilters) {
  const result = await repo.listUserNotifications(userId, filters);
  return {
    ...result,
    items: result.items.map(mapToDto)
  };
}

export async function getUnreadCount(userId: string) {
  const count = await repo.getUnreadCount(userId);
  return { count };
}

export async function markAsRead(notificationId: string, userId: string) {
  const row = await repo.markAsRead(notificationId, userId);
  if (!row) {
    throw new AppError("Không tìm thấy thông báo hoặc không có quyền truy cập", "NOT_FOUND", httpStatus.NOT_FOUND);
  }
  return mapToDto(row);
}

export async function markAllAsRead(userId: string) {
  const updatedCount = await repo.markAllAsRead(userId);
  return { updatedCount };
}
