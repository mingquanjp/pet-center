import { OwnerBoardingDetailPage } from "@/features/boarding/pages/owner/OwnerBoardingDetailPage"

export default async function BoardingDetailPage({ params }: { params: Promise<{ boardingRecordId: string }> }) {
  const { boardingRecordId } = await params

  return <OwnerBoardingDetailPage boardingRecordId={decodeURIComponent(boardingRecordId)} />
}
