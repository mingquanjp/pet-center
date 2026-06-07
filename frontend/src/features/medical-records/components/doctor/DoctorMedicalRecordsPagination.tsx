import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set<number>([1, totalPages, currentPage]);

  if (currentPage > 1) items.add(currentPage - 1);
  if (currentPage < totalPages) items.add(currentPage + 1);
  if (currentPage <= 3) {
    items.add(2);
    items.add(3);
    items.add(4);
  }
  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 3);
    items.add(totalPages - 2);
    items.add(totalPages - 1);
  }

  const sortedItems = Array.from(items)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  return sortedItems.flatMap((item, index) => {
    const previousItem = sortedItems[index - 1];

    if (previousItem && item - previousItem > 1) {
      return ["ellipsis", item] as Array<number | "ellipsis">;
    }

    return [item];
  });
}

export function DoctorMedicalRecordsPagination({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
}: Props) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row bg-white">
      <p className="text-sm text-petcenter-text-secondary">
        Hiển thị <span className="font-medium text-petcenter-text">{start}</span> - <span className="font-medium text-petcenter-text">{end}</span> trên <span className="font-medium text-petcenter-text">{total}</span> hồ sơ
      </p>
      <nav className="flex items-center gap-2" aria-label="Phân trang">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          {getPaginationItems(page, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 min-w-9 items-center justify-center text-sm font-medium text-petcenter-text-secondary"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  "h-9 min-w-9 rounded-[0.75rem] px-3 text-sm font-medium transition disabled:cursor-not-allowed",
                  item === page
                    ? "bg-petcenter-primary text-white shadow-sm"
                    : "border border-petcenter-border bg-white text-petcenter-text hover:bg-petcenter-background"
                )}
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
