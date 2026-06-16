import { Suspense } from "react";
import { StaffPetsPage } from "@/features/pets/pages/staff/StaffPetsPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center text-sm text-petcenter-text-secondary">
          Đang tải danh sách hồ sơ thú cưng...
        </div>
      }
    >
      <StaffPetsPage />
    </Suspense>
  );
}
