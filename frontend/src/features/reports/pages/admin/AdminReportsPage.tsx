"use client";

import { useAdminReports } from "../../hooks/useAdminReports";
import { AdminReportsHeader } from "../../components/admin/AdminReportsHeader";
import { AdminReportsToolbar } from "../../components/admin/AdminReportsToolbar";
import { AdminReportsTabs } from "../../components/admin/AdminReportsTabs";
import { RevenueReportTab } from "../../components/admin/revenue/RevenueReportTab";
import { ServiceReportTab } from "../../components/admin/services/ServiceReportTab";
import { BoardingReportTab } from "../../components/admin/boarding/BoardingReportTab";
import { MedicalReportTab } from "../../components/admin/medical/MedicalReportTab";
import { CustomerPetReportTab } from "../../components/admin/customers/CustomerPetReportTab";
import { Dog3DScene } from "@/components/ui/dog-3d";
import { Loader2, CalendarClock } from "lucide-react";

export function AdminReportsPage() {
  const {
    activeTab,
    setActiveTab,
    filters,
    updateFilters,
    resetFilters,
    data,
    isLoading,
    isWaitingForDates,
    error,
    exportExcel,
    exportPdf,
    refetch,
  } = useAdminReports();

  return (
    <div className="flex-1 space-y-6">
      <AdminReportsHeader onExportExcel={exportExcel} onExportPdf={exportPdf} />
      
      <AdminReportsToolbar 
        filters={filters} 
        onFilterChange={updateFilters} 
        onReset={resetFilters} 
      />

      <div className="flex flex-col gap-6">
        <AdminReportsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {isWaitingForDates ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-card border border-petcenter-border bg-petcenter-card shadow-card text-petcenter-text-muted">
            <CalendarClock className="h-12 w-12 text-petcenter-primary/50" />
            <p className="text-sm font-medium">Vui lòng chọn "Từ ngày" và "Đến ngày" để xem báo cáo tùy chỉnh.</p>
          </div>
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-card border border-petcenter-border bg-petcenter-card shadow-card">
            <div className="flex flex-col items-center justify-center text-petcenter-text-muted">
              <Dog3DScene />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-petcenter-border bg-petcenter-danger-bg py-16 px-4 text-center text-petcenter-danger-text">
            <h3 className="title-md">{error.message}</h3>
            <button
              onClick={refetch}
              className="rounded-control bg-petcenter-danger-text px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800"
            >
              Thử lại
            </button>
          </div>
        ) : data ? (
          <div id="admin-report-content" className="min-h-[500px] bg-petcenter-bg rounded-xl">
            {activeTab === "REVENUE" && <RevenueReportTab data={data.revenue} compareMode={filters.compareMode} />}
            {activeTab === "SERVICES" && <ServiceReportTab data={data.services} />}
            {activeTab === "BOARDING" && <BoardingReportTab data={data.boarding} />}
            {activeTab === "MEDICAL" && <MedicalReportTab data={data.medical} />}
            {activeTab === "CUSTOMERS" && <CustomerPetReportTab data={data.customers} />}
          </div>
        ) : null}
      </div>
    </div>
  );
}
