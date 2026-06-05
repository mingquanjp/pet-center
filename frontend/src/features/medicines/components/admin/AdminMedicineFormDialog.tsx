import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import {
  medicineStatusOptions,
  medicineUnitOptions,
} from "../../constants/medicine.constants"
import {
  AdminMedicine,
  CreateAdminMedicinePayload,
  MedicineStatus,
  MedicineUnit,
} from "../../types/medicine.types"

interface AdminMedicineFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: AdminMedicine | null
  onSubmit: (payload: any) => Promise<void>
}

export function AdminMedicineFormDialog({
  open,
  onOpenChange,
  medicine,
  onSubmit,
}: AdminMedicineFormDialogProps) {
  const isEdit = !!medicine

  const [formData, setFormData] = useState<CreateAdminMedicinePayload>({
    medicineName: "",
    unit: "tablet",
    unitPrice: 0,
    description: "",
    usageNote: "",
    medicineStatus: "active",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (medicine) {
        setFormData({
          medicineName: medicine.medicineName,
          unit: medicine.unit,
          unitPrice: medicine.unitPrice,
          description: medicine.description || "",
          usageNote: medicine.usageNote || "",
          medicineStatus: medicine.medicineStatus,
        })
      } else {
        setFormData({
          medicineName: "",
          unit: "tablet",
          unitPrice: 0,
          description: "",
          usageNote: "",
          medicineStatus: "active",
        })
      }
    }
  }, [open, medicine])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.medicineName.trim()) return

    setIsSubmitting(true)
    try {
      if (isEdit && medicine) {
        await onSubmit({ ...formData, id: medicine.id })
      } else {
        await onSubmit(formData)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] bg-white rounded-2xl outline-none shadow-2xl ring-0"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Cập nhật thông tin chi tiết của thuốc."
                : "Điền thông tin để thêm một loại thuốc mới vào hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 min-w-0">
            <div className="space-y-2 min-w-0 w-full">
              <Label htmlFor="medicineName">
                Tên thuốc <span className="text-red-500">*</span>
              </Label>
              <Input
                id="medicineName"
                value={formData.medicineName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, medicineName: e.target.value }))
                }
                placeholder="Ví dụ: Bravecto 1000mg"
                required
                maxLength={150}
                className="focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Đơn vị <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, unit: val as MedicineUnit }))
                  }
                >
                  <SelectTrigger id="unit" className="focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary">
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[100] shadow-modal border border-petcenter-border text-petcenter-text ring-0">
                    {medicineUnitOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">
                  Đơn giá (VND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  value={formData.unitPrice || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unitPrice: Number(e.target.value),
                    }))
                  }
                  required
                  className="focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary"
                />
              </div>
            </div>

            <div className="space-y-2 min-w-0 w-full">
              <Label htmlFor="description">Mô tả chung</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Mô tả công dụng, đặc tính..."
                className="resize-none break-words focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary"
                rows={3}
              />
            </div>

            <div className="space-y-2 min-w-0 w-full">
              <Label htmlFor="usageNote">Ghi chú sử dụng</Label>
              <Textarea
                id="usageNote"
                value={formData.usageNote || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, usageNote: e.target.value }))
                }
                placeholder="Hướng dẫn liều lượng, cách dùng..."
                className="resize-none break-words focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary"
                rows={2}
              />
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="medicineStatus">Trạng thái</Label>
                <Select
                  value={formData.medicineStatus}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      medicineStatus: val as MedicineStatus,
                    }))
                  }
                >
                  <SelectTrigger id="medicineStatus" className="focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[100] shadow-modal border border-petcenter-border text-petcenter-text ring-0">
                    {medicineStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-petcenter-primary hover:bg-petcenter-primary-hover text-white"
            >
              {isSubmitting
                ? "Đang xử lý..."
                : isEdit
                ? "Lưu thay đổi"
                : "Thêm thuốc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
