import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

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
  const hasActiveFilter =
    filters.search.trim().length > 0 ||
    filters.petId !== "ALL" ||
    filters.status !== "ALL" ||
    filters.date !== ""

  function updateFilters(nextFilters: Partial<OwnerAppointmentFilters>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
    });
  }

  return (
    <section className="rounded-[16px] border border-[#E6E8DD] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6E7774]" aria-hidden="true" />
          <span className="sr-only">Tìm kiếm lịch khám</span>
          <input
            type="search"
            placeholder="Tìm kiếm mã lịch, tên thú cưng, dịch vụ..."
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            className="h-11 w-full rounded-full border border-[#CFD8D5] bg-white pl-14 pr-4 text-base leading-6 text-[#1B1C15] outline-none transition placeholder:text-[#8A918E] focus:border-[#005E53] focus:ring-4 focus:ring-[#005E53]/10"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap">
          <FilterSelect
            label="Thú cưng"
            options={petOptions}
            value={filters.petId}
            onChange={(value) => updateFilters({ petId: value as OwnerAppointmentPetFilter })}
          />

          <FilterSelect
            label="Trạng thái"
            options={ownerAppointmentStatusFilterOptions}
            value={filters.status}
            onChange={(value) => updateFilters({ status: value as OwnerAppointmentStatusFilter })}
          />

          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm font-normal leading-5 text-[#3E4946]">
              Ngày hẹn:
            </span>
            <input
              type="date"
              className="h-9 min-w-[120px] rounded-lg border border-[#CFD8D5] bg-white px-3 text-sm leading-5 text-[#1B1C15] outline-none transition focus:border-[#005E53] focus:ring-2 focus:ring-[#005E53]/10"
              value={filters.date}
              onChange={(event) => updateFilters({ date: event.target.value })}
            />
          </label>

          <Button
            variant="ghost"
            className="h-10 w-fit shrink-0 rounded-xl px-3 text-base font-normal leading-6 text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#004C43] disabled:pointer-events-none disabled:opacity-50"
            disabled={!hasActiveFilter}
            onClick={onResetFilters}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      </div>
    </section>
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
      <span className="whitespace-nowrap text-sm font-normal leading-5 text-[#3E4946]">
        {label}:
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 min-w-[120px] rounded-lg border border-[#CFD8D5] bg-white px-3 text-sm leading-5 text-[#1B1C15] outline-none transition focus:border-[#005E53] focus:ring-2 focus:ring-[#005E53]/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-44 rounded-lg border border-[#CFD8D5] bg-white p-1 shadow-md">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-md py-2 px-3 text-sm font-normal text-[#3E4946] hover:bg-[#F3F7F6] focus:bg-[#E0F2F1] focus:text-[#005E53] cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
