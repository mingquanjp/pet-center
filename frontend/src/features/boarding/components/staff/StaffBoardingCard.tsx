import React from "react";
import Image from "next/image";
import { StaffBoardingListItem } from "../../types/boarding.types";
import { StaffBoardingStatusBadge } from "./StaffBoardingStatusBadge";
import { User, PawPrint } from "lucide-react";
import {
  formatBoardingDateRange,
  getBoardingAmountLabel,
  formatBoardingLastUpdate,
} from "../../utils/boarding-format";
interface Props {
  record: StaffBoardingListItem;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  onUpdate?: (record: StaffBoardingListItem) => void;
  onCheckOut?: (id: string) => void;
  onView?: (id: string) => void;
}

export function StaffBoardingCard({
  record,
  onConfirm,
  onReject,
  onCheckIn,
  onUpdate,
  onCheckOut,
  onView,
}: Props) {
  const isPending = record.status === "PENDING" || record.status === "PENDING_PAYMENT";
  const isConfirmed = record.status === "CONFIRMED";
  const isStaying = record.status === "STAYING";

  return (
    <div className="bg-petcenter-card rounded-[16px] p-5 border border-petcenter-border shadow-sm flex flex-col xl:flex-row gap-6 relative">
      <div className="absolute top-5 right-5">
        <StaffBoardingStatusBadge status={record.status} />
      </div>

      {/* Cột 1: Thông tin thú cưng/chủ nuôi */}
      <div className="flex gap-4 xl:w-1/3">
        <div className="w-16 h-16 rounded-[12px] overflow-hidden bg-petcenter-background shrink-0 relative">
          {record.pet.imageUrl ? (
            <Image
              src={record.pet.imageUrl}
              alt={record.pet.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-petcenter-border text-petcenter-text-muted">
              <PawPrint className="w-8 h-8 opacity-50" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-[18px] text-petcenter-text font-bold flex items-center gap-2">
            {record.pet.name}
            <span className="text-[11px] font-medium text-petcenter-text-secondary bg-petcenter-background border border-petcenter-border px-2 py-0.5 rounded-md">
              {record.boardingCode}
            </span>
          </h3>
          <p className="text-[14px] text-petcenter-text-secondary mt-1 flex items-center gap-1.5">
            <User className="w-4 h-4" /> {record.owner.fullName}
          </p>
          <p className="text-[13px] text-petcenter-text-secondary opacity-80 mt-0.5">
            {record.pet.species === "Dog" ? "Chó" : record.pet.species === "Cat" ? "Mèo" : "Khác"} • {record.pet.breed || "Không rõ"}
            {record.pet.ageText ? ` • ${record.pet.ageText}` : ""}
          </p>
        </div>
      </div>

      {/* Cột 2: Phòng & Thời gian */}
      <div className="grid grid-cols-2 gap-4 xl:w-1/3 border-t xl:border-t-0 xl:border-l border-petcenter-border pt-4 xl:pt-0 xl:pl-6">
        <div>
          <p className="text-[12px] text-petcenter-text-secondary mb-1">Phòng</p>
          <p className="text-[14px] text-petcenter-text font-medium">
            {record.room ? (record.room.name || record.room.code || "N/A") : "Chuồng riêng"}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-petcenter-text-secondary mb-1">
            Thời gian ({record.totalDays} ngày)
          </p>
          <p className="text-[14px] text-petcenter-text font-medium">
            {formatBoardingDateRange(record.checkInDate, record.checkOutDate)}
          </p>
        </div>
        <div className="col-span-2">
          {isStaying && record.latestUpdateAt && (
            <div className="mb-2">
              <p className="text-[11px] text-petcenter-text-secondary">
                Cập nhật gần nhất: {formatBoardingLastUpdate(record.latestUpdateAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cột 3: Thanh toán & Actions */}
      <div className="flex flex-col justify-between gap-4 xl:w-1/3 border-t xl:border-t-0 xl:border-l border-petcenter-border pt-4 xl:pt-0 xl:pl-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                record.paymentStatus === "PAID"
                  ? "bg-[#D1FAE5] text-[#065F46]"
                  : "bg-[#FFF3D8] text-[#B45309]"
              }`}
            >
              {record.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
          </div>
          <p className="text-[16px] text-petcenter-text font-bold">
            {getBoardingAmountLabel(record)}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {isPending && (
            <>
              <button
                onClick={() => onConfirm?.(record.id)}
                className="flex-1 bg-petcenter-primary hover:bg-petcenter-primary/90 text-white py-2 rounded-[12px] text-[13px] font-medium transition-colors whitespace-nowrap"
              >
                Xác nhận
              </button>
              <button
                onClick={() => onReject?.(record.id)}
                className="flex-1 bg-petcenter-card border border-[#B91C1C] text-[#B91C1C] hover:bg-[#FEE2E2] py-2 rounded-[12px] text-[13px] font-medium transition-colors whitespace-nowrap"
              >
                Từ chối
              </button>
            </>
          )}

          {isConfirmed && (
            <button
              onClick={() => onCheckIn?.(record.id)}
              className="flex-1 bg-petcenter-primary hover:bg-petcenter-primary/90 text-white py-2 rounded-[12px] text-[13px] font-medium transition-colors whitespace-nowrap"
            >
              Check-in
            </button>
          )}

          {isStaying && (
            <>
              <button
                onClick={() => onUpdate?.(record)}
                className="flex-1 bg-petcenter-primary hover:bg-petcenter-primary/90 text-white py-2 rounded-[12px] text-[13px] font-medium transition-colors whitespace-nowrap"
              >
                Cập nhật
              </button>
              <button
                onClick={() => onCheckOut?.(record.id)}
                className="flex-1 bg-petcenter-card border border-petcenter-primary text-petcenter-primary hover:bg-petcenter-primary/10 py-2 rounded-[12px] text-[13px] font-medium transition-colors whitespace-nowrap"
              >
                Check-out
              </button>
            </>
          )}

          <button
            onClick={() => onView?.(record.id)}
            className={`flex-1 py-2 rounded-[12px] text-[13px] font-medium transition-colors whitespace-nowrap ${
              !isPending && !isConfirmed && !isStaying
                ? "bg-petcenter-primary/10 text-petcenter-primary hover:bg-petcenter-primary/20"
                : "bg-petcenter-background border border-petcenter-border text-petcenter-text-secondary hover:text-petcenter-text hover:border-petcenter-text"
            }`}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
