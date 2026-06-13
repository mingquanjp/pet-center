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

export type DoctorExamStatusDto = "WAITING" | "EXAMINING";

export type DoctorDashboardStatDto = {
  todayExamCount: number;
  waitingExamCount: number;
  inProgressExamCount: number;
  followUpCount: number;
};

export type DoctorAssignedExamDto = {
  id: string;
  examId: string;
  examinationCode: string;
  appointmentCode: string;
  examCode: string;
  pet: {
    id: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    ageText?: string;
    avatarUrl: string | null;
    imageUrl?: string;
    description: string;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  scheduledAt: string;
  scheduledTime: string;
  examType: {
    id: string;
    code: string;
    name: string;
  };
  status: DoctorExamStatusDto;
};

export type DoctorRecentActivityDto = {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
  note?: string;
  tag?: string;
  type: "MEDICAL_RECORD" | "SURGERY_REQUEST" | "PRESCRIPTION" | "FOLLOW_UP";
};

export type DoctorDashboardOverviewDto = {
  doctor: {
    id: string;
    fullName: string;
    roleLabel: string;
    avatarUrl?: string;
  };
  stats: DoctorDashboardStatDto;
  assignedExams: DoctorAssignedExamDto[];
  recentActivities: DoctorRecentActivityDto[];
};

export type AdminDashboardStatDto = {
  totalUsers: number;
  totalPets: number;
  medicalAppointments: number;
  currentBoardingPets: number;
  totalBoardingCapacity: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  medicineRevenue: number;
  bookingRate: number;
};

export type AdminDashboardTrendDto = {
  totalUsers: number | null;
  totalPets: number | null;
  monthlyRevenue: number | null;
  bookingRate: number | null;
};

export type AdminDashboardRevenuePointDto = {
  label: string;
  revenue: number;
};

export type AdminDashboardServiceRevenueDto = {
  category: "medical" | "grooming" | "boarding" | "medicine" | "other";
  label: string;
  revenue: number;
  percentage: number;
};

export type AdminDashboardRecentActivityDto = {
  activityLogId: string;
  occurredAt: string;
  code: string;
  customerName: string;
  petName: string | null;
  action: string;
  status: string;
  statusLabel: string;
  category: string;
  sourceType: string;
  sourceId: string;
};

export type AdminDashboardAlertDto = {
  id: string;
  type: "boarding_capacity" | "payment_failed" | "appointment_delay" | "medicine_inventory";
  severity: "info" | "warning" | "danger";
  title: string;
  description: string;
  sourceType: string | null;
  sourceId: string | null;
  occurredAt: string | null;
};

export type AdminDashboardOverviewDto = {
  range: {
    startDate: string;
    endDate: string;
  };
  stats: AdminDashboardStatDto;
  trends: AdminDashboardTrendDto;
  revenueTrend: AdminDashboardRevenuePointDto[];
  serviceRevenue: AdminDashboardServiceRevenueDto[];
  recentActivities: AdminDashboardRecentActivityDto[];
  operationAlerts: AdminDashboardAlertDto[];
};
