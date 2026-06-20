import * as React from "react";
import { AlertCircle, Calendar, CreditCard, Eye, PawPrint } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <article className="flex h-full min-h-[210px] flex-col rounded-card border border-petcenter-border bg-petcenter-card p-4 shadow-card transition-all hover:border-petcenter-primary/30 hover:shadow-md">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.75rem]",
              serviceIconClassByType[invoice.serviceType]
            )}
          >
            <InvoiceServiceIcon type={invoice.serviceType} className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h3 className="title-md truncate text-petcenter-text">
              {invoice.title}
            </h3>
            <p className="label-sm mt-0.5 text-petcenter-text-secondary">
              {invoice.invoiceCode}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <InvoiceStatusBadge status={invoice.paymentStatus} className="w-fit" />
          {shouldShowCounterWarning ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-petcenter-warning-bg px-2 py-0.5 label-sm text-petcenter-warning-text">
              <AlertCircle className="h-3.5 w-3.5" />
              Tại trung tâm
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2 body-sm text-petcenter-text-secondary">
        <PetMeta imageUrl={invoice.pet.imageUrl} name={invoice.pet.name} />
        <CompactText>{invoice.serviceName}</CompactText>
        <CompactMetaItem icon={Calendar}>
          {formatInvoiceDate(invoice.issuedAt)}
        </CompactMetaItem>
        <CompactMetaItem icon={CreditCard}>
          {invoicePaymentOptionLabel[invoice.paymentOption]}
        </CompactMetaItem>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-petcenter-border pt-4">
        <span
          className={cn(
            "heading-sm min-w-0 truncate",
            invoice.paymentStatus === "PAID"
              ? "text-petcenter-primary"
              : "text-petcenter-text"
          )}
        >
          {formatInvoiceMoney(invoice.totalAmount)}
        </span>

        <Button
          type="button"
          variant="outline"
          onClick={() => onViewDetail(invoice.id)}
          className="h-9 shrink-0 rounded-control border-petcenter-primary bg-petcenter-card px-3 text-petcenter-primary hover:bg-petcenter-background hover:text-petcenter-primary-hover"
        >
          <Eye className="h-4 w-4" />
          Chi tiết
        </Button>
      </div>
    </article>
  );
}

function PetMeta({ imageUrl, name }: { imageUrl?: string; name: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar className="size-7" size="sm">
        {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
        <AvatarFallback className="bg-petcenter-success-bg text-petcenter-success-text">
          <PawPrint className="size-4" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate font-medium text-petcenter-text">
        {name}
      </span>
    </span>
  );
}

function CompactText({ children }: { children: React.ReactNode }) {
  return (
    <span className="min-w-0 truncate text-petcenter-text-secondary">
      {children}
    </span>
  );
}

function CompactMetaItem({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <Icon className="h-4 w-4 shrink-0 text-petcenter-text-secondary" />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
