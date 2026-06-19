import { Eye, Pencil, Power, Trash2 } from "lucide-react"
import { AdminMedicine } from "../../types/medicine.types"
import { formatVnd } from "../../utils/medicine-format"
import { AdminMedicineStatusBadge } from "./AdminMedicineStatusBadge"
import { AdminMedicineUnitBadge } from "./AdminMedicineUnitBadge"
import { AppPagination } from "@/components/ui/app-pagination"

interface AdminMedicineTableProps {
  medicines: AdminMedicine[]
  page: number
  limit: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (medicine: AdminMedicine) => void
  onEdit: (medicine: AdminMedicine) => void
  onToggleStatus: (medicine: AdminMedicine) => void
  onDelete: (medicine: AdminMedicine) => void
}

export function AdminMedicineTable({
  medicines,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: AdminMedicineTableProps) {
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, total)

  return (
    <div className="w-full bg-white rounded-2xl shadow-card border border-petcenter-border overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[140px]" />
            <col className="w-auto" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[160px]" />
            <col className="w-[210px]" />
          </colgroup>
          <thead className="border-b border-petcenter-border bg-petcenter-background">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Mã thuốc</th>
              <th className="px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Tên thuốc</th>
              <th className="px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Đơn vị</th>
              <th className="px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Đơn giá</th>
              <th className="px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Tồn kho</th>
              <th className="px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Trạng thái</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-petcenter-text-secondary">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-petcenter-border bg-white">
            {medicines.map((med) => (
              <tr key={med.id} className="align-middle transition-colors hover:bg-petcenter-background/60">
                <td className="px-6 py-4 text-sm font-medium text-petcenter-text-muted whitespace-nowrap">{med.code}</td>
                <td className="px-6 py-4 text-sm text-petcenter-text">
                  <div>
                    <p className="font-semibold text-petcenter-text truncate">{med.medicineName}</p>
                    {(med.description || med.usageNote) && (
                      <p className="text-sm text-petcenter-text-muted truncate mt-1">
                        {med.description || med.usageNote}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-petcenter-text">
                  <AdminMedicineUnitBadge unit={med.unit} />
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-petcenter-primary whitespace-nowrap">
                  {formatVnd(med.unitPrice).replace("₫", "đ")}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-petcenter-text whitespace-nowrap">
                  {med.stockQuantity ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <AdminMedicineStatusBadge status={med.medicineStatus} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onView(med)} title="Xem chi tiết" aria-label="Xem chi tiết" className="w-[36px] h-[36px] shrink-0 rounded-lg border border-petcenter-border flex items-center justify-center text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-primary transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(med)} title="Chỉnh sửa" aria-label="Chỉnh sửa" className="w-[36px] h-[36px] shrink-0 rounded-lg border border-petcenter-border flex items-center justify-center text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-primary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onToggleStatus(med)} title={med.medicineStatus === "active" ? "Ngừng hoạt động" : "Kích hoạt lại"} aria-label={med.medicineStatus === "active" ? "Ngừng hoạt động" : "Kích hoạt lại"} className="w-[36px] h-[36px] shrink-0 rounded-lg border border-petcenter-border flex items-center justify-center text-petcenter-text-secondary hover:bg-petcenter-background hover:text-[#D97706] transition-colors">
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(med)} title="Xóa" aria-label="Xóa" className="w-[36px] h-[36px] shrink-0 rounded-lg border border-petcenter-border flex items-center justify-center text-petcenter-danger-text hover:bg-petcenter-danger-bg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row">
        <div className="text-sm text-petcenter-text-secondary">
          Hiển thị{" "}
          <span className="font-medium text-petcenter-text">{startIndex}</span>
          -
          <span className="font-medium text-petcenter-text">{endIndex}</span>{" "}
          của <span className="font-medium text-petcenter-text">{total}</span> thuốc
        </div>
        <AppPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          ariaLabel="Phân trang danh sách thuốc"
          size="sm"
        />
      </div>
    </div>
  )
}
