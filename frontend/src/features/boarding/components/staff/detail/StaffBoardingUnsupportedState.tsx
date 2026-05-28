import React from "react";
import { Clock } from "lucide-react";

interface Props {
  onBack: () => void;
}

export function StaffBoardingUnsupportedState({ onBack }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
      <div className="relative w-20 h-20 rounded-full bg-petcenter-info-bg flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-petcenter-primary" />
      </div>
      <h3 className="heading-sm text-petcenter-text mb-2">Trạng thái này sẽ được xử lý sau</h3>
      <p className="body-md text-petcenter-text-secondary mb-6 max-w-100">
        Màn chi tiết cho trạng thái này sẽ được bổ sung ở bước tiếp theo.
      </p>
      <button
        onClick={onBack}
        className="px-6 py-2 bg-petcenter-primary text-white rounded-[0.75rem] body-md font-medium hover:bg-petcenter-primary-hover transition-colors"
      >
        Quay lại danh sách
      </button>
    </div>
  );
}
