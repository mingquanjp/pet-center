import Link from "next/link";
import { Calendar, Clock, PawPrint } from "lucide-react";

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

export function OwnerAppointmentCard({ appointment }: OwnerAppointmentCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-petcenter-border bg-petcenter-card p-5 shadow-card transition-all hover:border-petcenter-primary/30 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-12" size="lg">
            {appointment.pet.imageUrl ? (
              <AvatarImage src={appointment.pet.imageUrl} alt={appointment.pet.name} />
            ) : null}
            <AvatarFallback className={cn("text-sm", getAvatarTone(appointment.pet.species))}>
              <PawPrint className="size-5" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="title-md truncate text-petcenter-text">{appointment.pet.name}</h3>
            <p className="label-sm mt-0.5 text-petcenter-text-secondary">
              Mã: {appointment.appointmentCode}
            </p>
          </div>
        </div>

        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="mb-4">
        <h4 className="title-md mb-2 text-petcenter-primary">{appointment.examType.name}</h4>
        <div className="flex flex-col gap-2 body-md text-petcenter-text-secondary">
          <div className="flex items-center gap-2">
            <Calendar className="size-[18px]" aria-hidden="true" />
            <span>{formatAppointmentDateUtc(appointment.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-[18px]" aria-hidden="true" />
            <span>{formatAppointmentTimeUtc(appointment.scheduledAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-petcenter-border pt-4">
        <Button
          asChild
          className="h-10 w-full rounded-[0.75rem] bg-petcenter-primary body-md font-semibold text-white transition-all hover:bg-petcenter-primary-hover active:scale-95"
        >
          <Link href={`/owner/appointments/${appointment.id}`}>Xem chi tiết</Link>
        </Button>
      </div>
    </article>
  );
}
