"use client";

import { useState } from "react";
import { Check, ChevronDown, PawPrint } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { OwnerAppointmentPetOption } from "../../types/appointment.types";

interface OwnerPetSelectionProps {
  pets: OwnerAppointmentPetOption[];
  selectedPetId: string;
  onSelect: (petId: string) => void;
}

const speciesLabel: Record<OwnerAppointmentPetOption["species"], string> = {
  Dog: "Chó",
  Cat: "Mèo",
  Other: "Khác",
};

export function OwnerPetSelection({
  onSelect,
  pets,
  selectedPetId,
}: OwnerPetSelectionProps) {
  const [open, setOpen] = useState(false);
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];

  return (
    <fieldset aria-label="Chọn thú cưng">
      {selectedPet ? (
        <div className="relative w-full max-w-[448px]">
          <p className="mb-2 label-md text-petcenter-text-secondary">Thú cưng</p>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-[52px] w-full items-center gap-3 rounded-xl border border-petcenter-border bg-petcenter-filter px-[17px] text-left transition-colors hover:bg-petcenter-background"
          >
            <PetAvatar pet={selectedPet} sizeClassName="size-8" />
            <span className="min-w-0 flex-1">
              <span className="block truncate body-md font-medium text-petcenter-text">
                {selectedPet.name}
              </span>
              <span className="block truncate body-sm text-petcenter-text-secondary">
                {buildPetSubtitle(selectedPet)}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-petcenter-text-secondary" aria-hidden="true" />
          </button>

          {open ? (
            <div className="absolute left-0 top-[78px] z-20 w-full overflow-hidden rounded-2xl border border-petcenter-border-strong bg-petcenter-card shadow-modal">
              <div className="max-h-[300px] overflow-y-auto">
                {pets.map((pet) => {
                  const selected = pet.id === selectedPet.id;

                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => {
                        onSelect(pet.id);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 border-b border-petcenter-border px-3 py-3 text-left transition-colors hover:bg-petcenter-filter"
                    >
                      <PetAvatar pet={pet} sizeClassName="size-10" />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate body-md text-petcenter-text",
                            selected ? "font-bold" : "font-normal"
                          )}
                        >
                          {pet.name}
                        </span>
                        <span className="block truncate body-sm text-petcenter-text-secondary">
                          {buildPetSubtitle(pet)}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="size-4 shrink-0 text-petcenter-primary" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="body-md text-petcenter-text-secondary">
          Bạn chưa có hồ sơ thú cưng khả dụng để tạo lịch hẹn.
        </p>
      )}
    </fieldset>
  );
}

function buildPetSubtitle(pet: OwnerAppointmentPetOption) {
  return [speciesLabel[pet.species], pet.breed, pet.ageText].filter(Boolean).join(" • ");
}

function PetAvatar({
  pet,
  sizeClassName,
}: {
  pet: OwnerAppointmentPetOption;
  sizeClassName: string;
}) {
  return (
    <Avatar className={cn("shrink-0", sizeClassName)}>
      {pet.imageUrl ? <AvatarImage src={pet.imageUrl} alt={pet.name} /> : null}
      <AvatarFallback className="bg-petcenter-background text-petcenter-primary">
        <PawPrint className="h-5 w-5" aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  );
}
