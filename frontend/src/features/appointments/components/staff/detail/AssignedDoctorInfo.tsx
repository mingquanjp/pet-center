import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffAssignedDoctor } from "../../../types/appointment.types";
import { UserCheck } from "lucide-react";
import Image from "next/image";

interface Props {
  doctor: StaffAssignedDoctor | null | undefined;
}

export function AssignedDoctorInfo({ doctor }: Props) {
  if (!doctor) return null;

  return (
    <Card className="rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5 text-petcenter-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Bác sĩ phụ trách</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-petcenter-border shrink-0 border-2 border-white shadow-sm">
            {doctor.avatarUrl ? (
              <>
                <Image src={doctor.avatarUrl} alt={doctor.fullName} fill className="object-cover" sizes="56px" />
              </>
            ) : (
              <div className="w-full h-full bg-petcenter-sidebar flex items-center justify-center text-petcenter-text-muted font-medium text-lg">
                {doctor.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-petcenter-text">{doctor.fullName}</h3>
            {doctor.phoneNumber && (
              <p className="text-sm text-petcenter-text-secondary mt-1">{doctor.phoneNumber}</p>
            )}
            {doctor.email && (
              <p className="text-sm text-petcenter-text-secondary">{doctor.email}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
