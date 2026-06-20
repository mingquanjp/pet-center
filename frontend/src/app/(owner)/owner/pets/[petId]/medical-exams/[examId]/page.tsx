import { OwnerPetMedicalExamDetailPage } from "@/features/pets/pages/owner/OwnerPetMedicalExamDetailPage"

type PageProps = {
  params: Promise<{ petId: string; examId: string }>
  searchParams: Promise<{ returnUrl?: string }>
}

function sanitizeAppointmentReturnUrl(value?: string) {
  if (!value || value.startsWith("//")) return undefined

  try {
    const parsed = new URL(value, "http://pet-center.local")
    if (parsed.origin !== "http://pet-center.local") return undefined

    const detailMatch = parsed.pathname.match(/^\/owner\/appointments\/([A-Za-z0-9_-]+)$/)
    if (detailMatch) {
      return `/owner/appointments/${encodeURIComponent(detailMatch[1])}`
    }

    if (parsed.pathname !== "/owner/appointments") return undefined

    const appointmentId = parsed.searchParams.get("createdAppointmentId")
    if (!appointmentId || !/^[A-Za-z0-9_-]+$/.test(appointmentId)) return "/owner/appointments"

    return `/owner/appointments?createdAppointmentId=${encodeURIComponent(appointmentId)}`
  } catch {
    return undefined
  }
}

export default async function PetMedicalExamDetailPage({ params, searchParams }: PageProps) {
  const { examId, petId } = await params
  const { returnUrl } = await searchParams

  return (
    <OwnerPetMedicalExamDetailPage
      examId={examId}
      petId={petId}
      returnUrl={sanitizeAppointmentReturnUrl(returnUrl)}
    />
  )
}
