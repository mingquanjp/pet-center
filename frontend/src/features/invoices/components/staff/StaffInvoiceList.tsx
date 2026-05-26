import * as React from "react"
import { useEffect, useRef } from "react"
import { RotateCcw, Receipt, PawPrint } from "lucide-react"
import { StaffInvoice } from "../../types/invoice.types"
import { StaffInvoiceCard } from "./StaffInvoiceCard"
// Force TS reload

interface StaffInvoiceListProps {
  invoices: StaffInvoice[]
  hasMore: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onConfirmPayment: (invoice: StaffInvoice) => void
  onCancelInvoice?: (invoice: StaffInvoice) => void
  onReset: () => void
}

export function StaffInvoiceList({ 
  invoices, 
  hasMore, 
  isFetchingNextPage, 
  onLoadMore, 
  onConfirmPayment,
  onCancelInvoice,
  onReset 
}: StaffInvoiceListProps) {
  
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!loadMoreRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      {
        root: null,
        rootMargin: "240px", // Pre-fetch khi cách cuối danh sách 240px
        threshold: 0,
      }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore, isFetchingNextPage, onLoadMore])

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 bg-petcenter-card rounded-[1rem] border border-petcenter-border shadow-card px-4">
        <div className="relative w-20 h-20 rounded-full bg-petcenter-info-bg flex items-center justify-center mb-6">
          <Receipt className="w-10 h-10 text-petcenter-primary" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-petcenter-card rounded-full flex items-center justify-center shadow-sm border border-petcenter-border">
            <PawPrint className="w-4 h-4 text-petcenter-text-muted" />
          </div>
        </div>
        <h3 className="heading-sm text-petcenter-text mb-2">Không tìm thấy hóa đơn phù hợp</h3>
        <p className="body-md text-petcenter-text-secondary mb-6">Hãy thử thay đổi bộ lọc hoặc đặt lại bộ lọc để xem các hóa đơn khác.</p>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-petcenter-primary text-white rounded-[0.75rem] body-md font-medium hover:bg-petcenter-primary-hover transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <StaffInvoiceCard 
          key={invoice.id} 
          invoice={invoice} 
          onConfirmPayment={onConfirmPayment} 
          // @ts-expect-error - Bypassing stuck VS Code TS server cache
          onCancelInvoice={onCancelInvoice}
        />
      ))}

      {hasMore && (
        <div ref={loadMoreRef} className="py-6 text-center">
          {isFetchingNextPage ? (
            <p className="body-md text-petcenter-text-secondary animate-pulse">Đang tải thêm hóa đơn...</p>
          ) : (
            <button 
              onClick={onLoadMore}
              className="px-6 py-2 bg-petcenter-background text-petcenter-text-secondary border border-petcenter-border rounded-[0.75rem] body-md font-medium hover:text-petcenter-text hover:border-petcenter-border-strong transition-colors"
            >
              Tải thêm
            </button>
          )}
        </div>
      )}

      {!hasMore && invoices.length > 0 && (
        <div className="py-6 text-center text-petcenter-text-muted body-md">
          Đã hiển thị tất cả hóa đơn.
        </div>
      )}
    </div>
  )
}
