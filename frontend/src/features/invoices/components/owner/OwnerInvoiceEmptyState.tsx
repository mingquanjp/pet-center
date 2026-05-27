import * as React from "react";
import { FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";

interface OwnerInvoiceEmptyStateProps {
  onReset: () => void;
}

export function OwnerInvoiceEmptyState({ onReset }: OwnerInvoiceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-petcenter-border bg-petcenter-card px-6 py-16 text-center shadow-card">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-pill bg-petcenter-background text-petcenter-text-secondary">
        <FileSearch className="h-6 w-6" />
      </div>
      <h3 className="heading-sm text-petcenter-text">
        Không tìm thấy hóa đơn phù hợp
      </h3>
      <p className="body-md mt-2 max-w-md text-petcenter-text-secondary">
        Hãy thử thay đổi bộ lọc hoặc đặt lại bộ lọc.
      </p>
      <Button
        type="button"
        onClick={onReset}
        className="mt-5 h-10 rounded-control bg-petcenter-primary px-4 text-white hover:bg-petcenter-primary-hover"
      >
        Đặt lại bộ lọc
      </Button>
    </div>
  );
}
