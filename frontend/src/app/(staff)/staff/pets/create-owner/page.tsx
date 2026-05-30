import { Suspense } from "react";
import { StaffOwnerCreatePage } from "@/features/pets/pages/staff/StaffOwnerCreatePage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center text-sm text-petcenter-text-secondary">
          Đang tải trang tạo Chủ nuôi...
        </div>
      }
    >
      <StaffOwnerCreatePage />
    </Suspense>
  );
}
