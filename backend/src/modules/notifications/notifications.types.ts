export type NotificationChannel = "app" | "email" | "sms";

export type NotificationStatus = "unread" | "read" | "failed";

export type NotificationType =
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_REJECTED"
  | "APPOINTMENT_REMINDER_1_DAY"
  | "GROOMING_CREATED"
  | "GROOMING_ACCEPTED"
  | "GROOMING_COMPLETED"
  | "BOARDING_CREATED"
  | "BOARDING_CONFIRMED"
  | "BOARDING_REJECTED"
  | "BOARDING_CANCELLED"
  | "BOARDING_CHECKIN_REMINDER_1_DAY"
  | "BOARDING_CHECKED_IN"
  | "BOARDING_UPDATE_CREATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "MEDICAL_EXAM_COMPLETED";

export interface CreateNotificationPayload {
  receiverUserId: string;
  title: string;
  message: string;
  deliveryChannel?: NotificationChannel;
  notificationType: NotificationType;
  relatedObjectType?: string;
  relatedObjectId?: string;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
}

export interface NotificationDto {
  id: string;
  receiverUserId: string;
  title: string;
  message: string;
  deliveryChannel: NotificationChannel;
  notificationType: NotificationType | null;
  createdAt: string;
  notificationStatus: NotificationStatus;
  readAt: string | null;
  relatedObjectType: string | null;
  relatedObjectId: string | null;
  metadata: Record<string, unknown>;
}

export interface NotificationRow {
  notification_id: string;
  receiver_user_id: string;
  title: string;
  message: string;
  delivery_channel: NotificationChannel;
  notification_status: NotificationStatus;
  related_object_type: string | null;
  related_object_id: string | null;
  notification_type: string | null;
  read_at: string | null;
  metadata: Record<string, unknown>;
  dedupe_key: string | null;
  created_at: string;
}

export interface NotificationFilters {
  status?: "all" | "unread" | "read";
  page?: number;
  limit?: number;
}
