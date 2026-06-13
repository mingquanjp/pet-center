"use client";

import * as React from "react";

import { OwnerInvoiceDetailModal } from "../../components/owner/OwnerInvoiceDetailModal";
import { OwnerInvoiceFilterBar } from "../../components/owner/OwnerInvoiceFilterBar";
import { OwnerInvoiceList } from "../../components/owner/OwnerInvoiceList";
import { OwnerInvoicePagination } from "../../components/owner/OwnerInvoicePagination";
import { useOwnerInvoices } from "../../hooks/useOwnerInvoices";
import { OwnerInvoiceFilters } from "../../types/invoice.types";

const defaultFilters: OwnerInvoiceFilters = {
  search: "",
  status: "ALL",
  serviceType: "ALL",
  date: "",
};

export function OwnerInvoicesPage() {
  const [filters, setFilters] =
    React.useState<OwnerInvoiceFilters>(defaultFilters);
  const [page, setPage] = React.useState(1);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<
    string | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const { data: invoices, pagination, isLoading, isError } = useOwnerInvoices(
    filters,
    page
  );

  const handleFiltersChange = (nextFilters: OwnerInvoiceFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const handleViewDetail = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedInvoiceId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <section>
        <h1 className="heading-lg text-petcenter-text">Hóa đơn của tôi</h1>
        <p className="body-md mt-1 text-petcenter-text-secondary">
          Theo dõi hóa đơn, trạng thái thanh toán và lịch sử giao dịch của bạn.
        </p>
      </section>

      <OwnerInvoiceFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {isError ? (
        <div className="rounded-card border border-petcenter-danger-bg bg-petcenter-danger-bg/30 p-6 text-center">
          <h2 className="heading-sm text-petcenter-danger-text">
            Lỗi tải dữ liệu
          </h2>
          <p className="body-md mt-2 text-petcenter-text-secondary">
            Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.
          </p>
        </div>
      ) : (
        <div
          className={
            isLoading
              ? "pointer-events-none opacity-50 transition-opacity"
              : "opacity-100 transition-opacity"
          }
        >
          <OwnerInvoiceList
            invoices={invoices}
            onReset={handleResetFilters}
            onViewDetail={handleViewDetail}
          />
        </div>
      )}

      <OwnerInvoicePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <OwnerInvoiceDetailModal
        open={isDetailOpen}
        invoiceId={selectedInvoiceId}
        onOpenChange={handleDetailOpenChange}
      />
    </div>
  );
}
