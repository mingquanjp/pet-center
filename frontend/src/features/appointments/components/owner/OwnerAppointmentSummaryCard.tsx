import Link from "next/link";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "../shared/AppointmentStatusBadge";
import {
  OwnerAppointmentPetOption,
  OwnerExamTypeOption,
} from "../../types/appointment.types";
import {
  buildScheduledAt,
  formatAppointmentTimeWithPeriod,
  formatAppointmentWeekdayDate,
} from "../../utils/appointment-format";

interface OwnerAppointmentSummaryCardProps {
  appointmentDate: string;
  examType?: OwnerExamTypeOption;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  pet?: OwnerAppointmentPetOption;
  timeSlot: string;
  onSubmit: () => void;
}

const speciesLabel: Record<OwnerAppointmentPetOption["species"], string> = {
  Dog: "Chó",
  Cat: "Mèo",
  Other: "Khác",
};

export function OwnerAppointmentSummaryCard({
  appointmentDate,
  examType,
  isSubmitDisabled,
  isSubmitting,
  onSubmit,
  pet,
  timeSlot,
}: OwnerAppointmentSummaryCardProps) {
  const scheduledAt =
    appointmentDate && timeSlot ? buildScheduledAt(appointmentDate, timeSlot) : "";

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-2xl border border-petcenter-border bg-petcenter-card p-6 shadow-card">
        <h2 className="heading-sm mb-4 border-b border-petcenter-border pb-4 text-petcenter-text">
          Tóm tắt lịch hẹn
        </h2>

        <div className="mb-8 flex flex-col gap-4">
          <SummaryRow
            label="Thú cưng:"
            value={pet ? `${pet.name} (${speciesLabel[pet.species]})` : "Chưa chọn"}
          />
          <SummaryRow label="Loại hình:" value={examType?.name ?? "Chưa chọn"} />
          <SummaryRow
            label="Ngày hẹn:"
            value={scheduledAt ? formatAppointmentWeekdayDate(scheduledAt) : "Chưa chọn"}
          />
          <SummaryRow
            highlight
            label="Giờ hẹn:"
            value={scheduledAt ? formatAppointmentTimeWithPeriod(scheduledAt) : "Chưa chọn"}
          />
          <div className="mt-2 flex items-center justify-between border-t border-petcenter-border pt-4">
            <span className="body-md text-petcenter-text-secondary">Trạng thái:</span>
            <AppointmentStatusBadge status="PENDING" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            disabled={isSubmitDisabled || isSubmitting}
            className="h-12 rounded-[0.75rem] bg-petcenter-cta title-md text-white shadow-card transition-all hover:bg-petcenter-cta-hover active:scale-95 disabled:opacity-60"
            onClick={onSubmit}
          >
            <CheckCircle className="h-5 w-5" aria-hidden="true" />
            {isSubmitting ? "Đang tạo lịch..." : "Xác nhận tạo lịch"}
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-[0.75rem] border-petcenter-primary bg-transparent title-md text-petcenter-primary hover:bg-petcenter-success-bg"
          >
            <Link href="/owner/appointments">Hủy bỏ</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  highlight,
  label,
  value,
}: {
  highlight?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="body-md text-petcenter-text-secondary">{label}</span>
      <span
        className={[
          "title-md text-right",
          highlight ? "text-petcenter-primary" : "text-petcenter-text",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
