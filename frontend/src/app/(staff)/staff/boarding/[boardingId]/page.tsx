import { StaffBoardingDetailPage } from "@/features/boarding/pages/staff/StaffBoardingDetailPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết lưu trú - PetCenter",
  description: "Quản lý chi tiết yêu cầu lưu trú của thú cưng",
};

export default async function Page(props: {
  params: Promise<{ boardingId: string }>;
}) {
  const params = await props.params;
  return <StaffBoardingDetailPage boardingId={params.boardingId} />;
}
