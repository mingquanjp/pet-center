import * as React from "react";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  return (
    <section className="rounded-card border border-petcenter-border bg-petcenter-filter p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
          <input
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ ...filters, search: event.target.value })
            }
            placeholder="Tìm mã hóa đơn, tên thú cưng..."
            type="search"
            className="body-md h-11 w-full rounded-pill border border-petcenter-border-strong bg-white pl-11 pr-4 text-petcenter-text outline-none transition placeholder:text-petcenter-text-muted focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
            <span className="label-md whitespace-nowrap text-petcenter-text-muted">
              Ngày:
            </span>
            <input
              value={filters.date}
              onChange={(event) =>
                onFiltersChange({ ...filters, date: event.target.value })
              }
              type="date"
              aria-label="Ngày tạo hóa đơn"
              className="body-md h-10 rounded-control border border-petcenter-border-strong bg-white px-3 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
            />
          </label>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="label-md h-10 rounded-control border-petcenter-border-strong bg-white px-4 font-semibold text-petcenter-text-secondary hover:bg-petcenter-sidebar hover:text-petcenter-text xl:ml-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </Button>
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
      <span className="label-md whitespace-nowrap text-petcenter-text-muted">
        {label}:
      </span>
      <select
        className="body-md h-10 rounded-control border border-petcenter-border-strong bg-white px-3 pr-9 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
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
