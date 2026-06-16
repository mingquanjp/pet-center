import { OwnerPetDetailPage } from "@/features/pets/pages/owner/OwnerPetDetailPage"

export default async function PetDetailPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params

  return <OwnerPetDetailPage petId={petId} />
}
