import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PawPrint, SearchX } from "lucide-react";

export function DoctorMedicalRecordEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center animate-in fade-in duration-500">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-petcenter-danger-bg">
        <SearchX className="h-10 w-10 text-petcenter-danger-text" />
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-petcenter-border bg-petcenter-card shadow-sm">
          <PawPrint className="h-4 w-4 text-petcenter-text-muted" />
        </div>
      </div>
      <h2 className="heading-lg mb-2 text-petcenter-text">Không tìm thấy bệnh án</h2>
      <p className="body-md mb-8 max-w-md text-petcenter-text-secondary">
        Hồ sơ bệnh án không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn hoặc quay lại danh sách.
      </p>
      <button
        type="button"
        onClick={() => router.push("/doctor/medical-records")}
        className="flex items-center gap-2 rounded-[0.75rem] bg-petcenter-primary px-6 py-2 font-medium text-white transition-colors hover:bg-petcenter-primary-hover body-md"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>
    </div>
  );
}
