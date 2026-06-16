"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { StaffAppointmentFilters } from "../../types/appointment.types";
import { useStaffAppointments } from "../../hooks/useStaffAppointments";
import { StaffAppointmentStats } from "../../components/staff/StaffAppointmentStats";
import { StaffAppointmentFilterBar } from "../../components/staff/StaffAppointmentFilterBar";
import { StaffAppointmentTabs } from "../../components/staff/StaffAppointmentTabs";
import { StaffAppointmentTable } from "../../components/staff/StaffAppointmentTable";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

const defaultFilters: StaffAppointmentFilters = {
  search: "",
  status: "ALL",
  serviceType: "ALL",
  date: "",
  tab: "ALL",
  page: 1,
  limit: 10,
};

function parseFiltersFromParams(params: URLSearchParams): StaffAppointmentFilters {
  return {
    search: params.get("search") || "",
    status: (params.get("status") as StaffAppointmentFilters["status"]) || "ALL",
    serviceType: (params.get("serviceType") as StaffAppointmentFilters["serviceType"]) || "ALL",
    date: params.get("date") || "",
    tab: (params.get("tab") as StaffAppointmentFilters["tab"]) || "ALL",
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 10,
  };
}

export function StaffAppointmentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const { data, stats, pagination, isLoading, isInitialLoading, isError, refetch } = useStaffAppointments(filters);

  const updateFilters = useCallback((newFilters: StaffAppointmentFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.status !== "ALL") params.set("status", newFilters.status);
    if (newFilters.serviceType !== "ALL") params.set("serviceType", newFilters.serviceType);
    if (newFilters.date) params.set("date", newFilters.date);
    if (newFilters.tab !== "ALL") params.set("tab", newFilters.tab);
    if (newFilters.page > 1) params.set("page", String(newFilters.page));

    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, pathname]);

  const handleReset = () => {
    updateFilters(defaultFilters);
  };

  const handleFilterChange = (newFilters: StaffAppointmentFilters) => {
    updateFilters({ ...newFilters, page: 1 });
  };

  const handleTabChange = (tab: StaffAppointmentFilters["tab"]) => {
    updateFilters({ ...filters, tab, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ ...filters, page });
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-lg text-petcenter-text tracking-tight">Khám bệnh</h2>
          <p className="body-md text-petcenter-text-secondary mt-1">
            Tiếp nhận, xác nhận và xử lý các lịch khám bệnh của chủ nuôi.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-[0.75rem] border-petcenter-border text-petcenter-text hover:bg-petcenter-background active:scale-95 transition-all h-9 px-4 gap-2"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <StaffAppointmentStats
        pendingCount={stats.pendingCount}
        confirmedCount={stats.confirmedCount}
        rejectedCount={stats.rejectedCount}
        cancelledCount={stats.cancelledCount}
        todayTotalCount={stats.todayTotalCount}
      />

      {/* Unified Table Card */}
      <div className="bg-petcenter-card rounded-2xl shadow-card flex flex-col overflow-hidden relative border border-petcenter-border">
        {/* Filter Bar */}
        <StaffAppointmentFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Tabs */}
        <StaffAppointmentTabs
          activeTab={filters.tab}
          onChange={handleTabChange}
          pendingCount={stats.pendingCount}
          confirmedCount={stats.confirmedCount}
          rejectedCount={stats.rejectedCount}
          cancelledCount={stats.cancelledCount}
        />

        {/* Table & Loading & Error */}
        <div className="relative flex-1">
          {isInitialLoading ? (
            <div className="py-10">
              <LoadingState 
                title="Đang tải dữ liệu..." 
                description="Vui lòng đợi giây lát trong khi chúng tôi tải dữ liệu từ hệ thống."
              />
            </div>
          ) : isError && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
              <p className="text-petcenter-text-secondary font-medium">
                Không thể tải danh sách lịch khám
              </p>
              <Button
                variant="outline"
                className="rounded-[0.75rem] border-petcenter-border"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <div className={`transition-opacity duration-200 ${isLoading && !isInitialLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <StaffAppointmentTable
                appointments={data}
                pagination={pagination}
                onPageChange={handlePageChange}
                onReset={handleReset}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
