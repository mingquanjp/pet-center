import { CalendarSearch, RotateCcw, PawPrint } from "lucide-react";

interface Props {
  onReset: () => void;
}

export function StaffAppointmentEmptyState({ onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
      <div className="relative w-20 h-20 rounded-full bg-petcenter-info-bg flex items-center justify-center mb-6">
        <CalendarSearch className="w-10 h-10 text-petcenter-primary" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-petcenter-card rounded-full flex items-center justify-center shadow-sm border border-petcenter-border">
          <PawPrint className="w-4 h-4 text-petcenter-text-muted" />
        </div>
      </div>
      <h3 className="heading-sm text-petcenter-text mb-2">Không tìm thấy lịch hẹn phù hợp</h3>
      <p className="body-md text-petcenter-text-secondary mb-6">
        Hãy thử thay đổi bộ lọc hoặc đặt lại bộ lọc để xem các lịch hẹn khác.
      </p>
      <button 
        onClick={onReset}
        className="px-6 py-2 bg-petcenter-primary text-white rounded-[0.75rem] body-md font-medium hover:bg-petcenter-primary-hover transition-colors flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
      </button>
    </div>
  );
}
