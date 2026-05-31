export type OwnerDashboardPet = {
  petId: string;
  petName: string;
  speciesLabel: string;
  breed: string | null;
  ageLabel: string;
  profileImageUrl: string | null;
  displayStatus: "healthy" | "watching" | "boarding" | "inactive" | "deceased";
  displayStatusLabel: string;
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

export type OwnerDashboardDto = {
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

export type StaffDashboardStatDto = {
  pendingAppointments: number;
  pendingGroomingTickets: number;
  availableRooms: number;
  totalRooms: number;
  todayInvoices: number;
};

export type StaffDashboardTaskSource = "medical" | "grooming";

export type StaffDashboardAppointmentTaskDto = {
  taskId: string;
  code: string;
  sourceType: StaffDashboardTaskSource;
  petName: string;
  petDescription: string;
  ownerName: string;
  scheduledAt: string;
  typeLabel: string;
  status: "pending";
  statusLabel: string;
};

export type StaffDashboardOverviewDto = {
  staff: {
    fullName: string;
    initials: string;
    roleLabel: string;
  };
  stats: StaffDashboardStatDto;
  appointmentTasks: StaffDashboardAppointmentTaskDto[];
};
