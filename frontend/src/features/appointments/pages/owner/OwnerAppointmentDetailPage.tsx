"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, FileSearch } from "lucide-react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
      <div className="w-full">
        <Card className="rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0 body-md text-petcenter-text-secondary">
          Đang tải chi tiết lịch khám...
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full">
        <Card className="items-center rounded-2xl border-petcenter-border bg-petcenter-card p-8 text-center shadow-card ring-0">
          <h1 className="title-md text-petcenter-text">Không tìm thấy lịch khám</h1>
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
  const examResultHref = appointment.examId
    ? `/owner/pets/${encodeURIComponent(appointment.pet.id)}/medical-exams/${encodeURIComponent(appointment.examId)}?returnUrl=${encodeURIComponent(`/owner/appointments/${encodeURIComponent(appointment.id)}`)}`
    : null;

  async function handleCancelConfirm(reason?: string) {
    try {
      await cancelAppointment({ appointmentId: appointment.id, reason });
      setLocalStatus("CANCELLED");
      setIsCancelModalOpen(false);
      toast.success("Hủy lịch khám thành công");
      void refetch();
    } catch {
      setIsCancelModalOpen(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Breadcrumb>
          <BreadcrumbList className="label-md text-petcenter-text-secondary">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link className="transition-colors hover:text-petcenter-primary" href="/owner/appointments">
                  Danh sách lịch khám
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-petcenter-text">{appointment.appointmentCode}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
          {appointment.status === "COMPLETED" && examResultHref ? (
            <Button
              asChild
              className="h-10 rounded-[0.75rem] bg-petcenter-primary px-4 body-md font-semibold text-white hover:bg-petcenter-primary-hover"
            >
              <Link href={examResultHref}>
                <FileSearch className="h-4 w-4" aria-hidden="true" />
                Xem kết quả khám
              </Link>
            </Button>
          ) : null}

          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[0.75rem] border-petcenter-border bg-petcenter-card px-4 body-md font-semibold text-petcenter-danger-text hover:bg-petcenter-danger-bg"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Hủy lịch khám
            </Button>
          ) : null}
        <Link
          className="label-md inline-flex h-10 w-full items-center justify-center gap-2 rounded-control border border-petcenter-primary px-4 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5 sm:w-auto"
          href="/owner/appointments"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <h1 className="heading-lg text-petcenter-text">
          Chi tiết lịch khám: {appointment.appointmentCode}
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
