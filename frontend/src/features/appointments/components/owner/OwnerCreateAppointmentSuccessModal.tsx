"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentStatusBadge } from "../shared/AppointmentStatusBadge";
import { CreateOwnerAppointmentResult } from "../../types/appointment.types";
import {
  formatAppointmentTimeUtc,
  formatAppointmentWeekdayDate,
} from "../../utils/appointment-format";

interface OwnerCreateAppointmentSuccessModalProps {
  open: boolean;
  appointment: CreateOwnerAppointmentResult | null;
  onOpenChange: (open: boolean) => void;
}

export function OwnerCreateAppointmentSuccessModal({
  appointment,
  onOpenChange,
  open,
}: OwnerCreateAppointmentSuccessModalProps) {
  if (!appointment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border border-petcenter-border bg-petcenter-card p-6 text-center shadow-modal sm:max-w-[640px] md:p-8">
        <DialogHeader className="items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-petcenter-success-bg text-petcenter-primary">
            <Check className="h-9 w-9 stroke-[3]" aria-hidden="true" />
          </div>
          <DialogTitle className="heading-md text-petcenter-text">
            Tạo lịch hẹn thành công
          </DialogTitle>
          <DialogDescription className="body-md max-w-md text-petcenter-text-secondary">
            Lịch hẹn của bạn đã được tạo và đang chờ trung tâm xác nhận.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background p-5 text-left">
          <div className="grid gap-3">
            <InfoLine label="Mã lịch hẹn:" value={appointment.appointmentCode} />
            <InfoLine label="Thú cưng:" value={appointment.petName} />
            <InfoLine label="Loại hình khám:" value={appointment.examTypeName} />
            <InfoLine
              label="Ngày hẹn:"
              value={formatAppointmentWeekdayDate(appointment.scheduledAt)}
            />
            <InfoLine
              label="Giờ hẹn:"
              value={formatAppointmentTimeUtc(appointment.scheduledAt)}
            />
            <div className="flex items-center justify-between gap-4">
              <span className="body-sm text-petcenter-text-secondary">Trạng thái:</span>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
          </div>
        </div>

        <p className="body-sm mx-auto max-w-lg text-petcenter-text-secondary">
          Trung tâm sẽ kiểm tra và xác nhận lịch hẹn của bạn. Bạn sẽ nhận được thông báo khi lịch hẹn được xác nhận.
        </p>

        <DialogFooter className="-mx-6 -mb-6 grid gap-3 rounded-b-2xl border-t border-petcenter-border bg-petcenter-card p-6 sm:grid-cols-2 md:-mx-8 md:-mb-8 md:px-8">
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-[0.75rem] border-petcenter-border bg-petcenter-card title-md text-petcenter-text hover:bg-petcenter-background"
          >
            <Link href="/owner/dashboard">Về tổng quan</Link>
          </Button>
          <Button
            asChild
            className="h-12 rounded-[0.75rem] bg-petcenter-primary title-md text-white shadow-card hover:bg-petcenter-primary-hover"
          >
            <Link href={`/owner/appointments?createdAppointmentId=${encodeURIComponent(appointment.id)}`}>
              Xem lịch hẹn
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="body-sm text-petcenter-text-secondary">{label}</span>
      <span className="body-md text-right font-semibold text-petcenter-text">{value}</span>
    </div>
  );
}
