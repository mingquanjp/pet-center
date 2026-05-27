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

  return (
    <div className="p-4 border-b border-petcenter-border w-full">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-petcenter-text-secondary" />
          <input 
            className="w-full pl-9 pr-3 py-2 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary placeholder:text-petcenter-text-secondary text-petcenter-text" 
            placeholder="Tìm kiếm mã lịch, tên thú cưng, SĐT..."
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Service Select */}
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Dịch vụ:</span>
          <select 
            className="py-2 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary min-w-35"
            value={filters.serviceType}
            onChange={(e) => onChange({ ...filters, serviceType: e.target.value as StaffAppointmentFilters['serviceType'] })}
          >
            {staffAppointmentServiceFilterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        {/* Date Input */}
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Ngày hẹn:</span>
          <input 
            type="date"
            className="py-2 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary min-w-35"
            value={filters.date}
            onChange={(e) => onChange({ ...filters, date: e.target.value })}
          />
        </label>

        {/* Reset Button */}
        <button 
          aria-label="Reset Filters" 
          onClick={onReset}
          className="p-2 px-4 gap-2 text-petcenter-text-secondary border border-petcenter-border rounded-[0.75rem] hover:bg-petcenter-background hover:text-petcenter-text transition-colors flex items-center justify-center body-md font-medium"
        >
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Đặt lại</span>
        </button>
      </div>
    </div>
  );
}
