"use client";

import { Check, PawPrint } from "lucide-react";
import Image from "next/image";
import { StaffBoardingPetOption } from "../../../types/boarding.types";

interface Props {
  pet: StaffBoardingPetOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function StaffBoardingPetSelectCard({ pet, isSelected, onSelect }: Props) {
  return (
    <div className="relative rounded-[12px] border border-petcenter-border bg-petcenter-background/30 p-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[12px] bg-petcenter-background border border-petcenter-border">
          {pet.imageUrl ? (
            <Image
              src={pet.imageUrl}
              alt={pet.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-petcenter-primary/10 border-petcenter-primary/20">
              <PawPrint className="h-7 w-7 text-petcenter-primary" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center flex-1">
          <h3 className="font-semibold text-petcenter-text text-base">{pet.name}</h3>
          <div className="text-sm text-petcenter-text-secondary mt-1 flex flex-wrap gap-x-2 gap-y-1">
            <span>{pet.species === "Dog" ? "Chó" : pet.species === "Cat" ? "Mèo" : "Khác"}</span>
            {pet.breed && (
              <>
                <span className="text-petcenter-border-strong">•</span>
                <span>{pet.breed}</span>
              </>
            )}
            {pet.ageText && (
              <>
                <span className="text-petcenter-border-strong">•</span>
                <span>{pet.ageText}</span>
              </>
            )}
            {pet.weightText && (
              <>
                <span className="text-petcenter-border-strong">•</span>
                <span>{pet.weightText}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
