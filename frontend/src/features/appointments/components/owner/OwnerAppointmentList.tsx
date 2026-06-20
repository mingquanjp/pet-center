import { OwnerAppointment } from "../../types/appointment.types";
import { OwnerAppointmentCard } from "./OwnerAppointmentCard";

interface OwnerAppointmentListProps {
  appointments: OwnerAppointment[];
}

export function OwnerAppointmentList({ appointments }: OwnerAppointmentListProps) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {appointments.map((appointment) => (
        <OwnerAppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
