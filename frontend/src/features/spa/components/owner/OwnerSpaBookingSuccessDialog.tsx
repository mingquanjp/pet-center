"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import type { GroomingTicketCreated } from "../../types/spa.types"

interface OwnerSpaBookingSuccessDialogProps {
  open: boolean
  ticket: GroomingTicketCreated | null
  onOpenChange: (open: boolean) => void
}

export function OwnerSpaBookingSuccessDialog({
  open,
  ticket,
  onOpenChange,
}: OwnerSpaBookingSuccessDialogProps) {
  if (!ticket) {
    return null
  }

  const paymentLabel = ticket.paymentOption === "counter" ? "Thanh toán tại trung tâm" : "Thanh toán online"
  const statusLabel = ticket.ticketStatus === "pending_payment" ? "Chờ thanh toán" : "Chờ tiếp nhận"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-[16px] border border-[#E6E8DD] bg-white p-0 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
        showCloseButton={false}
      >
        <DialogClose asChild>
          <button
            type="button"
            className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full text-[#3E4946] hover:bg-[#F5F4E8]"
            aria-label="Đóng"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </DialogClose>

        <header className="flex flex-col items-center px-6 pb-4 pt-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[rgba(0,121,107,0.1)]">
            <Check className="size-7 text-[#00796B]" strokeWidth={3} aria-hidden="true" />
          </div>
          <DialogTitle className="pt-4 text-2xl font-semibold leading-8 tracking-[-0.01em] text-[#1B1C15]">
            Đặt dịch vụ thành công
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-[#3E4946]">
            Yêu cầu dịch vụ của bạn đã được gửi tới trung tâm.
          </DialogDescription>
        </header>

        <section className="space-y-4 px-8 py-6">
          <h3 className="text-xs font-bold uppercase leading-4 tracking-[0.05em] text-[#1B1C15]">
            Thông tin yêu cầu
          </h3>
          <div className="space-y-3 pb-2">
            <SuccessInfoRow label="Mã yêu cầu" value={ticket.bookingCode} />
            <SuccessInfoRow label="Thú cưng" value={ticket.petName} />
            <SuccessInfoRow label="Dịch vụ" value={ticket.serviceName} />
            <SuccessInfoRow label="Thời gian" value={formatScheduledAt(ticket.scheduledAt)} />
            <SuccessInfoRow label="Phương thức thanh toán" value={paymentLabel} />
            <SuccessInfoRow label="Tổng tạm tính" value={formatMoney(ticket.totalAmount)} emphasized />
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] leading-[18px] text-[#52605C]">Trạng thái</span>
              <span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-[11px] font-semibold leading-[14px] tracking-[0.02em] text-[#B45309]">
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="rounded-r-xl border-l-4 border-[#00796B] bg-[#F5F4E8] px-5 py-4 text-[13px] leading-[21px] text-[#3E4946]">
            {ticket.paymentOption === "counter"
              ? "Trung tâm sẽ tiếp nhận và xác nhận yêu cầu của bạn. Vui lòng thanh toán tại trung tâm khi đến sử dụng dịch vụ."
              : "Yêu cầu của bạn đang chờ thanh toán online. Vui lòng hoàn tất thanh toán để trung tâm xác nhận lịch."}
          </div>
        </section>

        <footer className="flex flex-col gap-3 px-6 pb-6 pt-2 sm:flex-row">
          <Button
            asChild
            variant="outline"
            className="h-10 flex-1 rounded-lg border-[#00796B] text-xs font-bold leading-4 text-[#00796B] hover:bg-[#F5F4E8]"
          >
            <Link href="/owner/spa">Về danh sách dịch vụ</Link>
          </Button>
          <Button
            asChild
            className="h-10 flex-1 rounded-lg bg-[#00796B] text-xs font-bold leading-4 text-white hover:bg-[#00665A]"
          >
            <Link href="/owner/spa">Xem yêu cầu</Link>
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}

function SuccessInfoRow({
  label,
  value,
  emphasized = false,
}: {
  label: string
  value: string
  emphasized?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px] leading-[18px] text-[#52605C]">{label}</span>
      <span className={emphasized ? "text-sm font-bold leading-5 text-[#00796B]" : "text-right text-sm font-medium leading-5 text-[#1F261F]"}>
        {value}
      </span>
    </div>
  )
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`
}

function formatScheduledAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date).replace(",", " -")
}
