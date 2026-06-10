export type NotificationChannel = "app" | "email";

export type NotificationStatus = "unread" | "read";

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

export interface AppNotification {
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
  metadata: {
    actionUrl?: string;
    petName?: string;
    appointmentCode?: string;
    groomingCode?: string;
    boardingCode?: string;
    invoiceCode?: string;
    [key: string]: unknown;
  };
}

export interface NotificationsListResponse {
  items: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
