import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffAppointmentDetail, StaffAppointmentDetailMode } from "../../../types/appointment.types";
import { formatAppointmentDateTime } from "../../../utils/appointment-format";
import { UserCheck } from "lucide-react";

interface Props {
  appointment: StaffAppointmentDetail;
  mode: StaffAppointmentDetailMode;
}

export function AppointmentSummaryCard({ appointment, mode }: Props) {
  const isProcess = mode === "PROCESS";
  const processDoctor = appointment.assignmentStatus === "NO_AVAILABLE_DOCTOR"
    ? null
    : appointment.suggestedDoctor ?? appointment.assignedDoctor;

  return (
    <Card className="rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5 text-petcenter-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Tóm tắt</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-petcenter-background/40 rounded-2xl p-5 flex flex-col gap-4 border border-petcenter-border/40 shadow-inner">
          <div className="flex justify-between items-center pb-3 border-b border-petcenter-border/50 dashed border-dashed">
            <span className="text-petcenter-text-secondary text-sm font-medium">Mã lịch</span>
            <span className="font-bold text-petcenter-text text-base bg-white px-2.5 py-0.5 rounded border border-petcenter-border/30 shadow-sm">{appointment.appointmentCode}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-petcenter-border/50 dashed border-dashed">
            <span className="text-petcenter-text-secondary text-sm font-medium">Dịch vụ</span>
            <span className="font-semibold text-petcenter-text text-base">{appointment.examType.name}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-petcenter-border/50 dashed border-dashed">
            <span className="text-petcenter-text-secondary text-sm font-medium">Thú cưng</span>
            <span className="font-semibold text-petcenter-text text-base">{appointment.pet.name} ({appointment.pet.species === "Dog" ? "Chó" : appointment.pet.species === "Cat" ? "Mèo" : "Khác"})</span>
          </div>

          <div className="flex justify-between items-center pt-2 pb-3 border-b border-petcenter-border/50 dashed border-dashed">
            <span className="text-petcenter-text-secondary text-sm font-medium pr-4 whitespace-nowrap">Thời gian dự kiến</span>
            <span className="font-bold text-petcenter-primary text-base text-right whitespace-nowrap">
              {(() => {
                const formatted = formatAppointmentDateTime(appointment.scheduledAt);
                const parts = formatted.split(" - ");
                if (parts.length === 2) {
                  const time = parts.find(p => p.includes(":"));
                  const date = parts.find(p => p.includes("/"));
                  if (time && date) {
                    return `${date} ${time}`;
                  }
                }
                return formatted.replace(" - ", " ");
              })()}
            </span>
          </div>

          <div className="flex justify-between items-start pt-2">
            <span className="text-petcenter-text-secondary text-sm font-medium pr-4 whitespace-nowrap">Bác sĩ phụ trách</span>
            <div className="text-right">
              {isProcess ? (
                processDoctor ? (
                  <>
                    <div className="font-semibold text-petcenter-text text-base">
                      {processDoctor.fullName}
                    </div>
                    <div className="text-xs text-petcenter-text-muted mt-0.5">
                      Hệ thống tự điều phối theo lịch trống
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-petcenter-danger-text text-base">
                      Chưa có bác sĩ khả dụng
                    </div>
                    <div className="text-xs text-petcenter-danger-text/80 mt-0.5 max-w-50">
                      Không thể xác nhận lịch vì khung giờ này chưa có bác sĩ rảnh.
                    </div>
                  </>
                )
              ) : (
                appointment.assignedDoctor ? (
                  <div className="font-semibold text-petcenter-text text-base">
                    {appointment.assignedDoctor.fullName}
                  </div>
                ) : (
                  <div className="font-medium text-petcenter-text-muted text-base italic">
                    Chưa có bác sĩ phụ trách
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
