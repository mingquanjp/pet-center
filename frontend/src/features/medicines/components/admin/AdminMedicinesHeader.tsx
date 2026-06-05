import { Plus } from "lucide-react"

interface AdminMedicinesHeaderProps {
  onAddMedicine: () => void
}

export function AdminMedicinesHeader({
  onAddMedicine,
}: AdminMedicinesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="heading-lg text-petcenter-text tracking-tight">Quản lý danh mục Thuốc</h2>
        <p className="body-md text-petcenter-text-secondary mt-1">
          Quản lý thông tin, đơn vị, giá và trạng thái các loại thuốc trong trung tâm.
        </p>
      </div>
      <div className="flex items-center gap-2 self-start md:self-auto">
        <button
          onClick={onAddMedicine}
          className="bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-white px-5 rounded-[12px] text-[14px] font-medium transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap h-9"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm thuốc mới</span>
        </button>
      </div>
    </div>
  )
}
