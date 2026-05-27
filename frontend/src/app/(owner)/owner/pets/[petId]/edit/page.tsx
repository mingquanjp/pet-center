import { OwnerEditPetPage } from "@/features/pets/pages/owner/OwnerEditPetPage"

export default async function EditPetPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params

  return <OwnerEditPetPage petId={petId} />
}
