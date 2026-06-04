import React from "react";
import { Bed, Eye, Pencil, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { AdminBoardingRoom } from "../../types/room.types";
import { formatVnd, calculateOccupancyRate } from "../../utils/room-format";

export function AdminRoomCard({ room, onDetail, onEdit, onToggle, onDelete }: { room: AdminBoardingRoom, onDetail: () => void, onEdit: () => void, onToggle: () => void, onDelete: () => void }) {
  const occRate = calculateOccupancyRate(room);
  const isActive = room.status === "active";
  const freeSpots = room.capacity - room.currentOccupancy;
  const isFull = freeSpots <= 0;

  return (
    <div className={`group flex flex-col bg-petcenter-card rounded-2xl border border-petcenter-border hover:border-petcenter-primary/40 shadow-sm transition-all duration-300 hover:shadow-md ${!isActive ? "opacity-75 grayscale-20" : ""}`}>

      {/* Header & Desc */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-petcenter-primary/10 text-petcenter-primary' : 'bg-stone-100 text-stone-400'}`}>
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-petcenter-text leading-tight group-hover:text-petcenter-primary transition-colors">{room.name}</h3>
              <p className="text-xs text-petcenter-text-secondary mt-0.5 line-clamp-1">{room.description || "Chưa có mô tả"}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md whitespace-nowrap shrink-0 ${isActive ? 'bg-petcenter-success-bg text-petcenter-success-text' : 'bg-stone-200 text-stone-500'}`}>
            {isActive ? "Hoạt động" : "Tạm ngưng"}
          </span>
        </div>
      </div>

      {/* Capacity Box */}
      <div className="px-4 py-3 border-t border-petcenter-border bg-stone-50/50 flex-1 flex flex-col gap-3">
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold text-petcenter-text-secondary uppercase tracking-wider">Hiệu suất</span>
            <span className={`text-xs font-bold ${isFull ? 'text-petcenter-cta' : 'text-petcenter-primary'}`}>{occRate}%</span>
          </div>
          <div className="h-1.5 w-full bg-stone-200/80 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-petcenter-cta' : 'bg-petcenter-primary'}`} style={{ width: `${Math.min(occRate, 100)}%` }} />
          </div>
        </div>

        <div className="flex justify-between items-center bg-white rounded-lg p-2.5 border border-petcenter-border shadow-sm">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[9px] uppercase font-bold text-petcenter-text-muted mb-0.5">Sức chứa</span>
            <span className="text-sm font-bold text-petcenter-text">{room.capacity}</span>
          </div>
          <div className="w-px h-6 bg-petcenter-border"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[9px] uppercase font-bold text-petcenter-text-muted mb-0.5">Đang dùng</span>
            <span className="text-sm font-bold text-petcenter-text">{room.currentOccupancy}</span>
          </div>
          <div className="w-px h-6 bg-petcenter-border"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[9px] uppercase font-bold text-petcenter-text-muted mb-0.5">Còn trống</span>
            <span className={`text-sm font-bold ${isFull ? 'text-petcenter-cta' : 'text-petcenter-success-text'}`}>{freeSpots}</span>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="px-4 py-3 border-t border-petcenter-border flex justify-between items-center bg-white rounded-b-2xl">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-petcenter-primary tracking-tight">{formatVnd(room.boardingUnitPrice).replace("₫", "đ")}</span>
          <span className="text-[10px] text-petcenter-text-muted font-semibold uppercase tracking-wider">/ ngày</span>
        </div>

        <div className="flex items-center gap-0.5">
          <button onClick={onDetail} title="Xem chi tiết & lịch sử" className="w-7 h-7 rounded-full flex items-center justify-center text-petcenter-text-muted hover:bg-petcenter-info-bg hover:text-petcenter-primary transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={onEdit} title="Chỉnh sửa" className="w-7 h-7 rounded-full flex items-center justify-center text-petcenter-text-muted hover:bg-petcenter-info-bg hover:text-petcenter-primary transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToggle} title={isActive ? "Tạm ngưng" : "Kích hoạt lại"} className="w-7 h-7 rounded-full flex items-center justify-center text-petcenter-text-muted hover:bg-stone-100 transition-colors">
            {isActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onDelete} title="Xóa" disabled={room.currentOccupancy > 0} className="w-7 h-7 rounded-full flex items-center justify-center text-petcenter-text-muted hover:bg-petcenter-danger-bg hover:text-petcenter-danger-text disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-petcenter-text-muted transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
