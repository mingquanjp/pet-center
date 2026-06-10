export type OwnerDashboardPet = {
  petId: string;
  petName: string;
  speciesLabel: string;
  breed: string | null;
  ageLabel: string;
  profileImageUrl: string | null;
};

export type OwnerDashboardAppointment = {
  appointmentId: string;
  petId: string;
  petName: string;
  examTypeName: string;
  scheduledAt: string;
  appointmentStatus: "pending_payment" | "pending" | "confirmed" | "rejected" | "cancelled";
  appointmentStatusLabel: string;
};

export type OwnerDashboardActivity = {
  activityLogId: string;
  petId: string;
  petName: string;
  activityCategory: "medical" | "vaccination" | "grooming" | "boarding" | "invoice" | "payment" | "profile";
  activityType: string;
  activityStatus: "scheduled" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "failed";
  title: string;
  summary: string | null;
  occurredAt: string;
  sourceType: string;
  sourceId: string;
};

export type OwnerDashboardReminder = {
  id: string;
  petId: string;
  petName: string;
  title: string;
  dueDate: string;
  tone: "due-soon" | "overdue";
  actionHref: string;
};

export type OwnerDashboard = {
  ownerName: string;
  summary: {
    petCount: number;
    upcomingAppointmentCount: number;
    unpaidInvoiceCount: number;
    unreadNotificationCount: number;
  };
  pets: OwnerDashboardPet[];
  upcomingAppointments: OwnerDashboardAppointment[];
  recentActivities: OwnerDashboardActivity[];
  healthReminders: OwnerDashboardReminder[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
