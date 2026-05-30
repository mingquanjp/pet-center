"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string; // "HH:mm"
  onChange: (time: string) => void;
  minTime?: string; // "HH:mm"
  disabled?: boolean;
  className?: string;
  hasError?: boolean;
}

export function StaffBoardingTimePicker({ value, onChange, minTime, disabled, className, hasError }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(value);

  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  // Sync tempTime when value changes externally or when opened
  useEffect(() => {
    if (isOpen) {
      setTempTime(value);
      
      // Scroll to selected after a brief delay for render
      setTimeout(() => {
        if (hoursRef.current) {
          const selectedHourEl = hoursRef.current.querySelector('[data-selected="true"]');
          if (selectedHourEl) {
            selectedHourEl.scrollIntoView({ block: 'center' });
          }
        }
        if (minutesRef.current) {
          const selectedMinEl = minutesRef.current.querySelector('[data-selected="true"]');
          if (selectedMinEl) {
            selectedMinEl.scrollIntoView({ block: 'center' });
          }
        }
      }, 50);
    }
  }, [isOpen, value]);

  const minHour = minTime ? Number(minTime.split(':')[0]) : 0;
  const minMinute = minTime ? Number(minTime.split(':')[1]) : 0;

  const currentHour = Number(tempTime.split(':')[0]) || 0;
  const currentMinute = Number(tempTime.split(':')[1]) || 0;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleHourClick = (h: number) => {
    let newMinute = currentMinute;
    // Auto adjust minute if it's below minMinute when switching to minHour
    if (h === minHour && newMinute < minMinute) {
      newMinute = minMinute;
    }
    const newTime = `${h.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
    setTempTime(newTime);
    onChange(newTime);
  };

  const handleMinuteClick = (m: number) => {
    const newTime = `${currentHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    setTempTime(newTime);
    onChange(newTime);
  };

  // Format to 24h for display
  const displayTime = useMemo(() => {
    const [h, m] = value.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return "00:00";
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }, [value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-14 w-[130px] rounded-[12px] border-petcenter-border shadow-sm bg-white px-3 font-medium text-petcenter-text hover:bg-white hover:border-petcenter-primary/50 transition-all",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50 text-petcenter-text-muted",
            hasError && "border-red-400 text-red-600 focus:ring-red-400 hover:border-red-400",
            className
          )}
        >
          <span className="flex-1 text-left truncate">{displayTime}</span>
          <Clock className={cn("h-4 w-4 shrink-0", hasError ? "text-red-500" : "text-petcenter-primary/70")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 rounded-[16px] border-petcenter-border shadow-modal bg-white" align="center">
        <div className="flex gap-2 h-[260px]">
          {/* Hours */}
          <div 
            ref={hoursRef}
            className="w-[60px] flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth border-r border-gray-100 pr-2"
          >
            {hours.map((h) => {
              const isDisabled = h < minHour;
              const isSelected = currentHour === h;
              return (
                <button
                  key={h}
                  disabled={isDisabled}
                  data-selected={isSelected}
                  onClick={() => handleHourClick(h)}
                  className={cn(
                    "w-full py-2 my-0.5 shrink-0 rounded-md text-sm transition-colors flex items-center justify-center",
                    isSelected 
                      ? "bg-petcenter-primary text-white font-bold shadow-sm" 
                      : "text-petcenter-text hover:bg-petcenter-primary/10",
                    isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent line-through"
                  )}
                >
                  {h.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>

          {/* Minutes */}
          <div 
            ref={minutesRef}
            className="w-[60px] flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pl-1"
          >
            {minutes.map((m) => {
              const isDisabled = currentHour === minHour && m < minMinute;
              const isSelected = currentMinute === m;
              return (
                <button
                  key={m}
                  disabled={isDisabled}
                  data-selected={isSelected}
                  onClick={() => handleMinuteClick(m)}
                  className={cn(
                    "w-full py-2 my-0.5 shrink-0 rounded-md text-sm transition-colors flex items-center justify-center",
                    isSelected 
                      ? "bg-petcenter-primary text-white font-bold shadow-sm" 
                      : "text-petcenter-text hover:bg-petcenter-primary/10",
                    isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent line-through"
                  )}
                >
                  {m.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
