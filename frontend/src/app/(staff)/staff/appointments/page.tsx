import { StaffAppointmentsPage } from "@/features/appointments/pages/staff/StaffAppointmentsPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <StaffAppointmentsPage />
    </Suspense>
  );
}
