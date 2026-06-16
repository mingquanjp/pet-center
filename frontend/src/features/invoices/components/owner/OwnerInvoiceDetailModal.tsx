import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  invoicePaymentOptionLabel,
  invoicePaymentStatusLabel,
  invoiceServiceTypeLabel,
} from "../../constants/invoice.constants";
import { useOwnerInvoiceDetail } from "../../hooks/useOwnerInvoiceDetail";
import { InvoicePaymentStatus, OwnerInvoiceDetail } from "../../types/invoice.types";
import { formatInvoiceDate, formatInvoiceMoney } from "../../utils/invoice-format";
import { InvoiceStatusBadge } from "../shared/InvoiceStatusBadge";

interface OwnerInvoiceDetailModalProps {
  open: boolean;
  invoiceId?: string | null;
  onOpenChange: (open: boolean) => void;
}

export function OwnerInvoiceDetailModal({
  open,
  invoiceId,
  onOpenChange,
}: OwnerInvoiceDetailModalProps) {
  const { data: invoice, isLoading } = useOwnerInvoiceDetail(invoiceId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-card border border-petcenter-border bg-petcenter-card p-0 text-petcenter-text shadow-modal ring-0 sm:max-w-[720px]"
      >
        <DialogHeader className="border-b border-petcenter-border px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="heading-sm text-petcenter-text">
                Chi tiết hóa đơn
              </DialogTitle>
              <DialogDescription className="body-md mt-1 text-petcenter-text-secondary">
                {invoice
                  ? `${invoice.invoiceCode} • ${invoice.pet.name}`
                  : "Thông tin hóa đơn"}
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {invoice ? <InvoiceStatusBadge status={invoice.paymentStatus} /> : null}
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(100vh-13rem)] overflow-y-auto px-6 py-6">
          {isLoading ? (
            <p className="body-md text-petcenter-text-secondary">
              Đang tải chi tiết hóa đơn...
            </p>
          ) : invoice ? (
            <InvoiceDetailContent invoice={invoice} />
          ) : (
            <p className="body-md text-petcenter-text-secondary">
              Không tìm thấy hóa đơn.
            </p>
          )}
        </div>

        <DialogFooter className="m-0 rounded-none border-t border-petcenter-border bg-petcenter-filter px-6 py-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-control border-petcenter-border-strong bg-petcenter-card px-8 text-petcenter-text hover:bg-petcenter-sidebar"
            >
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDetailContent({ invoice }: { invoice: OwnerInvoiceDetail }) {
  return (
    <div className="space-y-6">
      <section className="rounded-control border border-petcenter-border bg-petcenter-filter p-4">
        <h3 className="label-sm mb-3 uppercase text-petcenter-primary">
          Thông tin hóa đơn
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
          <DetailField label="Mã hóa đơn:" value={invoice.invoiceCode} />
          <DetailField label="Loại dịch vụ:" value={invoiceServiceTypeLabel[invoice.serviceType]} />
          <DetailField label="Ngày tạo:" value={formatInvoiceDate(invoice.issuedAt)} />
          <DetailField
            label="Hình thức thanh toán:"
            value={invoicePaymentOptionLabel[invoice.paymentOption]}
          />
          <DetailField label="Dịch vụ:" value={invoice.serviceName} />
          <DetailField label="Thú cưng:" value={invoice.pet.name} />
          <DetailField
            label="Trạng thái:"
            value={invoicePaymentStatusLabel[invoice.paymentStatus]}
            valueClassName={statusTextClassByStatus[invoice.paymentStatus]}
          />
        </div>
      </section>

      <section>
        <h3 className="label-sm mb-3 uppercase text-petcenter-text-muted">
          Chi tiết thanh toán
        </h3>
        <div className="space-y-3">
          <PaymentRow
            label="Số tiền dịch vụ"
            value={formatInvoiceMoney(invoice.subtotalAmount)}
          />
          {invoice.discountAmount > 0 ? (
            <PaymentRow
              label="Giảm giá"
              value={`-${formatInvoiceMoney(invoice.discountAmount)}`}
            />
          ) : null}
          {invoice.surchargeAmount > 0 ? (
            <PaymentRow
              label="Phụ phí"
              value={formatInvoiceMoney(invoice.surchargeAmount)}
            />
          ) : null}
          <div className="h-px bg-petcenter-border" />
          <div className="flex items-center justify-between gap-4">
            <span className="title-md text-petcenter-text">Tổng thanh toán</span>
            <span className="heading-sm text-petcenter-primary">
              {formatInvoiceMoney(invoice.totalAmount)}
            </span>
          </div>
        </div>
      </section>

      <NoteBox status={invoice.paymentStatus} note={invoice.note} />
    </div>
  );
}

function DetailField({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between gap-4 md:block">
      <span className="body-sm text-petcenter-text-secondary md:block">
        {label}
      </span>
      <span className={cn("body-md font-medium text-petcenter-text", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

function PaymentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="body-md text-petcenter-text">{label}</span>
      <span className="body-md text-petcenter-text">{value}</span>
    </div>
  );
}

function NoteBox({
  note,
  status,
}: {
  note?: string;
  status: InvoicePaymentStatus;
}) {
  const fallbackNote = noteByStatus[status] ?? noteByStatus.DRAFT;

  return (
    <div
      className={cn(
        "rounded-r-control border-l-4 p-3",
        noteClassByStatus[status] ?? noteClassByStatus.DRAFT
      )}
    >
      <p className="body-sm">
        <span className="font-semibold">Ghi chú:</span> {note ?? fallbackNote}
      </p>
    </div>
  );
}

const statusTextClassByStatus: Record<InvoicePaymentStatus, string> = {
  PAID: "text-petcenter-success-text",
  PENDING_PAYMENT: "text-petcenter-warning-text",
  OVERDUE: "text-petcenter-danger-text",
  CANCELLED: "text-petcenter-text-secondary",
  DRAFT: "text-petcenter-text-secondary",
};

const noteClassByStatus: Record<InvoicePaymentStatus, string> = {
  PAID: "border-petcenter-success-text bg-petcenter-success-bg text-petcenter-success-text",
  PENDING_PAYMENT:
    "border-petcenter-warning-text bg-petcenter-warning-bg text-petcenter-warning-text",
  OVERDUE:
    "border-petcenter-danger-text bg-petcenter-danger-bg text-petcenter-danger-text",
  CANCELLED:
    "border-petcenter-text-muted bg-petcenter-background text-petcenter-text-secondary",
  DRAFT:
    "border-petcenter-text-muted bg-petcenter-background text-petcenter-text-secondary",
};

const noteByStatus: Record<InvoicePaymentStatus, string> = {
  PAID: "Hóa đơn đã được thanh toán thành công.",
  PENDING_PAYMENT: "Vui lòng thanh toán tại trung tâm.",
  OVERDUE: "Hóa đơn đã quá hạn thanh toán.",
  CANCELLED: "Hóa đơn đã được hủy.",
  DRAFT: "Hóa đơn đang ở trạng thái nháp.",
};
