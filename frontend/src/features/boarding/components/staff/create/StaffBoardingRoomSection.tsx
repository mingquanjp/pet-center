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
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center">
            <Bed className="h-5 w-5 text-petcenter-primary" />
          </div>
          <h2 className="text-xl font-bold text-petcenter-text tracking-tight">4. Loại phòng</h2>
        </div>
      </div>

      <div className="relative -mx-2 px-2">
        {/* Top shadow mask for scrolling */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none rounded-t-[12px]"></div>
        
        <div className="grid grid-cols-1 gap-4 max-h-[380px] overflow-y-auto pt-2 pb-4 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-petcenter-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-petcenter-text-muted transition-all">
          {roomTypes.map((room) => (
            <StaffBoardingRoomTypeCard
              key={room.id}
              roomType={room}
              isSelected={room.id === selectedRoomTypeId}
              onSelect={() => onRoomSelect(room.id)}
            />
          ))}
        </div>

        {/* Bottom shadow mask for scrolling */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none rounded-b-[12px]"></div>
      </div>
    </div>
  );
}
