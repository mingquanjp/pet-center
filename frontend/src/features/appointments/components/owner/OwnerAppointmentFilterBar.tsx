import { Calendar, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import { ownerAppointmentStatusFilterOptions } from "../../constants/appointment.constants";
import {
  OwnerAppointmentFilters,
  OwnerAppointmentPetFilter,
  OwnerAppointmentStatusFilter,
} from "../../types/appointment.types";

interface OwnerAppointmentPetOption {
  value: OwnerAppointmentPetFilter;
  label: string;
}

interface OwnerAppointmentFilterBarProps {
  filters: OwnerAppointmentFilters;
  petOptions: OwnerAppointmentPetOption[];
  resultCount: number;
  totalCount: number;
  onFiltersChange: (filters: OwnerAppointmentFilters) => void;
  onResetFilters: () => void;
}

export function OwnerAppointmentFilterBar({
  filters,
  petOptions,
  resultCount,
  totalCount,
  onFiltersChange,
  onResetFilters,
}: OwnerAppointmentFilterBarProps) {
  function updateFilters(nextFilters: Partial<OwnerAppointmentFilters>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
    });
  }

  return (
    <div className="w-full border-b border-petcenter-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary"
            aria-hidden="true"
          />
          <input
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder="Tìm kiếm mã lịch, tên thú cưng, dịch vụ..."
            type="search"
          />
        </div>

        <FilterSelect
          label="Thú cưng"
          options={petOptions}
          value={filters.petId}
          onChange={(value) => updateFilters({ petId: value })}
        />

        <FilterSelect
          label="Trạng thái"
          options={ownerAppointmentStatusFilterOptions}
          value={filters.status}
          onChange={(value) =>
            updateFilters({ status: value as OwnerAppointmentStatusFilter })
          }
        />

        <label className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap text-petcenter-text-secondary">
            Ngày hẹn:
          </span>
          <span className="relative">
            <Calendar
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary"
              aria-hidden="true"
            />
            <input
              className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
              type="date"
              value={filters.date}
              onChange={(event) => updateFilters({ date: event.target.value })}
            />
          </span>
        </label>

        <button
          aria-label="Đặt lại bộ lọc"
          type="button"
          onClick={onResetFilters}
          className="body-md flex items-center justify-center gap-2 rounded-[0.75rem] border border-petcenter-border px-4 py-2 font-medium text-petcenter-text-secondary transition-colors hover:bg-petcenter-background hover:text-petcenter-text"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Đặt lại</span>
        </button>

        <div className="label-md ml-auto flex min-w-[170px] items-center justify-start gap-2 text-petcenter-text-secondary">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Hiển thị {resultCount}/{totalCount} lịch hẹn
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-medium whitespace-nowrap text-petcenter-text-secondary">
        {label}:
      </span>
      <select
        className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
