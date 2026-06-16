"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, PawPrint, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  const [searchQuery, setSearchQuery] = useState("");
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];
  const filteredPets = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return pets;
    }

    return pets.filter((pet) =>
      [pet.name, speciesLabel[pet.species], pet.breed, pet.ageText, pet.weightText]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [pets, searchQuery]);

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
              <div className="border-b border-petcenter-border bg-petcenter-card p-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-petcenter-text-secondary"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm thú cưng..."
                    className="h-10 w-full rounded-lg border border-petcenter-border bg-petcenter-filter pl-9 pr-3 body-sm text-petcenter-text outline-none placeholder:text-petcenter-text-muted focus:border-petcenter-primary"
                  />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {filteredPets.map((pet) => {
                  const selected = pet.id === selectedPet.id;

                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => {
                        onSelect(pet.id);
                        setOpen(false);
                        setSearchQuery("");
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
                {filteredPets.length === 0 ? (
                  <p className="px-3 py-4 body-sm text-petcenter-text-secondary">
                    Không tìm thấy thú cưng phù hợp.
                  </p>
                ) : null}
              </div>
              <Button
                asChild
                type="button"
                variant="ghost"
                className="h-[42px] w-full justify-start rounded-none border-t border-petcenter-border px-3 body-sm font-normal text-petcenter-text-secondary hover:bg-petcenter-filter"
              >
                <Link href="/owner/pets/add">+ Thêm hồ sơ thú cưng</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="body-md text-petcenter-text-secondary">
          Bạn chưa có hồ sơ thú cưng khả dụng để đặt lịch khám.
        </p>
      )}
    </fieldset>
  );
}

function buildPetSubtitle(pet: OwnerAppointmentPetOption) {
  return [speciesLabel[pet.species], pet.breed, pet.ageText, formatPetWeightText(pet.weightText)]
    .filter(Boolean)
    .join(" · ");
}

function formatPetWeightText(weightText?: string) {
  return weightText?.replace(/\s*kg$/i, " kg");
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
