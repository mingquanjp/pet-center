import React from "react";
import { AlertCircle } from "lucide-react";
import { AdminBoardingRoom } from "../../types/room.types";

interface AdminRoomDeleteDialogProps {
  room: AdminBoardingRoom;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function AdminRoomDeleteDialog({ room, onClose, onConfirm }: AdminRoomDeleteDialogProps) {
  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-petcenter-danger-text">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-bold text-petcenter-text tracking-tight">Xác nhận xóa phòng</h3>
          </div>
          <p className="text-petcenter-text-secondary body-md">
            Bạn có chắc muốn xóa phòng <strong>{room.name}</strong> không? Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="px-6 py-4 bg-stone-50/80 border-t border-petcenter-border flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-petcenter-text-secondary hover:bg-stone-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-petcenter-danger-text hover:bg-[#DC2626] rounded-xl transition-colors shadow-sm"
          >
            Xóa phòng
          </button>
        </div>
      </div>
    </div>
  );
}
