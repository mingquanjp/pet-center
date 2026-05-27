import * as React from "react";
import { AlertCircle, Calendar, CreditCard, PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { invoicePaymentOptionLabel } from "../../constants/invoice.constants";
import { OwnerInvoice } from "../../types/invoice.types";
import { formatInvoiceDate, formatInvoiceMoney } from "../../utils/invoice-format";
import { InvoiceServiceIcon } from "../shared/InvoiceServiceIcon";
import { InvoiceStatusBadge } from "../shared/InvoiceStatusBadge";

interface OwnerInvoiceCardProps {
  invoice: OwnerInvoice;
  onViewDetail: (invoiceId: string) => void;
}

const serviceIconClassByType: Record<OwnerInvoice["serviceType"], string> = {
  MEDICAL: "bg-petcenter-danger-bg text-petcenter-danger-text",
  GROOMING: "bg-petcenter-success-bg text-petcenter-success-text",
  BOARDING: "bg-petcenter-warning-bg text-petcenter-warning-text",
  PRESCRIPTION: "bg-petcenter-info-bg text-petcenter-info-text",
  OTHER: "bg-petcenter-background text-petcenter-text-secondary",
};

export function OwnerInvoiceCard({
  invoice,
  onViewDetail,
}: OwnerInvoiceCardProps) {
  const shouldShowCounterWarning =
    invoice.paymentStatus === "PENDING_PAYMENT" &&
    invoice.paymentOption === "AT_COUNTER";

  return (
    <article className="overflow-hidden rounded-card border border-petcenter-border bg-petcenter-card shadow-card">
      <div className="flex flex-col gap-4 border-b border-petcenter-border bg-petcenter-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-pill",
              serviceIconClassByType[invoice.serviceType]
            )}
          >
            <InvoiceServiceIcon type={invoice.serviceType} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="title-md truncate text-petcenter-text">
              {invoice.title}
            </h3>
            <p className="body-sm text-petcenter-text-secondary">
              Mã HĐ: {invoice.invoiceCode}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <InvoiceStatusBadge status={invoice.paymentStatus} />
          <span
            className={cn(
              "heading-sm",
              invoice.paymentStatus === "PAID"
                ? "text-petcenter-primary"
                : "text-petcenter-text"
            )}
          >
            {formatInvoiceMoney(invoice.totalAmount)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <InvoiceDetailItem label="Thú cưng">
          <span className="flex items-center gap-2 font-medium text-petcenter-text">
            <PawPrint className="h-4 w-4 text-petcenter-text-secondary" />
            {invoice.pet.name}
          </span>
        </InvoiceDetailItem>
        <InvoiceDetailItem label="Loại dịch vụ">
          {invoice.serviceName}
        </InvoiceDetailItem>
        <InvoiceDetailItem label="Ngày tạo">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-petcenter-text-secondary" />
            {formatInvoiceDate(invoice.issuedAt)}
          </span>
        </InvoiceDetailItem>
        <InvoiceDetailItem label="Hình thức thanh toán">
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-petcenter-text-secondary" />
            {invoicePaymentOptionLabel[invoice.paymentOption]}
          </span>
        </InvoiceDetailItem>
      </div>

      <div className="flex flex-col gap-3 border-t border-petcenter-border bg-petcenter-card p-4 sm:flex-row sm:items-center sm:justify-between">
        {shouldShowCounterWarning ? (
          <p className="body-sm inline-flex w-fit items-center gap-2 rounded-control bg-petcenter-warning-bg px-3 py-2 text-petcenter-warning-text">
            <AlertCircle className="h-4 w-4" />
            Vui lòng thanh toán tại trung tâm
          </p>
        ) : (
          <span aria-hidden="true" />
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => onViewDetail(invoice.id)}
          className="h-10 rounded-control border-petcenter-primary bg-petcenter-card px-4 text-petcenter-primary hover:bg-petcenter-background hover:text-petcenter-primary-hover sm:w-auto"
        >
          Xem chi tiết
        </Button>
      </div>
    </article>
  );
}

function InvoiceDetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="label-sm mb-1 uppercase text-petcenter-text-muted">
        {label}
      </p>
      <div className="body-md text-petcenter-text">{children}</div>
    </div>
  );
}
