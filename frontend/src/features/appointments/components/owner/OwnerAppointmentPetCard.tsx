import { PawPrint } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { OwnerAppointmentDetail } from "../../types/appointment.types";

interface OwnerAppointmentPetCardProps {
  pet: OwnerAppointmentDetail["pet"];
}

const speciesLabel: Record<OwnerAppointmentDetail["pet"]["species"], string> = {
  Dog: "Chó",
  Cat: "Mèo",
  Other: "Khác",
};

export function OwnerAppointmentPetCard({ pet }: OwnerAppointmentPetCardProps) {
  const petSubtitle = [speciesLabel[pet.species], pet.breed].filter(Boolean).join(" / ");

  return (
    <Card className="gap-0 rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0">
      <h2 className="title-md mb-4 text-petcenter-text">Thông tin thú cưng</h2>
      <div className="flex items-center gap-4">
        <Avatar className="size-16" size="lg">
          {pet.imageUrl ? <AvatarImage src={pet.imageUrl} alt={pet.name} /> : null}
          <AvatarFallback className="bg-petcenter-background text-petcenter-primary">
            <PawPrint className="h-7 w-7" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="heading-sm truncate text-petcenter-text">{pet.name}</h3>
          <p className="body-sm mt-1 text-petcenter-text-secondary">{petSubtitle}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pet.ageText ? <PetTag>{pet.ageText}</PetTag> : null}
            {pet.gender ? <PetTag>{pet.gender}</PetTag> : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PetTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="label-sm rounded-[0.75rem] bg-petcenter-background px-2 py-1 text-petcenter-text-secondary">
      {children}
    </span>
  );
}
