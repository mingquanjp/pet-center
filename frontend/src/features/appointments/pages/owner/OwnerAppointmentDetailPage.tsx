"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppointmentStatusBadge } from "../../components/shared/AppointmentStatusBadge";
import { OwnerAppointmentContactCard } from "../../components/owner/OwnerAppointmentContactCard";
import { OwnerAppointmentContentCard } from "../../components/owner/OwnerAppointmentContentCard";
import { OwnerAppointmentInfoCard } from "../../components/owner/OwnerAppointmentInfoCard";
import { OwnerAppointmentPetCard } from "../../components/owner/OwnerAppointmentPetCard";
import { OwnerAppointmentStatusTimeline } from "../../components/owner/OwnerAppointmentStatusTimeline";
import { OwnerCancelAppointmentModal } from "../../components/owner/OwnerCancelAppointmentModal";
import { useCancelOwnerAppointment } from "../../hooks/useCancelOwnerAppointment";
import { useOwnerAppointmentDetail } from "../../hooks/useOwnerAppointmentDetail";
import { OwnerAppointmentStatus } from "../../types/appointment.types";

interface OwnerAppointmentDetailPageProps {
  appointmentId: string;
}

export function OwnerAppointmentDetailPage({
  appointmentId,
}: OwnerAppointmentDetailPageProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<OwnerAppointmentStatus | null>(null);
  const { data, isError, isLoading, refetch } = useOwnerAppointmentDetail(appointmentId);
  const { cancelAppointment } = useCancelOwnerAppointment();

  if (isLoading) {
    return (
      <div className="w-full max-w-[1280px]">
        <Card className="rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 body-md text-petcenter-text-secondary">
          Đang tải chi tiết lịch hẹn...
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full max-w-[1280px]">
        <Card className="items-center rounded-2xl border-petcenter-border bg-petcenter-card p-8 text-center shadow-card ring-0">
          <h1 className="title-md text-petcenter-text">Không tìm thấy lịch hẹn</h1>
          <Button
            asChild
            className="mt-4 h-10 rounded-[0.75rem] bg-petcenter-primary px-4 text-white hover:bg-petcenter-primary-hover"
          >
            <Link href="/owner/appointments">Quay lại danh sách</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const appointment = localStatus ? { ...data, status: localStatus } : data;
  const canCancel = appointment.status === "PENDING";

  async function handleCancelConfirm(reason?: string) {
    try {
      await cancelAppointment({ appointmentId: appointment.id, reason });
      setLocalStatus("CANCELLED");
      setIsCancelModalOpen(false);
      toast.success("Hủy lịch hẹn thành công");
      void refetch();
    } catch {
      setIsCancelModalOpen(false);
    }
  }

  return (
    <div className="flex w-full max-w-[1280px] flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav className="label-md flex flex-wrap items-center gap-2 text-petcenter-text-secondary">
          <Link className="transition-colors hover:text-petcenter-primary" href="/owner/appointments">
            Lịch hẹn
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link className="transition-colors hover:text-petcenter-primary" href="/owner/appointments">
            Danh sách lịch hẹn
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-petcenter-text">{appointment.appointmentCode}</span>
        </nav>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[0.75rem] border-petcenter-border bg-petcenter-card px-4 body-md font-semibold text-petcenter-danger-text hover:bg-petcenter-danger-bg"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Hủy lịch hẹn
            </Button>
          ) : null}
        <Button
          asChild
          variant="outline"
          className="h-10 w-full rounded-[0.75rem] border-petcenter-border bg-petcenter-card body-md font-medium text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-text md:w-auto"
        >
          <Link href="/owner/appointments">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Quay lại danh sách
          </Link>
        </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <h1 className="heading-lg text-petcenter-text">
          Chi tiết lịch hẹn: {appointment.appointmentCode}
        </h1>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <OwnerAppointmentInfoCard appointment={appointment} />
          <OwnerAppointmentPetCard pet={appointment.pet} />
          <OwnerAppointmentContactCard owner={appointment.owner} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-8">
          <OwnerAppointmentContentCard appointment={appointment} />
          <OwnerAppointmentStatusTimeline timeline={appointment.timeline} />
        </div>
      </div>

      <OwnerCancelAppointmentModal
        appointment={appointment}
        open={isCancelModalOpen}
        onConfirm={handleCancelConfirm}
        onOpenChange={setIsCancelModalOpen}
      />
    </div>
  );
}
