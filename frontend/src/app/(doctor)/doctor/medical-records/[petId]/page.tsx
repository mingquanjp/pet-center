import { DoctorMedicalRecordDetailPage } from "@/features/medical-records/pages/doctor/DoctorMedicalRecordDetailPage";

interface Props {
  params: Promise<{
    petId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { petId } = await params;
  return <DoctorMedicalRecordDetailPage petId={petId} />;
}
