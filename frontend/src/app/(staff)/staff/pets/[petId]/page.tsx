import { StaffPetDetailPage } from "@/features/pets/pages/staff/StaffPetDetailPage";

type PageProps = {
  params: Promise<{
    petId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { petId } = await params;

  return <StaffPetDetailPage petId={petId} />;
}
