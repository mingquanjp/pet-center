"use client";

import { Check } from "lucide-react";
import { StaffBoardingRoomTypeOption } from "../../../types/boarding.types";

interface Props {
  roomType: StaffBoardingRoomTypeOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function StaffBoardingRoomTypeCard({ roomType, isSelected, onSelect }: Props) {
  const isAvailable = roomType.availableCount > 0;

  return (
    <div
      onClick={() => isAvailable && onSelect()}
      className={`relative rounded-xl border p-4 transition-all duration-200 ${!isAvailable
          ? "border-petcenter-border bg-petcenter-background opacity-60 cursor-not-allowed"
          : isSelected
            ? "border-petcenter-primary bg-petcenter-primary/5 shadow-sm cursor-pointer"
            : "border-petcenter-border hover:border-petcenter-primary/50 hover:bg-petcenter-background/80 cursor-pointer"
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-petcenter-text text-base">{roomType.name}</h3>
          </div>
          <p className="text-sm text-petcenter-text-secondary mt-1 line-clamp-1">{roomType.description}</p>
        </div>

        <div className="text-right">
          <div className="font-bold text-petcenter-primary whitespace-nowrap">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(roomType.pricePerDay)}
            <span className="text-xs text-petcenter-text-secondary font-normal">/ngày</span>
          </div>
          <div className={`text-xs mt-1 font-medium ${isAvailable ? "text-green-600" : "text-red-500"}`}>
            {isAvailable ? `Còn ${roomType.availableCount} phòng` : "Hết phòng"}
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-petcenter-primary text-white flex items-center justify-center">
          <Check className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
