import { OwnerAppointmentDetailPage } from "@/features/appointments/pages/owner/OwnerAppointmentDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{
    appointmentId: string;
  }>;
}) {
  const { appointmentId } = await params;

  return <OwnerAppointmentDetailPage appointmentId={appointmentId} />;
}
