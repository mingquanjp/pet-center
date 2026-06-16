import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffAppointmentDetail } from "../../../types/appointment.types";
import { formatAppointmentDate, formatAppointmentTime, getBookingChannelLabel } from "../../../utils/appointment-format";
import { Calendar, Clock, MonitorSmartphone, Activity, Hash } from "lucide-react";
import { StaffAppointmentStatusBadge } from "../StaffAppointmentStatusBadge";

interface Props {
  appointment: StaffAppointmentDetail;
}

export function AppointmentInfoCard({ appointment }: Props) {
  return (
    <Card className="rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5 text-petcenter-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Thông tin lịch khám</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4 text-petcenter-text-muted" /> Mã lịch
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">{appointment.appointmentCode}</div>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-petcenter-text-muted" /> Loại lịch
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">{appointment.examType.name}</div>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-petcenter-text-muted" /> Ngày hẹn
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">{formatAppointmentDate(appointment.scheduledAt)}</div>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-petcenter-text-muted" /> Giờ hẹn
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">{formatAppointmentTime(appointment.scheduledAt)}</div>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-petcenter-text-muted flex items-center justify-center" /> Trạng thái
            </span>
            <div className="pl-6">
              <StaffAppointmentStatusBadge status={appointment.status} />
            </div>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <MonitorSmartphone className="w-4 h-4 text-petcenter-text-muted" /> Kênh đặt
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">
              {getBookingChannelLabel(appointment.bookingChannel)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
