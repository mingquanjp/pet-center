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
