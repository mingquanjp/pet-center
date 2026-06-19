import Link from "next/link";
import {
  ChevronRight,
  FlaskConical,
  PawPrint,
  RotateCcw,
  Scissors,
  Stethoscope,
  Syringe,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppointmentStatusBadge } from "../shared/AppointmentStatusBadge";
import { OwnerAppointment } from "../../types/appointment.types";
import {
  formatAppointmentDateUtc,
  formatAppointmentTimeUtc,
} from "../../utils/appointment-format";

interface OwnerAppointmentCardProps {
  appointment: OwnerAppointment;
}

function getAvatarTone(species: OwnerAppointment["pet"]["species"]) {
  switch (species) {
    case "Dog":
      return "bg-petcenter-success-bg text-petcenter-success-text";
    case "Cat":
      return "bg-petcenter-warning-bg text-petcenter-warning-text";
    default:
      return "bg-petcenter-danger-bg text-petcenter-danger-text";
  }
}

const examTypeVisual: Record<
  OwnerAppointment["examType"]["code"],
  {
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
    dateTone: string;
  }
> = {
  GENERAL_CHECKUP: {
    icon: Stethoscope,
    tone: "bg-petcenter-info-bg text-petcenter-info-text",
    dateTone: "bg-petcenter-info-bg text-petcenter-info-text",
  },
  VACCINATION: {
    icon: Syringe,
    tone: "bg-petcenter-success-bg text-petcenter-success-text",
    dateTone: "bg-petcenter-success-bg text-petcenter-success-text",
  },
  LAB_TEST: {
    icon: FlaskConical,
    tone: "bg-petcenter-warning-bg text-petcenter-warning-text",
    dateTone: "bg-petcenter-warning-bg text-petcenter-warning-text",
  },
  RECHECK: {
    icon: RotateCcw,
    tone: "bg-petcenter-danger-bg text-petcenter-danger-text",
    dateTone: "bg-petcenter-danger-bg text-petcenter-danger-text",
  },
  GROOMING: {
    icon: Scissors,
    tone: "bg-petcenter-primary/10 text-petcenter-primary",
    dateTone: "bg-petcenter-primary/10 text-petcenter-primary",
  },
};

export function OwnerAppointmentCard({ appointment }: OwnerAppointmentCardProps) {
  const visual = examTypeVisual[appointment.examType.code];
  const [day, month, year] = formatAppointmentDateUtc(appointment.scheduledAt).split("/");

  return (
    <article className="grid h-full grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-card border border-petcenter-border bg-petcenter-card p-4 shadow-card transition-all hover:border-petcenter-primary/30 hover:shadow-md">
      <div
        className={cn(
          "flex h-full min-h-[132px] flex-col items-center justify-center gap-1 rounded-[0.75rem] px-3 py-3 text-center",
          visual.dateTone
        )}
      >
        <span className="heading-sm leading-none">{day}</span>
        <span className="label-sm whitespace-nowrap">
          Tháng {month}/{year}
        </span>
        <span className="mt-1 label-md">{formatAppointmentTimeUtc(appointment.scheduledAt)}</span>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h3 className="title-md truncate text-petcenter-text">
                {appointment.examType.name}
              </h3>
              <p className="label-sm mt-0.5 text-petcenter-text-secondary">
                Mã lịch: {appointment.appointmentCode}
              </p>
            </div>

            <AppointmentStatusBadge status={appointment.status} className="w-fit" />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 body-sm text-petcenter-text-secondary">
            <span className="inline-flex min-w-0 items-center gap-2">
              <Avatar className="size-7" size="sm">
                {appointment.pet.imageUrl ? (
                  <AvatarImage src={appointment.pet.imageUrl} alt={appointment.pet.name} />
                ) : null}
                <AvatarFallback className={cn("text-xs", getAvatarTone(appointment.pet.species))}>
                  <PawPrint className="size-4" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 truncate font-medium text-petcenter-text">
                {appointment.pet.name}
              </span>
            </span>
          </div>

          <div className="mt-2 flex items-end justify-between gap-3">
            {appointment.symptomDescription ? (
              <p className="line-clamp-2 min-w-0 body-sm text-petcenter-text-secondary">
                Lý do: {appointment.symptomDescription}
              </p>
            ) : (
              <span aria-hidden="true" />
            )}

            <Button
              asChild
              variant="outline"
              className="h-8 shrink-0 rounded-[0.65rem] border-petcenter-primary bg-petcenter-card px-2.5 text-sm font-semibold text-petcenter-primary transition-all hover:bg-petcenter-background hover:text-petcenter-primary-hover"
            >
              <Link href={`/owner/appointments/${appointment.id}`}>
                Chi tiết
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
