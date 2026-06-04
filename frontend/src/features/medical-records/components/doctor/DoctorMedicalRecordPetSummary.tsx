import { PawPrint } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

import { DoctorMedicalRecordDetail } from "../../types/medical-record.types";
import { getPetSpeciesLabel } from "../../utils/medical-record-format";

interface Props {
  pet: DoctorMedicalRecordDetail["pet"];
}

export function DoctorMedicalRecordPetSummary({ pet }: Props) {
  return (
    <Card className="gap-0 rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 bg-petcenter-filter">
          {pet.avatarUrl ? <AvatarImage src={pet.avatarUrl} alt={pet.name} /> : null}
          <AvatarFallback className="bg-petcenter-filter text-petcenter-primary">
            <PawPrint className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <h3 className="title-md mt-4 text-petcenter-text">{pet.name}</h3>
        <p className="body-sm mt-1 font-semibold text-petcenter-primary">{pet.code}</p>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm">
        <div className="rounded-control bg-petcenter-filter p-3">
          <dt className="label-sm uppercase text-petcenter-text-secondary">Loài/Giống</dt>
          <dd className="mt-1 font-medium text-petcenter-text">
            {getPetSpeciesLabel(pet.species)}
            {pet.breed ? ` • ${pet.breed}` : ""}
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-control bg-petcenter-filter p-3">
            <dt className="label-sm uppercase text-petcenter-text-secondary">Tuổi</dt>
            <dd className="mt-1 font-medium text-petcenter-text">{pet.ageText ?? "Chưa cập nhật"}</dd>
          </div>
          <div className="rounded-control bg-petcenter-filter p-3">
            <dt className="label-sm uppercase text-petcenter-text-secondary">Giới tính</dt>
            <dd className="mt-1 font-medium text-petcenter-text">{pet.gender ?? "Chưa cập nhật"}</dd>
          </div>
        </div>
      </dl>
    </Card>
  );
}
