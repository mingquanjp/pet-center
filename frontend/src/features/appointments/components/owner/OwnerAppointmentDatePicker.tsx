"use client";

import { useRef } from "react";
import { CalendarDays } from "lucide-react";

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
      <label className="title-md mb-4 block text-petcenter-text" htmlFor="appointment-date">
        3. Ngày khám
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
          className="h-12 w-full rounded-xl border border-petcenter-border bg-petcenter-filter py-[11px] pl-[41px] pr-[17px] text-left body-md text-petcenter-text transition-colors hover:bg-petcenter-background"
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
          className="pointer-events-none absolute inset-0 h-12 w-full opacity-0"
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
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
