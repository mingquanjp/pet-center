"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StaffBoardingOwnerOption, StaffBoardingPetOption, StaffBoardingRoomTypeOption } from "../../../types/boarding.types";
import { formatBoardingDateTime } from "../../../utils/boarding-format";
import { calculateBoardingDays, calculateBoardingInvoicePreview } from "../../../utils/boarding-pricing";

interface Props {
  owner: StaffBoardingOwnerOption | null;
  pet: StaffBoardingPetOption | null;
  roomType: StaffBoardingRoomTypeOption | null;
  checkInDate: string;
  checkOutDate: string;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function StaffBoardingCreateSummary({
  owner,
  pet,
  roomType,
  checkInDate,
  checkOutDate,
  isSubmitting,
  onSubmit,
}: Props) {
  const totalDays = calculateBoardingDays(checkInDate, checkOutDate);
  const isValid = !!(owner && pet && roomType && totalDays > 0);

  const invoice = calculateBoardingInvoicePreview({ roomType, checkInDate, checkOutDate });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "---";
    return formatBoardingDateTime(dateString).replace(" - ", " ");
  };

  return (
    <div className="space-y-4">
      <div className="bg-petcenter-card border border-petcenter-border rounded-card shadow-card p-6">
        <h2 className="text-lg font-semibold text-petcenter-text mb-4 border-b pb-2">Tóm tắt lưu trú</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-petcenter-text-secondary">Chủ nuôi:</span>
            <span className="font-medium text-petcenter-text text-right line-clamp-1">{owner?.fullName || "---"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-petcenter-text-secondary">Thú cưng:</span>
            <span className="font-medium text-petcenter-text text-right line-clamp-1">{pet?.name || "---"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-petcenter-text-secondary">Loại phòng:</span>
            <span className="font-medium text-petcenter-text text-right line-clamp-1">{roomType?.name || "---"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-petcenter-text-secondary">Ngày nhận:</span>
            <span className="font-medium text-petcenter-text">{formatDateTime(checkInDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-petcenter-text-secondary">Ngày trả:</span>
            <span className="font-medium text-petcenter-text">{formatDateTime(checkOutDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-petcenter-text-secondary">Số ngày:</span>
            <span className="font-medium text-petcenter-text">{totalDays > 0 ? `${totalDays} ngày` : "---"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-petcenter-text-secondary">Thanh toán:</span>
            <span className="font-medium text-petcenter-text">Tại quầy</span>
          </div>
          <div className="flex justify-between font-bold text-base text-petcenter-primary">
            <span>Tổng tiền:</span>
            <span>{invoice ? formatCurrency(invoice.totalAmount) : "0 ₫"}</span>
          </div>
        </div>
        <div className="mt-6">
          <Button
            className="w-full rounded-control py-6 text-base font-bold bg-petcenter-primary hover:bg-petcenter-primary/90 text-white shadow-md transition-all"
            disabled={!isValid || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Tạo phiếu & hóa đơn"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
