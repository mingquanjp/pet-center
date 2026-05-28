"use client"
import * as React from "react"
import { useState } from "react"
import { StaffInvoiceFilterBar } from "../../components/staff/StaffInvoiceFilterBar"
import { StaffInvoiceList } from "../../components/staff/StaffInvoiceList"
import { ConfirmPaymentModal } from "../../components/staff/ConfirmPaymentModal"
import { CancelInvoiceModal } from "../../components/staff/CancelInvoiceModal"
import { useStaffInvoices } from "../../hooks/useStaffInvoices"
import { StaffInvoice, StaffInvoiceFilters } from "../../types/invoice.types"
import { LoadingState } from "@/components/ui/loading-state"

const DEFAULT_FILTERS: StaffInvoiceFilters = {
  search: "",
  status: "ALL",
  serviceType: "ALL",
  timeRange: "ALL",
}

export function StaffInvoicesPage() {
  const [filters, setFilters] = useState<StaffInvoiceFilters>(DEFAULT_FILTERS)

  const {
    data: invoices,
    isLoading,
    hasMore,
    isFetchingNextPage,
    loadMore,
    refetch,
    updateInvoice,
    isInitialLoading,
    isError
  } = useStaffInvoices(filters)

  const [selectedInvoice, setSelectedInvoice] = useState<StaffInvoice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const handleConfirmPayment = (invoice: StaffInvoice) => {
    setSelectedInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleCancelInvoice = (invoice: StaffInvoice) => {
    setSelectedInvoice(invoice)
    setIsCancelModalOpen(true)
  }

  const handleFiltersChange = (newFilters: StaffInvoiceFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const handlePaymentSuccess = () => {
    if (selectedInvoice) {
      updateInvoice(selectedInvoice.id, { paymentStatus: "PAID", invoiceStatus: "PAID" });
    }
  }

  const handleCancelSuccess = () => {
    if (selectedInvoice) {
      updateInvoice(selectedInvoice.id, { paymentStatus: "OVERDUE", invoiceStatus: "OVERDUE" });
    }
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-lg text-petcenter-text tracking-tight">Hóa đơn</h2>
          <p className="body-md text-petcenter-text-secondary mt-1">Theo dõi và xử lý hóa đơn thanh toán tại trung tâm.</p>
        </div>
      </div>

      <StaffInvoiceFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {isInitialLoading ? (
        <LoadingState
          title="Đang tải dữ liệu..."
          description="Vui lòng đợi giây lát trong khi chúng tôi tải dữ liệu từ hệ thống."
        />
      ) : isError && invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-petcenter-danger-bg/30 rounded-[16px] border border-petcenter-danger-bg mt-6">
          <h3 className="heading-sm text-petcenter-danger-text mb-2 text-center">Lỗi tải dữ liệu</h3>
          <p className="body-md text-petcenter-text-secondary text-center max-w-sm mb-4">
            Không thể tải dữ liệu hóa đơn. Vui lòng kiểm tra lại kết nối mạng hoặc quyền truy cập của bạn (Yêu cầu tài khoản Staff/Admin).
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-petcenter-danger-text text-white rounded-[12px] body-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <StaffInvoiceList
            invoices={invoices}
            hasMore={hasMore}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={loadMore}
            onConfirmPayment={handleConfirmPayment}
            onCancelInvoice={handleCancelInvoice}
            onReset={handleResetFilters}
          />
        </div>
      )}

      {/* Spacer for bottom padding */}
      <div className="h-8"></div>

      <ConfirmPaymentModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      <CancelInvoiceModal
        invoice={selectedInvoice}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={handleCancelSuccess}
      />
    </div>
  )
}
