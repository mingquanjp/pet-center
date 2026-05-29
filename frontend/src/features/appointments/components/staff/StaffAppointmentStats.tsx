import { Clock, CheckCircle2, XCircle, CalendarDays } from "lucide-react";

interface Props {
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  todayTotalCount: number;
}

export function StaffAppointmentStats({
  pendingCount,
  confirmedCount,
  rejectedCount,
  cancelledCount,
  todayTotalCount,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Chờ xác nhận */}
      <div className="bg-petcenter-card border border-petcenter-border rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-petcenter-text-secondary font-medium">Chờ xác nhận</p>
          <p className="text-2xl font-bold text-petcenter-text">{pendingCount}</p>
        </div>
      </div>

      {/* Đã xác nhận */}
      <div className="bg-petcenter-card border border-petcenter-border rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="w-12 h-12 rounded-full bg-petcenter-success-bg text-petcenter-success-text flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-petcenter-text-secondary font-medium">Đã xác nhận</p>
          <p className="text-2xl font-bold text-petcenter-text">{confirmedCount}</p>
        </div>
      </div>

      {/* Từ chối */}
      <div className="bg-petcenter-card border border-petcenter-border rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="w-12 h-12 rounded-full bg-petcenter-danger-bg text-petcenter-danger-text flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-petcenter-text-secondary font-medium">Từ chối</p>
          <p className="text-2xl font-bold text-petcenter-text">{rejectedCount}</p>
        </div>
      </div>

      {/* Đã hủy */}
      <div className="bg-petcenter-card border border-petcenter-border rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-petcenter-text-secondary font-medium">Đã hủy</p>
          <p className="text-2xl font-bold text-petcenter-text">{cancelledCount}</p>
        </div>
      </div>

      {/* Tổng lịch hôm nay */}
      <div className="bg-petcenter-card border border-petcenter-border rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="w-12 h-12 rounded-full bg-petcenter-info-bg text-petcenter-info-text flex items-center justify-center shrink-0">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-petcenter-text-secondary font-medium">Tổng lịch hôm nay</p>
          <p className="text-2xl font-bold text-petcenter-text">{todayTotalCount}</p>
        </div>
      </div>
    </div>
  );
}
