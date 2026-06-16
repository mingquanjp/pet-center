import { StaffBoardingPage } from "@/features/boarding/pages/staff/StaffBoardingPage";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Danh sách lưu trú - PetCenter",
  description: "Quản lý danh sách lưu trú của thú cưng",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-petcenter-primary border-t-transparent"></div>
        </div>
      }
    >
      <StaffBoardingPage />
    </Suspense>
  );
}
