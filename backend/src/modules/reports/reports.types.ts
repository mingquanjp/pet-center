export type AdminReportTab =
  | "ALL"
  | "REVENUE"
  | "SERVICES"
  | "BOARDING"
  | "MEDICAL"
  | "CUSTOMERS";

export type ReportTimeRange =
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "THIS_QUARTER"
  | "THIS_YEAR"
  | "CUSTOM";

export type ReportCompareMode =
  | "NONE"
  | "PREVIOUS_PERIOD"
  | "SAME_PERIOD_LAST_MONTH";

export type ReportGroupBy =
  | "DAY"
  | "WEEK"
  | "MONTH";

export type ReportPaymentMethodGroup =
  | "ALL"
  | "ONLINE"
  | "COUNTER";

export interface AdminReportQueryDto {
  timeRange: ReportTimeRange;
  compareMode: ReportCompareMode;
  groupBy: ReportGroupBy;
  paymentMethodGroup: ReportPaymentMethodGroup;
  fromDate?: string;
  toDate?: string;
  tab?: AdminReportTab;
}

export interface ReportPeriodDto {
  from: string;
  to: string;
  label: string;
}

export interface ReportMetricDto {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label: string;
  };
}

export interface RevenueTrendPointDto {
  label: string;
  revenue: number;
  previousRevenue?: number;
}

export interface RevenueSourceItemDto {
  sourceType: "medical_exam" | "grooming" | "boarding" | "prescription";
  label: string;
  invoiceCount: number;
  revenue: number;
  percentage: number;
  changePercent?: number | null;
}

export interface StatusCountItemDto {
  status: string;
  label: string;
  count: number;
  percentage?: number;
}

export interface ServicePerformanceItemDto {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  completedCount: number;
  cancelledCount: number;
  revenue: number;
  completionRate: number;
  changePercent?: number | null;
}

export interface BoardingRoomReportItemDto {
  roomTypeId: string;
  roomTypeName: string;
  capacity: number;
  currentOccupancy: number;
  availableSlots: number;
  occupancyRate: number;
  bookingCount: number;
  revenue: number;
  changePercent?: number | null;
}

export interface DoctorPerformanceItemDto {
  doctorId: string;
  doctorName: string;
  assignedAppointments: number;
  medicalExamCount: number;
  prescriptionCount: number;
  completionRate: number;
  changePercent?: number | null;
}

export interface AdminReportsDataDto {
  filters: AdminReportQueryDto;
  period: {
    current: ReportPeriodDto;
    previous: ReportPeriodDto | null;
  };
  revenue: {
    metrics: ReportMetricDto[];
    trend: RevenueTrendPointDto[];
    sourceBreakdown: RevenueSourceItemDto[];
  };
  services: {
    metrics: ReportMetricDto[];
    statusCounts: StatusCountItemDto[];
    topServices: ServicePerformanceItemDto[];
  };
  boarding: {
    metrics: ReportMetricDto[];
    statusCounts: StatusCountItemDto[];
    roomOccupancy: BoardingRoomReportItemDto[];
  };
  medical: {
    metrics: ReportMetricDto[];
    appointmentStatusCounts: StatusCountItemDto[];
    examTypeCounts: StatusCountItemDto[];
    doctorPerformance: DoctorPerformanceItemDto[];
  };
  customers: {
    metrics: ReportMetricDto[];
    userRoleCounts: StatusCountItemDto[];
    petSpeciesCounts: StatusCountItemDto[];
    accountStatusCounts: StatusCountItemDto[];
  };
}
