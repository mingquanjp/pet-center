import { Suspense } from "react";
import { StaffAppointmentsPage } from "@/features/appointments/pages/staff/StaffAppointmentsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StaffAppointmentsPage />
    </Suspense>
  );
}
