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
import { AlertTriangle } from "lucide-react"

interface AdminMedicineDeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: AdminMedicine | null
  onConfirm: (medicineId: string) => Promise<void>
}

export function AdminMedicineDeleteConfirmDialog({
  open,
  onOpenChange,
  medicine,
  onConfirm,
}: AdminMedicineDeleteConfirmDialogProps) {
  if (!medicine) return null

  const hasUsage = (medicine.prescriptionUsageCount ?? 0) > 0

  const handleConfirm = async () => {
    await onConfirm(medicine.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px] bg-white rounded-2xl outline-none shadow-2xl ring-0"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            {hasUsage ? "Ngừng hoạt động thuốc?" : "Xóa thuốc này?"}
          </DialogTitle>
          <DialogDescription className="pt-3">
            {hasUsage ? (
              <span>
                Thuốc <strong>{medicine.medicineName}</strong> đã từng được dùng trong đơn thuốc (
                {medicine.prescriptionUsageCount} lần). Hệ thống sẽ chuyển sang trạng
                thái <strong>Ngừng hoạt động</strong> thay vì xóa để bảo toàn dữ liệu lịch
                sử.
              </span>
            ) : (
              <span>
                Bạn có chắc muốn xóa thuốc <strong>{medicine.medicineName}</strong>{" "}
                không? Hành động này không thể hoàn tác.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {hasUsage ? "Ngừng hoạt động" : "Xóa thuốc"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
