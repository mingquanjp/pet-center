import * as React from "react";

import { OwnerInvoice } from "../../types/invoice.types";
import { OwnerInvoiceCard } from "./OwnerInvoiceCard";
import { OwnerInvoiceEmptyState } from "./OwnerInvoiceEmptyState";

interface OwnerInvoiceListProps {
  invoices: OwnerInvoice[];
  onReset: () => void;
  onViewDetail: (invoiceId: string) => void;
}

export function OwnerInvoiceList({
  invoices,
  onReset,
  onViewDetail,
}: OwnerInvoiceListProps) {
  if (invoices.length === 0) {
    return <OwnerInvoiceEmptyState onReset={onReset} />;
  }

  return (
    <section className="w-full space-y-4">
      {invoices.map((invoice) => (
        <OwnerInvoiceCard
          key={invoice.id}
          invoice={invoice}
          onViewDetail={onViewDetail}
        />
      ))}
    </section>
  );
}
