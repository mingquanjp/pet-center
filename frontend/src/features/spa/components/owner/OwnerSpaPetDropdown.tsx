"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OwnerSpaPet } from "../../types/spa.types"

interface OwnerSpaPetDropdownProps {
  pets: OwnerSpaPet[]
  selectedPetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (petId: string) => void
}

export function OwnerSpaPetDropdown({
  pets,
  selectedPetId,
  open,
  onOpenChange,
  onSelect,
}: OwnerSpaPetDropdownProps) {
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0]

  return (
    <div className="relative w-full max-w-[448px]">
      <p className="mb-2 text-xs font-medium leading-4 text-[#3E4946]">Thú cưng</p>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-[52px] w-full items-center gap-3 rounded-xl border border-[#E6E8DD] bg-[#FBFAEE] px-[17px] text-left"
      >
        <PetAvatar pet={selectedPet} sizeClassName="size-8" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium leading-[17.5px] text-[#1B1C15]">
            {selectedPet.name}
          </span>
          <span className="block truncate text-[13px] leading-[16.25px] text-[#3E4946]">
            {selectedPet.species} • {selectedPet.weightKg} kg
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-[#3E4946]" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[78px] z-20 w-full overflow-hidden rounded-2xl border border-[#BDC9C5] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
          <div className="max-h-[300px] overflow-y-auto">
            {pets.map((pet) => {
              const selected = pet.id === selectedPetId

              return (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => {
                    onSelect(pet.id)
                    onOpenChange(false)
                  }}
                  className="flex w-full items-center gap-3 border-b border-[rgba(189,201,197,0.3)] px-3 py-3 text-left hover:bg-[#FBFAEE]"
                >
                  <PetAvatar pet={pet} sizeClassName="size-10" />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-sm leading-5 text-[#1B1C15]", selected ? "font-bold" : "font-normal")}>
                      {pet.name}
                    </span>
                    <span className="block truncate text-[13px] leading-[18px] text-[#3E4946]">
                      {pet.species} • {pet.weightKg} kg
                    </span>
                  </span>
                  {selected ? <Check className="size-4 shrink-0 text-[#005E53]" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-[42px] w-full justify-start rounded-none border-t border-[#BDC9C5] px-3 text-[13px] font-normal leading-[18px] text-[#3E4946] hover:bg-[#FBFAEE]"
          >
            + Thêm hồ sơ thú cưng
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function PetAvatar({ pet, sizeClassName }: { pet: OwnerSpaPet; sizeClassName: string }) {
  if (pet.avatarUrl) {
    return (
      // Figma provides these mock assets for the booking prototype.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={pet.avatarUrl}
        alt={pet.name}
        className={cn("shrink-0 rounded-full object-cover", sizeClassName)}
      />
    )
  }

  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-[#E4E3D7] text-base font-bold text-[#3E4946]", sizeClassName)}>
      {pet.fallbackInitial ?? pet.name.charAt(0)}
    </span>
  )
}
