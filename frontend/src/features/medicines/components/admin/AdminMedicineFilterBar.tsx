import { Search, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  AdminMedicineFilters,
  MedicineStatusFilter,
  MedicineUnitFilter,
} from "../../types/medicine.types"

interface AdminMedicineFilterBarProps {
  filters: AdminMedicineFilters
  onFiltersChange: (filters: Partial<AdminMedicineFilters>) => void
  onReset: () => void
  onAddMedicine?: () => void
}

export function AdminMedicineFilterBar({
  filters,
  onFiltersChange,
  onReset,
}: AdminMedicineFilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const debouncedSearch = useDebouncedValue(searchValue, 500)

  // Sync local state when filters are reset externally
  useEffect(() => {
    if (filters.search === "") {
      setSearchValue("")
    }
  }, [filters.search])

  // Call onFiltersChange only when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch })
    }
  }, [debouncedSearch, filters.search, onFiltersChange])

  return (
    <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-petcenter-border">
      <div className="flex flex-wrap items-center gap-4 w-full">
        {/* Search Input */}
        <div className="relative flex-[2] min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-petcenter-text-secondary" />
          <input
            type="text"
            placeholder="Tìm tên thuốc, mã thuốc..."
            className="w-full pl-9 pr-3 py-2.5 bg-petcenter-background body-md border border-petcenter-border rounded-xl focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary placeholder:text-petcenter-text-secondary text-petcenter-text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 flex-1 min-w-[180px]">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Đơn vị:</span>
          <select
            className="flex-1 min-w-0 w-full py-2.5 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-xl text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary"
            value={filters.unit}
            onChange={(e) => onFiltersChange({ unit: e.target.value as MedicineUnitFilter })}
          >
            <option value="ALL">Tất cả</option>
            <option value="Viên">Viên</option>
            <option value="Chai">Chai</option>
            <option value="Gói">Gói</option>
            <option value="Tuýp">Tuýp</option>
            <option value="ml">ml</option>
            <option value="Liều">Liều</option>
            <option value="Khác">Khác</option>
          </select>
        </label>

        <label className="flex items-center gap-2 flex-1 min-w-[180px]">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Trạng thái:</span>
          <select
            className="flex-1 min-w-0 w-full py-2.5 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-xl text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary"
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value as MedicineStatusFilter })}
          >
            <option value="ALL">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>

        <button onClick={onReset} className="shrink-0 p-2.5 px-5 gap-2 bg-petcenter-background text-petcenter-text-secondary border border-petcenter-border rounded-xl hover:bg-petcenter-border hover:text-petcenter-text transition-colors flex items-center justify-center body-md font-medium">
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Đặt lại</span>
        </button>
      </div>
    </div>
  )
}
