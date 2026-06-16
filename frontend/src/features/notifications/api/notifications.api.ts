import { apiRequest } from "@/lib/api";
import type { AppNotification, NotificationsListResponse } from "../types/notification.types";

export async function getNotifications(params?: {
  status?: "all" | "unread" | "read";
  page?: number;
  limit?: number;
}): Promise<NotificationsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const queryStr = searchParams.toString();
  const path = queryStr ? `/notifications?${queryStr}` : "/notifications";

  const response = await apiRequest<NotificationsListResponse>(path);
  return response.data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await apiRequest<{ count: number }>("/notifications/unread-count");
  return response.data;
}

export async function markAsRead(notificationId: string): Promise<AppNotification> {
  const response = await apiRequest<AppNotification>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
  return response.data;
}

export async function markAllAsRead(): Promise<{ updatedCount?: number }> {
  const response = await apiRequest<{ updatedCount?: number }>("/notifications/read-all", {
    method: "PATCH",
  });
  return response.data;
}
