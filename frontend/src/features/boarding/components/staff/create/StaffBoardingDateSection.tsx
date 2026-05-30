"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { calculateBoardingDays } from "../../../utils/boarding-pricing";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { StaffBoardingTimePicker } from "./StaffBoardingTimePicker";

interface Props {
  plannedCheckInDate: string;
  plannedCheckOutDate: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
}

export function StaffBoardingDateSection({
  plannedCheckInDate,
  plannedCheckOutDate,
  onCheckInChange,
  onCheckOutChange,
}: Props) {
  const [checkInCalendarOpen, setCheckInCalendarOpen] = useState(false);
  const [checkOutCalendarOpen, setCheckOutCalendarOpen] = useState(false);
  const totalDays = calculateBoardingDays(plannedCheckInDate, plannedCheckOutDate);
  const isValidDate = plannedCheckInDate && plannedCheckOutDate && new Date(plannedCheckOutDate) > new Date(plannedCheckInDate);

  const checkInDateObj = plannedCheckInDate ? parseISO(plannedCheckInDate) : undefined;
  const checkOutDateObj = plannedCheckOutDate ? parseISO(plannedCheckOutDate) : undefined;

  const checkInTime = plannedCheckInDate && plannedCheckInDate.includes('T')
    ? format(checkInDateObj!, "HH:mm")
    : "08:00";

  const checkOutTime = plannedCheckOutDate && plannedCheckOutDate.includes('T')
    ? format(checkOutDateObj!, "HH:mm")
    : "18:00";

  const handleDateChange = (type: 'in' | 'out', date: Date | undefined) => {
    if (!date) return;
    const time = type === 'in' ? checkInTime : checkOutTime;
    const dateStr = format(date, "yyyy-MM-dd");
    const newDateTime = `${dateStr}T${time}:00`;
    if (type === 'in') {
      onCheckInChange(newDateTime);
      setCheckInCalendarOpen(false);
    } else {
      onCheckOutChange(newDateTime);
      setCheckOutCalendarOpen(false);
    }
  };

  const handleTimeChange = (type: 'in' | 'out', time: string) => {
    const dateObj = type === 'in' ? checkInDateObj : checkOutDateObj;

    if (!dateObj) {
      const today = format(new Date(), "yyyy-MM-dd");
      const newDateTime = `${today}T${time}:00`;
      if (type === 'in') onCheckInChange(newDateTime);
      else onCheckOutChange(newDateTime);
      return;
    }
    const dateStr = format(dateObj, "yyyy-MM-dd");
    const newDateTime = `${dateStr}T${time}:00`;
    if (type === 'in') onCheckInChange(newDateTime);
    else onCheckOutChange(newDateTime);
  };

  return (
    <div className="bg-petcenter-card border border-petcenter-border rounded-[16px] shadow-sm p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-petcenter-primary" />
          </div>
          <h2 className="text-xl font-bold text-petcenter-text tracking-tight">3. Thời gian lưu trú</h2>
        </div>
        {totalDays > 0 && (
          <div className="text-sm font-semibold text-petcenter-primary bg-petcenter-primary/10 px-4 py-1.5 rounded-full ring-1 ring-petcenter-primary/20">
            {totalDays} ngày lưu trú
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
        <div className="w-full">
          <label className="block text-sm font-semibold text-petcenter-text-secondary mb-2 ml-1">
            Ngày & Giờ nhận
          </label>
          <div className="flex gap-2">
            <Popover open={checkInCalendarOpen} onOpenChange={setCheckInCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "flex-1 h-14 justify-start text-left font-medium rounded-[12px] border-petcenter-border shadow-sm hover:border-petcenter-primary/50 hover:bg-white bg-white transition-all px-3",
                    !checkInDateObj && "text-petcenter-text-muted"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-petcenter-primary/70 shrink-0" />
                  {checkInDateObj ? (
                    <span className="text-petcenter-text text-[14px] truncate">
                      {format(checkInDateObj, "dd/MM/yyyy")}
                    </span>
                  ) : (
                    <span className="truncate">Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-[16px] border-petcenter-border shadow-modal z-50 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDateObj}
                  onSelect={(date) => handleDateChange('in', date)}
                  disabled={(date) => {
                    // Disable past dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <StaffBoardingTimePicker
                value={checkInTime}
                onChange={(time) => handleTimeChange('in', time)}
                minTime={(() => {
                  if (!checkInDateObj) return undefined;
                  const today = new Date();
                  if (
                    checkInDateObj.getDate() === today.getDate() &&
                    checkInDateObj.getMonth() === today.getMonth() &&
                    checkInDateObj.getFullYear() === today.getFullYear()
                  ) {
                    return format(today, "HH:mm");
                  }
                  return undefined;
                })()}
              />
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center pt-8 px-1 text-petcenter-text-muted">
          <ArrowRight className="h-6 w-6" />
        </div>

        <div className="w-full">
          <label className="block text-sm font-semibold text-petcenter-text-secondary mb-2 ml-1">
            Ngày & Giờ trả (dự kiến)
          </label>
          <div className="flex gap-2">
            <Popover open={checkOutCalendarOpen} onOpenChange={setCheckOutCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "flex-1 h-14 justify-start text-left font-medium rounded-[12px] border-petcenter-border shadow-sm hover:border-petcenter-primary/50 hover:bg-white bg-white transition-all px-3",
                    !checkOutDateObj && "text-petcenter-text-muted",
                    (!isValidDate && checkOutDateObj) && "border-red-400 text-red-600 focus:ring-red-400"
                  )}
                >
                  <CalendarIcon className={cn("mr-2 h-5 w-5 shrink-0", (!isValidDate && checkOutDateObj) ? "text-red-500" : "text-petcenter-primary/70")} />
                  {checkOutDateObj ? (
                    <span className={cn("text-[14px] truncate", (!isValidDate && checkOutDateObj) ? "text-red-600" : "text-petcenter-text")}>
                      {format(checkOutDateObj, "dd/MM/yyyy")}
                    </span>
                  ) : (
                    <span className="truncate">Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-[16px] border-petcenter-border shadow-modal z-50 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={checkOutDateObj}
                  onSelect={(date) => handleDateChange('out', date)}
                  disabled={(date) => {
                    if (!checkInDateObj) return false;
                    const checkInStart = new Date(checkInDateObj);
                    checkInStart.setHours(0, 0, 0, 0);
                    return date < checkInStart;
                  }}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <StaffBoardingTimePicker
                value={checkOutTime}
                onChange={(time) => handleTimeChange('out', time)}
                disabled={!checkOutDateObj}
                hasError={!isValidDate && !!checkOutDateObj}
              />
            </div>
          </div>
          {!isValidDate && plannedCheckOutDate && (
            <p className="text-red-500 text-xs mt-2 ml-1 font-medium animate-in fade-in slide-in-from-top-1">
              * Thời gian trả phải sau thời gian nhận.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
