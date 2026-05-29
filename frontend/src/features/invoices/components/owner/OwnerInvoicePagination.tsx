import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const pages = buildPaginationItems(totalPages);

  return (
    <nav
      className="flex justify-center pt-2 pb-8"
      aria-label="Phân trang hóa đơn"
    >
      <div className="flex items-center gap-1">
        <PaginationButton
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-petcenter-text-secondary"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <PaginationButton
              key={item}
              isActive={item === page}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PaginationButton>
          )
        )}

        <PaginationButton
          aria-label="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </nav>
  );
}

function PaginationButton({
  isActive,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { isActive?: boolean }) {
  return (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      className={cn(
        "h-9 w-9 rounded-control p-0 body-sm",
        isActive
          ? "bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
          : "border-petcenter-border bg-petcenter-card text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-text",
        className
      )}
      {...props}
    />
  );
}

function buildPaginationItems(totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  return [1, 2, 3, "ellipsis"];
}
