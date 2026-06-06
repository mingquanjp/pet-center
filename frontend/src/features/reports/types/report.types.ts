export type AdminReportTab =
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

export interface AdminReportFilters {
  timeRange: ReportTimeRange;
  compareMode: ReportCompareMode;
  groupBy: ReportGroupBy;
  paymentMethodGroup: ReportPaymentMethodGroup;
  fromDate?: string;
  toDate?: string;
  tab?: AdminReportTab;
}

export interface ReportMetric {
  id: string;
  label: string;
  value: string;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label: string;
  };
}

export interface RevenueTrendPoint {
  label: string;
  revenue: number;
  previousRevenue?: number;
}

export interface RevenueSourceItem {
  sourceType: "medical_exam" | "grooming" | "boarding" | "prescription";
  label: string;
  invoiceCount: number;
  revenue: number;
  percentage: number;
  changePercent?: number | null;
}

export interface StatusCountItem {
  status: string;
  label: string;
  count: number;
  percentage?: number;
}

export interface ServicePerformanceItem {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  completedCount: number;
  cancelledCount: number;
  revenue: number;
  completionRate: number;
  changePercent?: number | null;
}

export interface BoardingRoomReportItem {
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

export interface DoctorPerformanceItem {
  doctorId: string;
  doctorName: string;
  assignedAppointments: number;
  medicalExamCount: number;
  prescriptionCount: number;
  completionRate: number;
  changePercent?: number | null;
}

export interface AdminReportsData {
  revenue: {
    metrics: ReportMetric[];
    trend: RevenueTrendPoint[];
    sourceBreakdown: RevenueSourceItem[];
  };
  services: {
    metrics: ReportMetric[];
    statusCounts: StatusCountItem[];
    topServices: ServicePerformanceItem[];
  };
  boarding: {
    metrics: ReportMetric[];
    statusCounts: StatusCountItem[];
    roomOccupancy: BoardingRoomReportItem[];
  };
  medical: {
    metrics: ReportMetric[];
    appointmentStatusCounts: StatusCountItem[];
    examTypeCounts: StatusCountItem[];
    doctorPerformance: DoctorPerformanceItem[];
  };
  customers: {
    metrics: ReportMetric[];
    userRoleCounts: StatusCountItem[];
    petSpeciesCounts: StatusCountItem[];
    accountStatusCounts: StatusCountItem[];
  };
}
