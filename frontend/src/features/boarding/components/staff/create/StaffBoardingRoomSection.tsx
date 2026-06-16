"use client";

import { Bed } from "lucide-react";
import { StaffBoardingRoomTypeOption } from "../../../types/boarding.types";
import { StaffBoardingRoomTypeCard } from "./StaffBoardingRoomTypeCard";

interface Props {
  roomTypes: StaffBoardingRoomTypeOption[];
  selectedRoomTypeId: string;
  onRoomSelect: (roomId: string) => void;
}

export function StaffBoardingRoomSection({ roomTypes, selectedRoomTypeId, onRoomSelect }: Props) {
  return (
    <div className="bg-petcenter-card border border-petcenter-border rounded-card shadow-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bed className="h-5 w-5 text-petcenter-primary" />
        <h2 className="text-lg font-semibold text-petcenter-text">4s. Loại phòng</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roomTypes.map((room) => (
          <StaffBoardingRoomTypeCard
            key={room.id}
            roomType={room}
            isSelected={room.id === selectedRoomTypeId}
            onSelect={() => onRoomSelect(room.id)}
          />
        ))}
      </div>
    </div>
  );
}
