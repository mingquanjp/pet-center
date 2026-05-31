"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StaffBoardingCreateHeader() {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-petcenter-text-secondary">
        <Link href="/staff/boarding" className="hover:text-petcenter-primary">
          Lưu trú
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-petcenter-text font-medium">Tạo lưu trú tại quầy</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-petcenter-text">Tạo lưu trú tại quầy</h1>
          <p className="text-petcenter-text-secondary text-sm mt-1">
            Tạo phiếu lưu trú, nhận thú cưng ngay và ghi nhận hóa đơn thanh toán tại quầy.
          </p>
        </div>
      </div>
    </div>
  );
}
