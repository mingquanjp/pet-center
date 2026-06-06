import { AdminReportFilters } from "../../types/report.types";
import {
  reportTimeRangeOptions,
  reportCompareModeOptions,
  reportGroupByOptions,
  reportPaymentMethodGroupOptions,
} from "../../constants/report.constants";
import { Filter, RotateCcw } from "lucide-react";

interface AdminReportsToolbarProps {
  filters: AdminReportFilters;
  onFilterChange: (newFilters: Partial<AdminReportFilters>) => void;
  onReset: () => void;
}

export function AdminReportsToolbar({
  filters,
  onFilterChange,
  onReset,
}: AdminReportsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="heading-sm text-petcenter-text flex items-center gap-2">
            <Filter className="h-5 w-5 text-petcenter-primary" />
            Bộ lọc phân tích
          </h3>
          <p className="text-xs text-petcenter-text-muted mt-1">
            Khoảng thời gian là kỳ dữ liệu chính. So sánh với dùng để tính % tăng/giảm. Nhóm theo dùng để chia dữ liệu trên biểu đồ.
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-control px-3 py-1.5 text-sm font-medium text-petcenter-text-secondary transition-colors hover:bg-petcenter-filter hover:text-petcenter-text"
        >
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Khoảng thời gian */}
        <div className="flex flex-col gap-1.5">
          <label className="label-sm text-petcenter-text-muted">Khoảng thời gian</label>
          <select
            value={filters.timeRange}
            onChange={(e) => onFilterChange({ timeRange: e.target.value as any })}
            className="w-full rounded-control border border-petcenter-border bg-white px-3 py-2 text-sm text-petcenter-text shadow-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
          >
            {reportTimeRangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* So sánh với */}
        <div className="flex flex-col gap-1.5">
          <label className="label-sm text-petcenter-text-muted">So sánh với</label>
          <select
            value={filters.compareMode}
            onChange={(e) => onFilterChange({ compareMode: e.target.value as any })}
            className="w-full rounded-control border border-petcenter-border bg-white px-3 py-2 text-sm text-petcenter-text shadow-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
          >
            {reportCompareModeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nhóm theo */}
        <div className="flex flex-col gap-1.5">
          <label className="label-sm text-petcenter-text-muted">Nhóm theo</label>
          <select
            value={filters.groupBy}
            onChange={(e) => onFilterChange({ groupBy: e.target.value as any })}
            className="w-full rounded-control border border-petcenter-border bg-white px-3 py-2 text-sm text-petcenter-text shadow-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
          >
            {reportGroupByOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Phương thức thanh toán */}
        <div className="flex flex-col gap-1.5">
          <label className="label-sm text-petcenter-text-muted">Phương thức thanh toán</label>
          <select
            value={filters.paymentMethodGroup}
            onChange={(e) => onFilterChange({ paymentMethodGroup: e.target.value as any })}
            className="w-full rounded-control border border-petcenter-border bg-white px-3 py-2 text-sm text-petcenter-text shadow-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
          >
            {reportPaymentMethodGroupOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filters.timeRange === "CUSTOM" && (
        <div className="grid grid-cols-1 gap-4 border-t border-petcenter-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="label-sm text-petcenter-text-muted">Từ ngày</label>
            <input
              type="date"
              value={filters.fromDate || ""}
              onChange={(e) => onFilterChange({ fromDate: e.target.value })}
              className="w-full rounded-control border border-petcenter-border bg-white px-3 py-2 text-sm text-petcenter-text shadow-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label-sm text-petcenter-text-muted">Đến ngày</label>
            <input
              type="date"
              value={filters.toDate || ""}
              onChange={(e) => onFilterChange({ toDate: e.target.value })}
              className="w-full rounded-control border border-petcenter-border bg-white px-3 py-2 text-sm text-petcenter-text shadow-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
