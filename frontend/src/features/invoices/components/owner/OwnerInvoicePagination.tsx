import { AppPagination } from "@/components/ui/app-pagination";

interface OwnerInvoicePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OwnerInvoicePagination({
  page,
  totalPages,
  onPageChange,
}: OwnerInvoicePaginationProps) {
  return (
    <AppPagination
      ariaLabel="Phân trang hóa đơn"
      className="pb-8 pt-2"
      currentPage={page}
      onPageChange={onPageChange}
      size="sm"
      totalPages={totalPages}
    />
  );
}
