import { Suspense } from "react";
import { StaffPetCreatePage } from "@/features/pets/pages/staff/StaffPetCreatePage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center text-sm text-petcenter-text-secondary">
          Đang tải trang tạo hồ sơ thú cưng...
        </div>
      }
    >
      <StaffPetCreatePage />
    </Suspense>
  );
}
