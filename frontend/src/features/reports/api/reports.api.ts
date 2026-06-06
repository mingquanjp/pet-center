import { AdminReportFilters, AdminReportsData, AdminReportTab, ReportMetric, RevenueSourceItem, ServicePerformanceItem, BoardingRoomReportItem, DoctorPerformanceItem } from "../types/report.types";
import { shouldShowComparison, getCompareLabel } from "../utils/report-format";
import { apiRequest } from "@/lib/api";

export const adminReportsApi = {
  getReports: async (filters: AdminReportFilters): Promise<AdminReportsData> => {
    const queryParams = new URLSearchParams();
    if (filters.timeRange) queryParams.set("timeRange", filters.timeRange);
    if (filters.compareMode) queryParams.set("compareMode", filters.compareMode);
    if (filters.groupBy) queryParams.set("groupBy", filters.groupBy);
    if (filters.paymentMethodGroup) queryParams.set("paymentMethodGroup", filters.paymentMethodGroup);
    if (filters.fromDate) queryParams.set("fromDate", filters.fromDate);
    if (filters.toDate) queryParams.set("toDate", filters.toDate);
    if (filters.tab) queryParams.set("tab", filters.tab);

    const response = await apiRequest<AdminReportsData>(`/admin/reports?${queryParams.toString()}`);
    const data = response.data;

    const showCompare = shouldShowComparison(filters.compareMode);
    const compareLabel = getCompareLabel(filters.compareMode);

    const normalizeMetrics = (metrics: ReportMetric[]) =>
      metrics.map((metric) => {
        if (!showCompare) {
          return {
            ...metric,
            trend: undefined,
            description: "trong kỳ đã chọn",
          };
        }

        return {
          ...metric,
          trend: metric.trend
            ? {
                ...metric.trend,
                label: compareLabel,
              }
            : undefined,
        };
      });

    return {
      ...data,
      revenue: {
        ...data.revenue,
        metrics: normalizeMetrics(data.revenue.metrics),
        sourceBreakdown: data.revenue.sourceBreakdown.map((item: RevenueSourceItem) => ({
          ...item,
          changePercent: showCompare ? item.changePercent : undefined,
        })),
      },
      services: {
        ...data.services,
        metrics: normalizeMetrics(data.services.metrics),
        topServices: data.services.topServices.map((item: ServicePerformanceItem) => ({
          ...item,
          changePercent: showCompare ? item.changePercent : undefined,
        })),
      },
      boarding: {
        ...data.boarding,
        metrics: normalizeMetrics(data.boarding.metrics),
        roomOccupancy: data.boarding.roomOccupancy.map((item: BoardingRoomReportItem) => ({
          ...item,
          changePercent: showCompare ? item.changePercent : undefined,
        })),
      },
      medical: {
        ...data.medical,
        metrics: normalizeMetrics(data.medical.metrics),
        doctorPerformance: data.medical.doctorPerformance.map((item: DoctorPerformanceItem) => ({
          ...item,
          changePercent: showCompare ? item.changePercent : undefined,
        })),
      },
      customers: {
        ...data.customers,
        metrics: normalizeMetrics(data.customers.metrics),
      },
    };
  },

  exportReport: async (
    filters: AdminReportFilters,
    format: "excel" | "pdf",
    activeTab: AdminReportTab
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest<{ message: string }>("/admin/reports/export", {
      method: "POST",
      body: JSON.stringify({
        ...filters,
        format,
        tab: activeTab
      })
    });
    return {
      success: true,
      message: response.data.message || `Xuất báo cáo ${format.toUpperCase()} thành công!`,
    };
  },
};
