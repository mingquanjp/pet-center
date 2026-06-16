import { DoctorExaminationDetailPage } from "@/features/examinations/pages/doctor/DoctorExaminationDetailPage"

interface Props {
  params: Promise<{
    appointmentId: string
  }>
}

export default async function DoctorExaminationDetailRoutePage({ params }: Props) {
  const { appointmentId } = await params

  return <DoctorExaminationDetailPage appointmentId={appointmentId} />
}
