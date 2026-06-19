import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminMedicine } from "../../types/medicine.types"
import { formatVnd } from "../../utils/medicine-format"
import { AdminMedicineStatusBadge } from "./AdminMedicineStatusBadge"
import { AdminMedicineUnitBadge } from "./AdminMedicineUnitBadge"
import { Label } from "@/components/ui/label"

interface AdminMedicineDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: AdminMedicine | null
  onEdit: (medicine: AdminMedicine) => void
}

export function AdminMedicineDetailDialog({
  open,
  onOpenChange,
  medicine,
  onEdit,
}: AdminMedicineDetailDialogProps) {
  if (!medicine) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] bg-white rounded-2xl outline-none shadow-2xl ring-0"
      >
        <DialogHeader>
          <DialogTitle>Chi tiết thuốc</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết của thuốc trong hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 min-w-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Mã thuốc</Label>
              <div className="mt-1 font-medium">{medicine.code}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Trạng thái</Label>
              <div className="mt-1">
                <AdminMedicineStatusBadge status={medicine.medicineStatus} />
              </div>
            </div>
          </div>

          <div className="min-w-0 w-full">
            <Label className="text-muted-foreground">Tên thuốc</Label>
            <div className="mt-1 font-semibold text-lg break-words">
              {medicine.medicineName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Đơn vị</Label>
              <div className="mt-1">
                <AdminMedicineUnitBadge unit={medicine.unit} />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Đơn giá</Label>
              <div className="mt-1 font-medium">{formatVnd(medicine.unitPrice)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Tồn kho</Label>
              <div className="mt-1 font-medium">{medicine.stockQuantity ?? 0}</div>
            </div>
          </div>

          {medicine.description && (
            <div className="min-w-0 w-full">
              <Label className="text-muted-foreground">Mô tả chung</Label>
              <div className="mt-1 text-sm bg-stone-50 p-3 rounded-xl break-words">
                {medicine.description}
              </div>
            </div>
          )}

          {medicine.usageNote && (
            <div className="min-w-0 w-full">
              <Label className="text-muted-foreground">Ghi chú sử dụng</Label>
              <div className="mt-1 text-sm bg-stone-50 p-3 rounded-xl break-words">
                {medicine.usageNote}
              </div>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">Số lần đã kê đơn</Label>
            <div className="mt-1 font-medium">
              {medicine.prescriptionUsageCount ?? 0} lần
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onEdit(medicine)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
