import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AdminReportFilters, AdminReportsData, AdminReportTab } from "../types/report.types";
import { adminReportsApi } from "../api/reports.api";
import { exportToExcel as generateExcel, exportToPdf as generatePdf } from "../utils/export.utils";

export function useAdminReports() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as AdminReportTab | null;
  const validTabs: AdminReportTab[] = ["REVENUE", "SERVICES", "BOARDING", "MEDICAL", "CUSTOMERS"];
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : "REVENUE";

  const [activeTab, setActiveTabState] = useState<AdminReportTab>(initialTab);

  const setActiveTab = useCallback((tab: AdminReportTab) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    }
  }, [tabParam, activeTab]);
  const [filters, setFilters] = useState<AdminReportFilters>({
    timeRange: "LAST_30_DAYS",
    compareMode: "PREVIOUS_PERIOD",
    groupBy: "DAY",
    paymentMethodGroup: "ALL",
  });
  
  const [data, setData] = useState<AdminReportsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isWaitingForDates, setIsWaitingForDates] = useState<boolean>(false);

  const fetchReports = useCallback(async () => {
    if (filters.timeRange === "CUSTOM" && (!filters.fromDate || !filters.toDate)) {
      setIsWaitingForDates(true);
      return;
    }

    setIsWaitingForDates(false);
    setIsLoading(true);
    setError(null);
    try {
      const responseData = await adminReportsApi.getReports(filters);
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Lỗi khi tải dữ liệu báo cáo."));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateFilters = (newFilters: Partial<AdminReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      timeRange: "LAST_30_DAYS",
      compareMode: "PREVIOUS_PERIOD",
      groupBy: "DAY",
      paymentMethodGroup: "ALL",
    });
  };

  const exportExcel = async () => {
    if (!data) return;
    try {
      await generateExcel(data, activeTab, filters);
    } catch (err) {
      alert("Xuất Excel thất bại.");
      console.error(err);
    }
  };

  const exportPdf = async () => {
    if (!data) return;
    try {
      await generatePdf(data, activeTab, filters);
    } catch (err) {
      alert("Xuất PDF thất bại.");
      console.error(err);
    }
  };

  return {
    activeTab,
    setActiveTab,
    filters,
    updateFilters,
    resetFilters,
    data,
    isLoading,
    isWaitingForDates,
    error,
    refetch: fetchReports,
    exportExcel,
    exportPdf,
  };
}
