"use client";

import { ClipboardList, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  careRequest: string;
  onChange: (value: string) => void;
  internalNote: string;
  onInternalNoteChange: (value: string) => void;
}

const COMMON_REQUESTS = [
  "Ăn hạt 2 bữa/ngày",
  "Đi dạo buổi chiều",
  "Tắm sấy trước khi về",
  "Cắt móng",
  "Chải lông hàng ngày"
];

export function StaffBoardingCareRequestSection({
  careRequest,
  onChange,
  internalNote,
  onInternalNoteChange,
}: Props) {
  
  const handleAddChip = (chip: string) => {
    if (careRequest.includes(chip)) return;
    const newText = careRequest.trim().length > 0 
      ? `${careRequest.trim()}, ${chip}`
      : chip;
    onChange(newText);
  };

  return (
    <div className="bg-petcenter-card border border-petcenter-border rounded-[16px] shadow-sm p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-petcenter-primary" />
          </div>
          <h2 className="text-xl font-bold text-petcenter-text tracking-tight">5. Ghi chú & Yêu cầu</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Khách hàng yêu cầu */}
        <div className="bg-white rounded-[12px] border border-petcenter-border p-1 focus-within:border-petcenter-primary focus-within:ring-1 focus-within:ring-petcenter-primary transition-all shadow-sm">
          <div className="flex justify-between items-center p-3 pb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-petcenter-text">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Yêu cầu chăm sóc từ khách hàng
            </label>
            <span className="text-xs font-medium text-petcenter-text-muted">{careRequest.length}/1000</span>
          </div>
          
          <textarea
            value={careRequest}
            onChange={(e) => onChange(e.target.value)}
            maxLength={1000}
            placeholder="Ví dụ: Không ăn đồ lạ, cún nhát người lạ..."
            className="w-full min-h-[100px] bg-transparent px-4 py-2 text-[14px] text-petcenter-text placeholder:text-petcenter-text-muted focus:outline-none resize-y"
          />
          
          {/* Quick tags */}
          <div className="flex flex-wrap gap-2 px-4 pb-4 pt-2">
            {COMMON_REQUESTS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleAddChip(chip)}
                className="text-[12px] font-medium bg-petcenter-background hover:bg-petcenter-primary/10 hover:text-petcenter-primary text-petcenter-text-secondary px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-petcenter-primary/20"
                type="button"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
