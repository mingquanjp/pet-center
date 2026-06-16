import { CalendarSearch } from "lucide-react";

import { Button } from "@/components/ui/button";

interface OwnerAppointmentEmptyStateProps {
  onResetFilters: () => void;
}

export function OwnerAppointmentEmptyState({ onResetFilters }: OwnerAppointmentEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-petcenter-border bg-petcenter-card px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-petcenter-background text-petcenter-primary">
        <CalendarSearch className="size-6" aria-hidden="true" />
      </div>
      <h3 className="title-md text-petcenter-text">Không tìm thấy lịch khám phù hợp</h3>
      <p className="body-md mx-auto mt-2 max-w-md text-petcenter-text-secondary">
        Hãy thử thay đổi bộ lọc hoặc đặt lại bộ lọc.
      </p>
      <Button
        type="button"
        className="mt-5 h-10 rounded-[0.75rem] bg-petcenter-primary px-4 body-md font-semibold text-white hover:bg-petcenter-primary-hover"
        onClick={onResetFilters}
      >
        Đặt lại bộ lọc
      </Button>
    </div>
  );
}
