import React, { useState } from "react";
import { AdminBoardingRoom } from "../../types/room.types";
import { X, Home } from "lucide-react";

export function AdminRoomFormDialog({ room, onClose, onSave }: { room: AdminBoardingRoom | null, onClose: () => void, onSave: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    name: room?.name || "",
    description: room?.description || "",
    capacity: room?.capacity || ("" as number | ""),
    boardingUnitPrice: room?.boardingUnitPrice || ("" as number | ""),
    status: room?.status || "active",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (room && Number(formData.capacity) < room.currentOccupancy) {
      alert("Sức chứa không được nhỏ hơn số thú cưng đang lưu trú.");
      return;
    }
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-120 overflow-hidden flex flex-col border border-stone-200/50 transform transition-all animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-petcenter-border flex justify-between items-center bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center text-petcenter-primary">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-petcenter-text leading-none">{room ? "Sửa phòng lưu trú" : "Thêm phòng mới"}</h2>
              <p className="text-sm text-petcenter-text-secondary mt-1">{room ? "Cập nhật thông tin phòng" : "Điền thông tin cho phòng lưu trú mới"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form id="room-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-petcenter-text mb-2">Tên loại phòng <span className="text-red-500">*</span></label>
              <input required maxLength={100} type="text" placeholder="VD: Phòng VIP, Chuồng lớn..." className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-petcenter-text mb-2">Sức chứa (con) <span className="text-red-500">*</span></label>
                <input required type="number" min={1} placeholder="VD: 10" className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value === "" ? "" : Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-petcenter-text mb-2">Giá / ngày (đ) <span className="text-red-500">*</span></label>
                <input required type="number" min={0} step={1000} placeholder="VD: 150000" className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none" value={formData.boardingUnitPrice} onChange={e => setFormData({ ...formData, boardingUnitPrice: e.target.value === "" ? "" : Number(e.target.value) })} />
              </div>
            </div>

            {room && (
              <div>
                <label className="block text-sm font-semibold text-petcenter-text mb-2">Trạng thái</label>
                <select className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ngưng</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-petcenter-text mb-2">Mô tả chi tiết</label>
              <textarea maxLength={500} placeholder="Trang thiết bị, lưu ý..." className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm h-28 resize-none focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-petcenter-border bg-stone-50/50 flex justify-end gap-3 items-center">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-petcenter-text-secondary hover:text-petcenter-text hover:bg-stone-200/50 rounded-xl transition-colors">Hủy bỏ</button>
          <button type="submit" form="room-form" disabled={loading} className="px-6 py-2.5 text-sm font-bold bg-petcenter-primary text-white rounded-xl hover:bg-petcenter-primary-hover disabled:opacity-50 transition-all shadow-sm shadow-petcenter-primary/20 flex items-center gap-2">
            {loading ? (
              "Đang xử lý..."
            ) : (
              <>
                {room ? "Lưu thay đổi" : "Tạo phòng"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
