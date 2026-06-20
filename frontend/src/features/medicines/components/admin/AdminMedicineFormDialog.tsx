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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState, useMemo } from "react"
import { Check, ChevronDown, Plus, X } from "lucide-react"
import {
  medicineStatusOptions,
  medicineUnitOptions,
} from "../../constants/medicine.constants"
import {
  AdminMedicine,
  CreateAdminMedicinePayload,
  MedicineStatus,
  MedicineUnit,
  UpdateAdminMedicinePayload,
} from "../../types/medicine.types"
import { toast } from "sonner"
import { useMedicineUnits } from "../../hooks/useMedicineUnits"
import { getMedicineUnitLabel } from "../../utils/medicine-format"

interface AdminMedicineFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: AdminMedicine | null
  onSubmit: (payload: CreateAdminMedicinePayload | UpdateAdminMedicinePayload) => Promise<void>
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
    stockQuantity: 0,
    description: "",
    usageNote: "",
    medicineStatus: "active",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCustomUnit, setIsCustomUnit] = useState(false)
  const { units } = useMedicineUnits()

  const allUnitOptions = useMemo(() => {
    const labelToValue = new Map<string, string>()
    // Thêm các đơn vị mặc định trước
    medicineUnitOptions.forEach(opt => {
      labelToValue.set(opt.label.toLowerCase(), opt.value)
    })
    // Thêm các đơn vị từ DB
    units.forEach(unit => {
      const label = getMedicineUnitLabel(unit)
      const lowerLabel = label.toLowerCase()
      if (!labelToValue.has(lowerLabel)) {
        labelToValue.set(lowerLabel, unit)
      }
    })
    
    return Array.from(labelToValue.entries()).map(([, value]) => ({ 
      value, 
      label: getMedicineUnitLabel(value) 
    }))
  }, [units])

  const selectedUnitLabel =
    allUnitOptions.find((opt) => opt.value === formData.unit)?.label || "Chọn đơn vị"

  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(() => {
      if (medicine) {
        setFormData({
          medicineName: medicine.medicineName,
          unit: medicine.unit,
          unitPrice: medicine.unitPrice,
          stockQuantity: medicine.stockQuantity ?? 0,
          description: medicine.description || "",
          usageNote: medicine.usageNote || "",
          medicineStatus: medicine.medicineStatus,
        })
      } else {
        setFormData({
          medicineName: "",
          unit: "tablet",
          unitPrice: 0,
          stockQuantity: 0,
          description: "",
          usageNote: "",
          medicineStatus: "active",
        })
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [open, medicine])

  useEffect(() => {
    if (!open) {
      setIsCustomUnit(false)
    }
  }, [open])

  const blockInvalidNumberChars = (e: React.KeyboardEvent) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.medicineName.trim()) {
      toast.error("Vui lòng nhập tên thuốc")
      return
    }

    if (formData.unitPrice < 0) {
      toast.error("Đơn giá thuốc không hợp lệ")
      return
    }

    if (formData.stockQuantity === undefined || formData.stockQuantity < 0) {
      toast.error("Số lượng tồn kho không hợp lệ")
      return
    }

    setIsSubmitting(true)
    try {
      // Chuẩn hóa unit nếu người dùng nhập tay nhưng trùng với label có sẵn
      const finalFormData = { ...formData }
      if (isCustomUnit) {
        const lowerInput = finalFormData.unit.trim().toLowerCase()
        const standardMatch = medicineUnitOptions.find(opt => opt.label.toLowerCase() === lowerInput)
        if (standardMatch) {
          finalFormData.unit = standardMatch.value
        } else {
          finalFormData.unit = finalFormData.unit.trim()
        }
      }

      if (isEdit && medicine) {
        await onSubmit({ ...finalFormData, id: medicine.id })
      } else {
        await onSubmit(finalFormData)
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Đơn vị <span className="text-red-500">*</span>
                </Label>
                {isCustomUnit ? (
                  <div className="flex gap-2">
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                      placeholder="Nhập đơn vị"
                      autoFocus
                      required
                      className="focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 text-petcenter-text-secondary"
                      onClick={() => {
                        setIsCustomUnit(false)
                        setFormData((prev) => ({ ...prev, unit: "tablet" }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        id="unit"
                        type="button"
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-petcenter-primary focus-visible:ring-1 focus-visible:ring-petcenter-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="truncate">{selectedUnitLabel}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[100] bg-white shadow-modal border border-petcenter-border text-petcenter-text ring-0">
                      {allUnitOptions.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onSelect={() =>
                            setFormData((prev) => ({ ...prev, unit: opt.value as MedicineUnit }))
                          }
                          className="flex cursor-pointer items-center justify-between px-2 py-2"
                        >
                          <span>{opt.label}</span>
                          {formData.unit === opt.value && (
                            <Check className="h-4 w-4 text-petcenter-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="my-1 bg-petcenter-border" />
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          setIsCustomUnit(true)
                          setFormData((prev) => ({ ...prev, unit: "" }))
                        }}
                        className="flex cursor-pointer items-center gap-2 px-2 py-2 font-medium text-petcenter-primary focus:bg-petcenter-primary/5 focus:text-petcenter-primary"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">
                  Đơn giá (VND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  value={formData.unitPrice === undefined || formData.unitPrice as any === "" ? "" : formData.unitPrice}
                  onKeyDown={blockInvalidNumberChars}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unitPrice: e.target.value === "" ? ("" as unknown as number) : Number(e.target.value),
                    }))
                  }
                  required
                  className="focus-visible:ring-1 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">
                  Tồn kho <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity === undefined || formData.stockQuantity as any === "" ? "" : formData.stockQuantity}
                  onKeyDown={blockInvalidNumberChars}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stockQuantity: e.target.value === "" ? ("" as unknown as number) : Number(e.target.value),
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
