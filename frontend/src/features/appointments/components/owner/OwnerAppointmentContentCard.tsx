import { Card } from "@/components/ui/card";
import { OwnerAppointmentDetail } from "../../types/appointment.types";

interface OwnerAppointmentContentCardProps {
  appointment: OwnerAppointmentDetail;
}

export function OwnerAppointmentContentCard({ appointment }: OwnerAppointmentContentCardProps) {
  return (
    <Card className="gap-0 rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0">
      <h2 className="title-md mb-4 text-petcenter-text">Nội dung đặt lịch</h2>
      <div className="space-y-4">
        <ContentBox label="Lý do khám:" value={appointment.reason} />
        <ContentBox label="Ghi chú thêm:" value={appointment.note || "Không có yêu cầu đặc biệt"} />
      </div>
    </Card>
  );
}

function ContentBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.75rem] border border-petcenter-border bg-petcenter-background p-4">
      <p className="label-md mb-1 text-petcenter-text-secondary">{label}</p>
      <p className="body-md text-petcenter-text">{value}</p>
    </div>
  );
}
