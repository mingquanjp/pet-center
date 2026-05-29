import React from "react";
import Image from "next/image";
import { User, Phone, PawPrint, NotebookPen } from "lucide-react";
import { StaffBoardingDetail } from "../../../types/boarding.types";
import { StaffBoardingStatusBadge } from "../StaffBoardingStatusBadge";

interface Props {
  detail: StaffBoardingDetail;
  onConfirm?: () => void;
  onReject?: () => void;
  onCheckIn?: () => void;
  onCareUpdate?: () => void;
  onCheckOut?: () => void;
}

export function StaffBoardingHeroCard({ detail, onConfirm, onReject, onCheckIn, onCareUpdate, onCheckOut }: Props) {
  const isPending = detail.status === "PENDING";
  const isConfirmed = detail.status === "CONFIRMED";
  const isStaying = detail.status === "STAYING";

  return (
    <div className="bg-petcenter-card rounded-card p-6 border border-petcenter-border shadow-card flex flex-col md:flex-row items-center justify-between gap-6 w-full animate-in fade-in duration-500">
      
      {/* Left side: Pet Info */}
      <div className="flex gap-5 flex-1 w-full">
        <div className="w-20 h-20 rounded-[12px] overflow-hidden bg-petcenter-background shrink-0 relative border border-petcenter-border">
          {detail.pet.imageUrl ? (
            <Image
              src={detail.pet.imageUrl}
              alt={detail.pet.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-petcenter-primary/10 text-petcenter-primary">
              <PawPrint className="w-8 h-8 opacity-70" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[20px] font-bold text-petcenter-text">{detail.pet.name}</h2>
            <span className="text-[11px] font-medium text-petcenter-text-secondary bg-petcenter-background border border-petcenter-border px-2 py-0.5 rounded-md">
              {detail.boardingCode}
            </span>
          </div>
          
          <p className="text-[14px] text-petcenter-text-secondary">
            {detail.pet.species === "Dog" ? "Chó" : detail.pet.species === "Cat" ? "Mèo" : "Khác"} • {detail.pet.breed || "Không rõ"}
            {detail.pet.ageText ? ` • ${detail.pet.ageText}` : ""}
          </p>
        </div>
      </div>

      {/* Middle: Owner Info */}
      <div className="flex flex-col justify-center flex-1 border-t md:border-t-0 md:border-l md:border-r border-petcenter-border py-4 md:py-2 md:px-8 gap-2 w-full">
        <span className="text-[12px] font-semibold text-petcenter-text-secondary uppercase tracking-wider mb-1">Thông tin chủ nuôi</span>
        <div className="flex flex-col gap-2.5">
          <p className="text-[14px] text-petcenter-text flex items-center gap-2.5 font-medium">
            <User className="w-4 h-4 text-petcenter-text-muted" /> {detail.owner.fullName}
          </p>
          {detail.owner.phoneNumber && (
            <p className="text-[14px] text-petcenter-text flex items-center gap-2.5 font-medium">
              <Phone className="w-4 h-4 text-petcenter-text-muted" /> {detail.owner.phoneNumber}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Action Center */}
      <div className="flex flex-col items-start md:items-end justify-center flex-1 pt-4 md:pt-0 gap-3 w-full">
        <StaffBoardingStatusBadge status={detail.status} />
        
        {isPending ? (
          <div className="flex items-center gap-3 mt-1 w-full md:w-auto">
            <button
              onClick={onReject}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-[12px] text-[14px] font-medium border border-petcenter-danger-text text-petcenter-danger-text hover:bg-petcenter-danger-bg transition-colors"
            >
              Từ chối
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-[12px] text-[14px] font-medium bg-petcenter-primary text-white hover:bg-petcenter-primary-hover transition-colors shadow-sm"
            >
              Xác nhận
            </button>
          </div>
        ) : isConfirmed ? (
          <div className="flex items-center gap-3 mt-1 w-full md:w-auto">
            <button
              onClick={onCheckIn}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-[12px] text-[14px] font-medium bg-petcenter-cta text-white hover:bg-petcenter-cta-hover transition-colors shadow-sm flex items-center gap-2 justify-center"
            >
              <PawPrint className="w-4 h-4" />
              Tiến hành Check-in
            </button>
          </div>
        ) : isStaying ? (
          <div className="flex items-center gap-3 mt-1 w-full md:w-auto">
            <button
              onClick={onCareUpdate}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-[12px] text-[14px] font-medium border border-petcenter-primary text-petcenter-primary hover:bg-petcenter-primary/10 transition-colors shadow-sm flex items-center gap-2 justify-center"
            >
              <NotebookPen className="w-4 h-4" />
              Cập nhật chăm sóc
            </button>
            <button
              onClick={onCheckOut}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-[12px] text-[14px] font-medium bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm flex items-center gap-2 justify-center"
            >
              <PawPrint className="w-4 h-4" />
              Check-out
            </button>
          </div>
        ) : (
          <div className="mt-1">
             <p className="text-[13px] text-petcenter-text-secondary italic">
               Không có thao tác xử lý
             </p>
          </div>
        )}
      </div>

    </div>
  );
}
