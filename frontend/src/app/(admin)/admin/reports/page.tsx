import { Suspense } from "react";
import { AdminReportsPage } from "@/features/reports/pages/admin/AdminReportsPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Đang tải báo cáo...</div>}>
      <AdminReportsPage />
    </Suspense>
  );
}
