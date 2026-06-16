import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ownerInvoiceServiceFilterOptions,
  ownerInvoiceStatusFilterOptions,
} from "../../constants/invoice.constants";
import { OwnerInvoiceFilters } from "../../types/invoice.types";

interface OwnerInvoiceFilterBarProps {
  filters: OwnerInvoiceFilters;
  onFiltersChange: (filters: OwnerInvoiceFilters) => void;
  onReset: () => void;
}

export function OwnerInvoiceFilterBar({
  filters,
  onFiltersChange,
  onReset,
}: OwnerInvoiceFilterBarProps) {
  const hasActiveFilter =
    filters.search.trim().length > 0 ||
    filters.status !== "ALL" ||
    filters.serviceType !== "ALL" ||
    filters.date !== "";

  return (
    <section className="rounded-[16px] border border-[#E6E8DD] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6E7774]" aria-hidden="true" />
          <span className="sr-only">Tìm mã hóa đơn, tên thú cưng...</span>
          <input
            type="search"
            placeholder="Tìm mã hóa đơn, tên thú cưng..."
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ ...filters, search: event.target.value })
            }
            className="h-11 w-full rounded-full border border-[#CFD8D5] bg-white pl-14 pr-4 text-base leading-6 text-[#1B1C15] outline-none transition placeholder:text-[#8A918E] focus:border-[#005E53] focus:ring-4 focus:ring-[#005E53]/10"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap">
          <FilterSelect
            label="Trạng thái"
            value={filters.status}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value as OwnerInvoiceFilters["status"],
              })
            }
            options={ownerInvoiceStatusFilterOptions}
          />

          <FilterSelect
            label="Loại"
            value={filters.serviceType}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                serviceType: value as OwnerInvoiceFilters["serviceType"],
              })
            }
            options={ownerInvoiceServiceFilterOptions}
          />

          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm font-normal leading-5 text-[#3E4946]">
              Ngày:
            </span>
            <input
              type="date"
              value={filters.date}
              onChange={(event) =>
                onFiltersChange({ ...filters, date: event.target.value })
              }
              aria-label="Ngày tạo hóa đơn"
              className="h-9 min-w-[120px] rounded-lg border border-[#CFD8D5] bg-white px-3 text-sm leading-5 text-[#1B1C15] outline-none transition focus:border-[#005E53] focus:ring-2 focus:ring-[#005E53]/10"
            />
          </label>

          <Button
            variant="ghost"
            className="h-10 w-fit shrink-0 rounded-xl px-3 text-base font-normal leading-6 text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#004C43] disabled:pointer-events-none disabled:opacity-50"
            disabled={!hasActiveFilter}
            onClick={onReset}
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
  options: ReadonlyArray<{ label: string; value: string }>;
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
