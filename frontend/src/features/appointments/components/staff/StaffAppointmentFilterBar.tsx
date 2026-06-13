import * as React from "react";
import { Search, RotateCcw } from "lucide-react";
import { 
  StaffAppointmentFilters, 
} from "../../types/appointment.types";
import { 
  staffAppointmentServiceFilterOptions 
} from "../../constants/appointment.constants";

interface Props {
  filters: StaffAppointmentFilters;
  onChange: (filters: StaffAppointmentFilters) => void;
  onReset: () => void;
}

export function StaffAppointmentFilterBar({ filters, onChange, onReset }: Props) {
  const [searchValue, setSearchValue] = React.useState(filters.search || "");
  const [prevSearch, setPrevSearch] = React.useState(filters.search || "");

  // Update local state if filters.search changes externally (e.g. reset)
  if (filters.search !== prevSearch) {
    setSearchValue(filters.search || "");
    setPrevSearch(filters.search || "");
  }

  // Debounce the search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== searchValue) {
        onChange({ ...filters, search: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onChange]);

  const hasActiveFilters = Boolean(searchValue) || filters.serviceType !== "ALL" || Boolean(filters.date);

  return (
    <div className="w-full border-b border-petcenter-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          <input 
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            placeholder="Tìm kiếm mã lịch, tên thú cưng, SĐT..."
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Dịch vụ:</span>
          <select 
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            value={filters.serviceType}
            onChange={(e) => onChange({ ...filters, serviceType: e.target.value as StaffAppointmentFilters['serviceType'] })}
          >
            {staffAppointmentServiceFilterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Ngày hẹn:</span>
          <input 
            type="date"
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            value={filters.date}
            onChange={(e) => onChange({ ...filters, date: e.target.value })}
          />
        </label>

        <button 
          aria-label="Reset Filters" 
          disabled={!hasActiveFilters}
          onClick={onReset}
          className="body-md flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-[0.75rem] border border-petcenter-border px-4 font-medium text-petcenter-text-secondary transition-colors hover:bg-petcenter-background hover:text-petcenter-text disabled:pointer-events-none disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Đặt lại</span>
        </button>
      </div>
    </div>
  );
}
