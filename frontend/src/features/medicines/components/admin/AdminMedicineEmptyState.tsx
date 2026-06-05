import { Button } from "@/components/ui/button"
import { PackageX } from "lucide-react"

interface AdminMedicineEmptyStateProps {
  onResetFilters: () => void
}

export function AdminMedicineEmptyState({
  onResetFilters,
}: AdminMedicineEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-white border-dashed">
      <div className="p-4 bg-stone-100 text-stone-400 rounded-full mb-4">
        <PackageX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Không tìm thấy thuốc
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Thử thay đổi bộ lọc hoặc thêm thuốc mới để xem danh sách.
      </p>
      <Button variant="outline" onClick={onResetFilters}>
        Đặt lại bộ lọc
      </Button>
    </div>
  )
}
