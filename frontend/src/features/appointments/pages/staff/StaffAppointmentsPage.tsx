"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { StaffAppointmentFilters } from "../../types/appointment.types";
import { useStaffAppointments } from "../../hooks/useStaffAppointments";
import { StaffAppointmentStats } from "../../components/staff/StaffAppointmentStats";
import { StaffAppointmentFilterBar } from "../../components/staff/StaffAppointmentFilterBar";
import { StaffAppointmentTabs } from "../../components/staff/StaffAppointmentTabs";
import { StaffAppointmentTable } from "../../components/staff/StaffAppointmentTable";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { data, stats, pagination, isLoading, isError, refetch } = useStaffAppointments(filters);

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
          <h2 className="heading-lg text-petcenter-text tracking-tight">Lịch hẹn</h2>
          <p className="body-md text-petcenter-text-secondary mt-1">
            Tiếp nhận, xác nhận và xử lý các lịch hẹn của chủ nuôi.
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
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-petcenter-primary/30 border-t-petcenter-primary rounded-full animate-spin shadow-sm"></div>
            </div>
          )}

          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p className="text-petcenter-text-secondary font-medium">
                Không thể tải danh sách lịch hẹn
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
            <StaffAppointmentTable
              appointments={data}
              pagination={pagination}
              onPageChange={handlePageChange}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
