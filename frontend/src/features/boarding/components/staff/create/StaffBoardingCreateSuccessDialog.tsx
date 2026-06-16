"use client";

import { CheckCircle2, FileText, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateStaffBoardingResult } from "../../../types/boarding.types";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: CreateStaffBoardingResult | null;
}

export function StaffBoardingCreateSuccessDialog({ isOpen, onOpenChange, result }: Props) {
  if (!result) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 ring-0 shadow-2xl bg-white">
        {/* Header Section */}
        <div className="pt-10 pb-4 flex flex-col items-center justify-center text-center px-8">
          <div className="relative h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-green-50/50">
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Tạo phiếu thành công</DialogTitle>
          <p className="text-gray-500 text-sm mt-2 max-w-[280px]">
            Phiếu lưu trú đã được kích hoạt và thú cưng hiện đang lưu trú tại trung tâm.
          </p>
        </div>

        {/* Info Section */}
        <div className="px-8 py-2">
          <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100/80">
            <div className="space-y-4">
              {/* Boarding Info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0">
                    <Calendar className="h-4 w-4 text-petcenter-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Mã lưu trú</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{result.boardingCode}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold whitespace-nowrap min-w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse flex-shrink-0"></span>
                    Đang lưu trú
                  </span>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0">
                    <FileText className="h-4 w-4 text-petcenter-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Mã hóa đơn</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{result.invoice.invoiceCode || "---"}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold whitespace-nowrap min-w-max">
                    Đã thanh toán
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-5 pt-4 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Tổng thanh toán</span>
              <span className="text-xl font-bold text-petcenter-primary">
                {formatCurrency(result.invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-11 rounded-xl bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">
            <Link href="/staff/boarding">
              Về danh sách
            </Link>
          </Button>
          <Button asChild className="h-11 rounded-xl bg-petcenter-primary hover:bg-petcenter-primary/90 text-white shadow-sm font-medium">
            <Link href={`/staff/boarding/${result.boardingId}`}>
              Xem chi tiết
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
