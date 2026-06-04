import { ChevronLeft, ChevronRight } from "lucide-react";

import { DoctorMedicalRecordPagination as DoctorMedicalRecordPaginationInfo } from "../../types/medical-record.types";

interface Props {
  pagination: DoctorMedicalRecordPaginationInfo;
  onPageChange: (page: number) => void;
}

export function DoctorMedicalRecordPagination({ pagination, onPageChange }: Props) {
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row">
      <p className="text-sm text-petcenter-text-secondary">
        Hiển thị <span className="font-medium text-petcenter-text">{start}</span>-
        <span className="font-medium text-petcenter-text">{end}</span> trên{" "}
        <span className="font-medium text-petcenter-text">{pagination.total}</span> hồ sơ
      </p>
      <div className="flex items-center gap-2">
        <button
          aria-label="Trang trước"
          className="flex h-9 w-9 items-center justify-center rounded-control border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pagination.page === 1}
          onClick={() => onPageChange(pagination.page - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center text-sm font-medium text-petcenter-text">
          {pagination.page}/{pagination.totalPages}
        </span>
        <button
          aria-label="Trang sau"
          className="flex h-9 w-9 items-center justify-center rounded-control border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pagination.page === pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
