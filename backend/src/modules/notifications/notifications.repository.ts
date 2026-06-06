import { query } from "../../db/query.js";
import type { NotificationRow, NotificationFilters } from "./notifications.types.js";
import { createId } from "../../shared/utils/id.js";

export async function createNotification(
  payload: {
    receiverUserId: string;
    title: string;
    message: string;
    deliveryChannel: string;
    notificationType: string;
    relatedObjectType?: string;
    relatedObjectId?: string;
    metadata?: Record<string, unknown>;
    dedupeKey?: string;
  }
): Promise<NotificationRow> {
  const id = createId("noti");
  
  const result = await query<NotificationRow>(
    `
      INSERT INTO pet_center.notifications (
        notification_id,
        receiver_user_id,
        title,
        message,
        delivery_channel,
        notification_type,
        related_object_type,
        related_object_id,
        metadata,
        dedupe_key
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
    [
      id,
      payload.receiverUserId,
      payload.title,
      payload.message,
      payload.deliveryChannel,
      payload.notificationType,
      payload.relatedObjectType ?? null,
      payload.relatedObjectId ?? null,
      payload.metadata ?? {},
      payload.dedupeKey ?? null,
    ]
  );
  return result.rows[0];
}

export async function getNotificationByDedupeKey(dedupeKey: string): Promise<NotificationRow | null> {
  const result = await query<NotificationRow>(
    `SELECT * FROM pet_center.notifications WHERE dedupe_key = $1 LIMIT 1`,
    [dedupeKey]
  );
  return result.rows[0] || null;
}

export async function listUserNotifications(userId: string, filters: NotificationFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;
  const params: unknown[] = [userId];
  
  let statusClause = "";
  if (filters.status === "unread") {
    statusClause = "AND notification_status = 'unread'";
  } else if (filters.status === "read") {
    statusClause = "AND notification_status = 'read'";
  }
  
  params.push(limit, offset);
  
  const [dataResult, countResult] = await Promise.all([
    query<NotificationRow>(
      `
        SELECT * FROM pet_center.notifications
        WHERE receiver_user_id = $1 ${statusClause}
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      params
    ),
    query<{ total: string }>(
      `
        SELECT COUNT(*)::text as total FROM pet_center.notifications
        WHERE receiver_user_id = $1 ${statusClause}
      `,
      [userId]
    )
  ]);
  
  return {
    items: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total ?? "0", 10),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total ?? "0", 10) / limit)
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text as count 
      FROM pet_center.notifications
      WHERE receiver_user_id = $1 AND notification_status = 'unread'
    `,
    [userId]
  );
  return parseInt(result.rows[0]?.count ?? "0", 10);
}

export async function markAsRead(notificationId: string, userId: string): Promise<NotificationRow | null> {
  const result = await query<NotificationRow>(
    `
      UPDATE pet_center.notifications
      SET notification_status = 'read', read_at = now()
      WHERE notification_id = $1 AND receiver_user_id = $2
      RETURNING *
    `,
    [notificationId, userId]
  );
  return result.rows[0] || null;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await query(
    `
      UPDATE pet_center.notifications
      SET notification_status = 'read', read_at = now()
      WHERE receiver_user_id = $1 AND notification_status = 'unread'
    `,
    [userId]
  );
  return result.rowCount ?? 0;
}
