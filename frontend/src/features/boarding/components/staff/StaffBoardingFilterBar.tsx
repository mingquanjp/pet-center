import * as React from "react";
import { StaffBoardingFilters, StaffBoardingRoomFilter, StaffBoardingTimeFilter } from "../../types/boarding.types";
import { Search, RotateCcw } from "lucide-react";
import {
  staffBoardingRoomFilterOptions,
  staffBoardingTimeFilterOptions,
} from "../../constants/boarding.constants";

import { useStaffRoomTypes } from "../../hooks/useStaffRoomTypes";

interface Props {
  filters: StaffBoardingFilters;
  onChange: (filters: StaffBoardingFilters) => void;
  onReset: () => void;
}

export function StaffBoardingFilterBar({ filters, onChange, onReset }: Props) {
  const [searchValue, setSearchValue] = React.useState(filters.search || "");
  const [prevSearch, setPrevSearch] = React.useState(filters.search || "");
  const { data: roomTypes } = useStaffRoomTypes();

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

  const roomFilterOptions = React.useMemo<{ label: string; value: string }[]>(() => {
    const baseOptions = [{ label: "Tất cả", value: "ALL" }];
    if (roomTypes) {
      return baseOptions.concat(roomTypes.map(rt => ({ label: rt.name, value: rt.id })));
    }
    return baseOptions.concat(staffBoardingRoomFilterOptions.slice(1));
  }, [roomTypes]);

  return (
    <div className="p-4 border-b border-petcenter-border w-full">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-petcenter-text-secondary" />
          <input
            className="w-full pl-9 pr-3 py-2 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary placeholder:text-petcenter-text-secondary text-petcenter-text"
            placeholder="Tìm tên thú cưng, chủ nuôi, SĐT..."
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Room Filter */}
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Phòng:</span>
          <select
            className="py-2 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary min-w-35"
            value={filters.roomType}
            onChange={(e) => onChange({ ...filters, roomType: e.target.value as StaffBoardingRoomFilter | string })}
          >
            {roomFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        {/* Time Range Filter */}
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Thời gian:</span>
          <select
            className="py-2 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary min-w-35"
            value={filters.timeRange}
            onChange={(e) => onChange({ ...filters, timeRange: e.target.value as StaffBoardingTimeFilter })}
          >
            {staffBoardingTimeFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
