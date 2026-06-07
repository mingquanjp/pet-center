/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Cat, Dog, CircleHelp } from "lucide-react";
import { DoctorMedicalRecordListItem } from "../../types/medical-record.types";

interface Props {
  pet: DoctorMedicalRecordListItem;
}

export function DoctorMedicalRecordPetCell({ pet }: Props) {
  const getIcon = () => {
    if (pet.species === "Cat") {
      return <Cat className="w-5 h-5 text-petcenter-text-muted" />;
    }
    if (pet.species === "Dog") {
      return <Dog className="w-5 h-5 text-petcenter-text-muted" />;
    }
    return <CircleHelp className="w-5 h-5 text-petcenter-text-muted" />;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-petcenter-filter flex items-center justify-center shrink-0 border border-petcenter-border">
        {pet.avatarUrl ? (
          <img
            src={pet.avatarUrl}
            alt={pet.petName}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={pet.avatarUrl ? "hidden" : ""}>{getIcon()}</div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-base font-semibold text-petcenter-text truncate">
          {pet.petName}
        </span>
        <span className="text-sm text-petcenter-text-secondary truncate mt-0.5">
          {pet.species === "Cat" ? "Mèo" : pet.species === "Dog" ? "Chó" : "Khác"}
          {pet.breed ? ` • ${pet.breed}` : ""}
        </span>
      </div>
    </div>
  );
}
