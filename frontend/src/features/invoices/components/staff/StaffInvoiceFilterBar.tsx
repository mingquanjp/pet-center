import * as React from "react"
import { Search, RotateCcw } from "lucide-react"
import { StaffInvoiceFilters } from "../../types/invoice.types"
import { 
  staffInvoiceStatusFilterOptions, 
  staffInvoiceServiceFilterOptions, 
  staffInvoiceTimeFilterOptions 
} from "../../constants/invoice.constants"

interface StaffInvoiceFilterBarProps {
  filters: StaffInvoiceFilters
  onFiltersChange: (filters: StaffInvoiceFilters) => void
  onReset: () => void
}

export function StaffInvoiceFilterBar({ filters, onFiltersChange, onReset }: StaffInvoiceFilterBarProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search || "")
  const [prevSearch, setPrevSearch] = React.useState(filters.search || "")

  // Update local state if filters.search changes externally (e.g. reset)
  if (filters.search !== prevSearch) {
    setSearchValue(filters.search || "")
    setPrevSearch(filters.search || "")
  }

  // Debounce the search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== searchValue) {
        onFiltersChange({ ...filters, search: searchValue })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue, filters, onFiltersChange])

  const hasActiveFilters =
    Boolean(searchValue) ||
    filters.status !== "ALL" ||
    filters.serviceType !== "ALL" ||
    filters.timeRange !== "ALL"

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-petcenter-border bg-petcenter-card shadow-card">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          <input 
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            placeholder="Tìm hóa đơn, thú cưng, dịch vụ..." 
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        
        <StaffInvoiceFilterSelect
          label="Trạng thái"
          onChange={(value) => onFiltersChange({ ...filters, status: value as StaffInvoiceFilters["status"] })}
          options={staffInvoiceStatusFilterOptions}
          value={filters.status}
        />
        
        <StaffInvoiceFilterSelect
          label="Dịch vụ"
          onChange={(value) => onFiltersChange({ ...filters, serviceType: value as StaffInvoiceFilters["serviceType"] })}
          options={staffInvoiceServiceFilterOptions}
          value={filters.serviceType}
        />
        
        <StaffInvoiceFilterSelect
          label="Thời gian"
          onChange={(value) => onFiltersChange({ ...filters, timeRange: value as StaffInvoiceFilters["timeRange"] })}
          options={staffInvoiceTimeFilterOptions}
          value={filters.timeRange}
        />
        
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
  )
}

function StaffInvoiceFilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">{label}:</span>
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
  )
}
