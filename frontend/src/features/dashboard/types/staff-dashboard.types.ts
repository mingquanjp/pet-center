export type StaffDashboardTaskSource = "medical" | "grooming";

export type StaffDashboardOverview = {
  staff: {
    fullName: string;
    initials: string;
    roleLabel: string;
  };
  stats: {
    pendingAppointments: number;
    pendingGroomingTickets: number;
    availableRooms: number;
    totalRooms: number;
    todayInvoices: number;
  };
  appointmentTasks: Array<{
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
  }>;
};
