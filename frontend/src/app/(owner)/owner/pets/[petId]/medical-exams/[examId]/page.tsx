import { OwnerPetMedicalExamDetailPage } from "@/features/pets/pages/owner/OwnerPetMedicalExamDetailPage"

export default async function PetMedicalExamDetailPage({ params }: { params: Promise<{ petId: string; examId: string }> }) {
  const { examId, petId } = await params

  return <OwnerPetMedicalExamDetailPage examId={examId} petId={petId} />
}
