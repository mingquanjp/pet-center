import { StaffPetEditPage } from "@/features/pets/pages/staff/StaffPetEditPage";

type PageProps = {
  params: Promise<{
    petId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { petId } = await params;

  return <StaffPetEditPage petId={petId} />;
}
