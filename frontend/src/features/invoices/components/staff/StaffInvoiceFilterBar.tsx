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

  return (
    <div className="bg-petcenter-card rounded-[1rem] shadow-card border border-petcenter-border p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-petcenter-text-secondary" />
          <input 
            className="w-full pl-9 pr-3 py-2 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary placeholder:text-petcenter-text-secondary text-petcenter-text" 
            placeholder="Tìm hóa đơn, thú cưng, dịch vụ..." 
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        
        <select 
          className="py-2 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary min-w-35"
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as StaffInvoiceFilters['status'] })}
        >
          {staffInvoiceStatusFilterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.value === 'ALL' ? 'Trạng thái: Tất cả' : opt.label}</option>
          ))}
        </select>
        
        <select 
          className="py-2 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary min-w-35"
          value={filters.serviceType}
          onChange={(e) => onFiltersChange({ ...filters, serviceType: e.target.value as StaffInvoiceFilters['serviceType'] })}
        >
          {staffInvoiceServiceFilterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.value === 'ALL' ? 'Dịch vụ: Tất cả' : opt.label}</option>
          ))}
        </select>
        
        <select 
          className="py-2 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-[0.75rem] text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary min-w-35"
          value={filters.timeRange}
          onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value as StaffInvoiceFilters['timeRange'] })}
        >
          {staffInvoiceTimeFilterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.value === 'ALL' ? 'Thời gian: Tất cả' : opt.label}</option>
          ))}
        </select>
        
        <button 
          aria-label="Reset Filters" 
          onClick={onReset}
          className="p-2 px-4 gap-2 text-petcenter-text-secondary border border-petcenter-border rounded-[0.75rem] hover:bg-petcenter-background hover:text-petcenter-text transition-colors flex items-center justify-center body-md font-medium"
        >
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Đặt lại</span>
        </button>
      </div>
    </div>
  )
}
