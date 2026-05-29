import { StaffAppointmentDetailPage } from "@/features/appointments/pages/staff/StaffAppointmentDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{
    appointmentId: string;
  }>;
}) {
  const { appointmentId } = await params;
  return <StaffAppointmentDetailPage appointmentId={appointmentId} />;
}
