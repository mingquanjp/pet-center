import { OwnerAppointmentsPage } from "@/features/appointments/pages/owner/OwnerAppointmentsPage";

type PageProps = {
  searchParams: Promise<{
    createdAppointmentId?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { createdAppointmentId = "" } = await searchParams;

  return <OwnerAppointmentsPage initialCreatedAppointmentId={createdAppointmentId} />;
}
