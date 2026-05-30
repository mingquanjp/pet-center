"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { OwnerAppointmentTimeSlot } from "../../types/appointment.types";

interface OwnerAppointmentTimeSlotsProps {
  selectedTimeSlot: string;
  timeSlots: OwnerAppointmentTimeSlot[];
  onSelect: (value: string) => void;
}

export function OwnerAppointmentTimeSlots({
  onSelect,
  selectedTimeSlot,
  timeSlots,
}: OwnerAppointmentTimeSlotsProps) {
  const [open, setOpen] = useState(false);
  const availableSlots = timeSlots.filter((slot) => !slot.disabled);
  const selectedSlot =
    timeSlots.find((slot) => slot.value === selectedTimeSlot) ??
    availableSlots[0] ??
    timeSlots[0];

  return (
    <fieldset aria-label="Chọn giờ">
      <legend className="mb-2 text-xs font-medium leading-4 text-[#3E4946]">Chọn giờ</legend>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={timeSlots.length === 0 || availableSlots.length === 0}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-[#BDC9C5] bg-[#FBFAEE] px-[17px] text-left text-sm leading-5 text-[#1B1C15] transition-colors hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{availableSlots.length > 0 ? selectedSlot?.label ?? "Chọn giờ" : "Hết lịch"}</span>
          <ChevronDown className="size-4 text-petcenter-text-secondary" aria-hidden="true" />
        </button>

        {open ? (
          <div className="absolute left-0 top-[50px] z-20 max-h-[300px] w-full overflow-y-auto rounded-xl border border-petcenter-border-strong bg-petcenter-card p-1 shadow-modal">
            {timeSlots.map((slot) => {
              const selected = slot.value === selectedTimeSlot;
              const availableUnits = slot.availableUnits ?? (slot.disabled ? 0 : 1);

              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={slot.disabled}
                  onClick={() => {
                    onSelect(slot.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left body-md transition-colors hover:bg-petcenter-filter disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
                    selected ? "font-bold text-petcenter-primary" : "font-normal text-petcenter-text"
                  )}
                >
                  <span>{slot.label}</span>
                  <span className="flex items-center gap-2 body-sm text-petcenter-text-secondary">
                    {availableUnits > 0 ? `Còn ${availableUnits} Slot` : "Đầy"}
                    {selected ? (
                      <Check className="size-4 text-petcenter-primary" aria-hidden="true" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}
