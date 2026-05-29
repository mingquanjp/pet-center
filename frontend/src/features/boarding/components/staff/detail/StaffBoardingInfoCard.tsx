import React from "react";
import { StaffBoardingDetail } from "../../../types/boarding.types";
import { formatBoardingDateRange } from "../../../utils/boarding-format";
import { ClipboardList, Hash, Home, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  detail: StaffBoardingDetail;
  className?: string;
}

export function StaffBoardingInfoCard({ detail, className }: Props) {
  const roomName = detail.room ? (detail.room.name || detail.room.code || "N/A") : "Chuồng riêng";
  
  return (
    <Card className={`rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md p-0 gap-0 flex flex-col ${className || "h-fit"}`}>
      <CardHeader className="pt-5 px-6 pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shadow-sm">
            <ClipboardList className="w-5 h-5 text-petcenter-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Thông tin lưu trú</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-5 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4 text-petcenter-text-muted" /> Mã phiếu
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">{detail.boardingCode}</div>
          </div>
          
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <Home className="w-4 h-4 text-petcenter-text-muted" /> Loại & Phòng
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">
              {roomName}
            </div>
          </div>
          
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all col-span-2">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-petcenter-text-muted" /> Thời gian ({detail.totalDays} ngày)
            </span>
            <div className="font-semibold text-petcenter-text text-base pl-6">
              {formatBoardingDateRange(detail.checkInDate, detail.checkOutDate)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
