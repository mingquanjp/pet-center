import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StaffInvoice } from "../../types/invoice.types"
import { formatInvoiceMoney } from "../../utils/invoice-format"
import { useConfirmStaffInvoicePayment } from "../../hooks/useConfirmStaffInvoicePayment"

interface ConfirmPaymentModalProps {
  invoice: StaffInvoice | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ConfirmPaymentModal({ invoice, isOpen, onClose, onSuccess }: ConfirmPaymentModalProps) {
  const { mutateAsync, isMutating, error } = useConfirmStaffInvoicePayment()

  if (!invoice) return null

  const handleConfirm = async () => {
    try {
      await mutateAsync({ invoiceId: invoice.id, paymentMethod: "cash_at_counter" })
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isMutating && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-[1rem] bg-petcenter-card border border-petcenter-border shadow-modal">
        <DialogHeader>
          <DialogTitle className="heading-sm text-petcenter-text">Xác nhận thanh toán</DialogTitle>
        </DialogHeader>
        <div className="py-4 body-md text-petcenter-text">
          <p className="mb-4">Xác nhận hóa đơn <strong>{invoice.invoiceCode}</strong> đã được thanh toán tại quầy?</p>
          <div className="space-y-2 bg-petcenter-background p-4 rounded-[0.75rem] border border-petcenter-border">
            <div className="flex justify-between">
              <span className="text-petcenter-text-secondary">Tên hóa đơn:</span>
              <span className="font-medium text-petcenter-text">{invoice.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-petcenter-text-secondary">Chủ nuôi:</span>
              <span className="font-medium text-petcenter-text">{invoice.owner.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-petcenter-text-secondary">Thú cưng:</span>
              <span className="font-medium text-petcenter-text">{invoice.pet.name}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-petcenter-border mt-2">
              <span className="text-petcenter-text-secondary font-medium">Tổng tiền:</span>
              <span className="font-bold text-petcenter-cta text-base">{formatInvoiceMoney(invoice.totalAmount)}</span>
            </div>
          </div>
          {error && (
            <p className="text-petcenter-danger-text text-sm mt-3">{error.message || "Có lỗi xảy ra khi thanh toán."}</p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isMutating} className="rounded-[0.75rem] border-petcenter-border text-petcenter-text hover:bg-petcenter-background">
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isMutating} className="rounded-[0.75rem] bg-petcenter-primary text-white hover:bg-petcenter-primary-hover border-0">
            {isMutating ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
