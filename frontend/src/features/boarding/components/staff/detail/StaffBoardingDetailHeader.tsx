import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StaffBoardingDetail } from "../../../types/boarding.types";

interface Props {
  detail: StaffBoardingDetail;
}

export function StaffBoardingDetailHeader({ detail }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Top Row: Breadcrumb & Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/boarding">Lưu trú</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{detail.boardingCode}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Link
          href="/staff/boarding"
          className="rounded-control border border-petcenter-primary text-petcenter-primary hover:bg-petcenter-primary hover:text-white px-4 py-2 h-auto flex items-center justify-center gap-1.5 font-medium text-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-petcenter-text tracking-tight">Chi tiết lưu trú</h1>
        <p className="text-base font-normal text-petcenter-text-secondary mt-2">
          Xem thông tin chi tiết về phòng, dịch vụ, thanh toán và nhật ký của thú cưng {detail.pet.name}.
        </p>
      </div>
    </div>
  );
}
