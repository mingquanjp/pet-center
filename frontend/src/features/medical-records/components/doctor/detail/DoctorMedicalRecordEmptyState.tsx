import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, SearchX } from "lucide-react";

export function DoctorMedicalRecordEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <SearchX className="h-8 w-8" />
      </div>
      <h2 className="heading-lg mb-2 text-petcenter-text">Không tìm thấy bệnh án</h2>
      <p className="body-md mb-8 max-w-md text-petcenter-text-secondary">
        Hồ sơ bệnh án không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn hoặc quay lại danh sách.
      </p>
      <button
        type="button"
        onClick={() => router.push("/doctor/medical-records")}
        className="inline-flex items-center gap-2 rounded-control bg-petcenter-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-petcenter-primary/90"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>
    </div>
  );
}
