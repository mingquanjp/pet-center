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

  const hasActiveFilters = Boolean(searchValue) || filters.roomType !== "ALL" || filters.timeRange !== "ALL";

  return (
    <div className="w-full border-b border-petcenter-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          <input
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            placeholder="Tìm tên thú cưng, chủ nuôi, SĐT..."
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Phòng:</span>
          <select
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            value={filters.roomType}
            onChange={(e) => onChange({ ...filters, roomType: e.target.value as StaffBoardingRoomFilter | string })}
          >
            {roomFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Thời gian:</span>
          <select
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            value={filters.timeRange}
            onChange={(e) => onChange({ ...filters, timeRange: e.target.value as StaffBoardingTimeFilter })}
          >
            {staffBoardingTimeFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
