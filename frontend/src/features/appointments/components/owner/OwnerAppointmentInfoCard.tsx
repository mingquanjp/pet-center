import { Calendar, Clock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { OwnerAppointmentDetail } from "../../types/appointment.types";
import {
  formatAppointmentTimeUtc,
  formatAppointmentWeekdayDate,
} from "../../utils/appointment-format";

interface OwnerAppointmentInfoCardProps {
  appointment: OwnerAppointmentDetail;
}

export function OwnerAppointmentInfoCard({ appointment }: OwnerAppointmentInfoCardProps) {
  return (
    <Card className="gap-0 rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0">
      <h2 className="title-md mb-4 text-petcenter-text">Thông tin lịch hẹn</h2>
      <div className="divide-y divide-petcenter-border">
        <InfoRow label="Mã lịch hẹn" value={appointment.appointmentCode} strong />
        <InfoRow label="Loại dịch vụ" value={appointment.serviceName} />
        <InfoRow
          icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
          label="Ngày hẹn"
          value={formatAppointmentWeekdayDate(appointment.scheduledAt)}
        />
        <InfoRow
          icon={<Clock className="h-4 w-4" aria-hidden="true" />}
          label="Thời gian"
          value={formatAppointmentTimeUtc(appointment.scheduledAt)}
          highlight
          strong
        />
      </div>
    </Card>
  );
}

function InfoRow({
  highlight,
  icon,
  label,
  strong,
  value,
}: {
  highlight?: boolean;
  icon?: React.ReactNode;
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <span className="body-sm flex items-center gap-2 text-petcenter-text-secondary">
        {icon}
        {label}
      </span>
      <span
        className={[
          "body-md text-right",
          highlight ? "text-petcenter-primary" : "text-petcenter-text",
          strong ? "font-semibold" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
