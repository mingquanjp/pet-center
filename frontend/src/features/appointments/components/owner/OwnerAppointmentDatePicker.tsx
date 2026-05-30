"use client";

import { useRef } from "react";
import { CalendarDays } from "lucide-react";

import { getVietnamDateInputValue } from "../../utils/appointment-format";

interface OwnerAppointmentDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function OwnerAppointmentDatePicker({
  onChange,
  value,
}: OwnerAppointmentDatePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="mb-2 block text-xs font-medium leading-4 text-[#3E4946]" htmlFor="appointment-date">
        Chọn ngày
      </label>
      <div className="relative w-full">
        <CalendarDays
          className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-petcenter-text-secondary"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => {
            if (dateInputRef.current?.showPicker) {
              dateInputRef.current.showPicker();
              return;
            }

            dateInputRef.current?.focus();
          }}
          className="h-11 w-full rounded-lg border border-[#BDC9C5] bg-[#FBFAEE] py-[11px] pl-[41px] pr-[17px] text-left text-sm leading-5 text-[#1B1C15] transition-colors hover:bg-petcenter-background"
        >
          {formatDateLabel(value)}
        </button>
        <input
          ref={dateInputRef}
          id="appointment-date"
          type="date"
          min={getTodayDateInputValue()}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pointer-events-none absolute inset-0 h-11 w-full opacity-0"
          aria-label="Chọn ngày khám"
        />
      </div>
    </div>
  );
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function getTodayDateInputValue() {
  return getVietnamDateInputValue();
}
