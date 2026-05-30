"use client";

import { Loader2, Plus, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { boardingApi } from "../../../api/boarding.api";
import { StaffBoardingOwnerOption } from "../../../types/boarding.types";
import { StaffBoardingOwnerSearchCombobox } from "./StaffBoardingOwnerSearchCombobox";

interface Props {
  options: StaffBoardingOwnerOption[];
  selectedOwnerId: string;
  onOwnerSelect: (ownerId: string) => void;
  onOwnerCreated?: (owner: StaffBoardingOwnerOption) => void;
}

export function StaffBoardingOwnerSection({
  options,
  selectedOwnerId,
  onOwnerSelect,
  onOwnerCreated
}: Props) {
  const [createdOwners, setCreatedOwners] = useState<StaffBoardingOwnerOption[]>([]);
  const mergedOptions = [
    ...createdOwners.filter((owner) => !options.some((option) => option.id === owner.id)),
    ...options
  ];
  const selectedOwner = mergedOptions.find((o) => o.id === selectedOwnerId);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSavingOwner, setIsSavingOwner] = useState(false);

  const resetOwnerForm = () => {
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setAddress("");
  };

  const handleCreateOwner = async () => {
    const normalizedFullName = fullName.trim();
    const normalizedPhoneNumber = phoneNumber.trim();
    const normalizedEmail = email.trim();

    if (!normalizedFullName || !normalizedPhoneNumber || !normalizedEmail) {
      toast.error("Vui lÃ²ng nháº­p há» tÃªn, sá»‘ Ä‘iá»‡n thoáº¡i vÃ  email chá»§ nuÃ´i.");
      return;
    }

    try {
      setIsSavingOwner(true);
      const owner = await boardingApi.createStaffBoardingOwner({
        fullName: normalizedFullName,
        phoneNumber: normalizedPhoneNumber,
        email: normalizedEmail,
        address: address.trim() || undefined
      });

      setCreatedOwners((current) => [owner, ...current.filter((item) => item.id !== owner.id)]);
      onOwnerSelect(owner.id);
      onOwnerCreated?.(owner);
      resetOwnerForm();
      setIsSheetOpen(false);
      if (owner.emailSent === false) {
        toast.warning("Đã tạo chủ nuôi, nhưng gửi email tài khoản thất bại.");
      } else {
        toast.success("Đã tạo chủ nuôi và gửi email tài khoản.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tạo hồ sơ chủ nuôi thất bại";
      toast.error(message);
    } finally {
      setIsSavingOwner(false);
    }
  };

  return (
    <div className="bg-petcenter-card border border-petcenter-border rounded-[16px] shadow-sm p-6">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-petcenter-primary" />
          </div>
          <h2 className="text-xl font-bold text-petcenter-text tracking-tight">1. Chủ nuôi</h2>
        </div>

        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) resetOwnerForm();
          }}
        >
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-[8px] hover:bg-petcenter-primary/10 hover:text-petcenter-primary hover:border-petcenter-primary transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Thêm chủ nuôi
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton
            className="w-full gap-0 border-l border-petcenter-border-strong bg-petcenter-card p-0 text-petcenter-text shadow-modal data-[side=right]:w-full data-[side=right]:sm:w-[760px] data-[side=right]:sm:max-w-none flex flex-col"
          >
            <SheetHeader className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-8 py-7 shadow-sm relative overflow-hidden">
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0D9488]/10 w-10 h-10 rounded-xl flex items-center justify-center border border-[#0D9488]/20">
                    <User className="h-5 w-5 text-[#0D9488]" />
                  </div>
                  <SheetTitle className="text-[22px] font-bold text-[#0F172A] tracking-tight">
                    Thêm chủ nuôi mới
                  </SheetTitle>
                </div>
                <SheetDescription className="text-[15px] font-medium text-[#64748B] pl-[52px]">
                  Nhập thông tin để tạo nhanh hồ sơ chủ nuôi.
                </SheetDescription>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0D9488]/5 rounded-bl-full pointer-events-none -z-0" />
            </SheetHeader>

            <div className="flex-1 px-8 py-8 overflow-y-auto">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                <h3 className="text-base font-bold text-[#0F172A] mb-5 pb-4 border-b border-[#E2E8F0] flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#0D9488] rounded-full" />
                  Thông tin liên hệ
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-semibold text-[#0F172A]">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] focus-visible:border-[#0D9488] shadow-sm transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-semibold text-[#0F172A]">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ví dụ: 0901 234 567"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] focus-visible:border-[#0D9488] shadow-sm transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-[#0F172A]">
                      Địa chỉ Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ví dụ: user@example.com"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] focus-visible:border-[#0D9488] shadow-sm transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-[#0F172A]">
                      Địa chỉ liên hệ
                    </label>
                    <Input
                      placeholder="Ví dụ: 123 Đường ABC, Phường Y, Quận X, TP.HCM"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] focus-visible:border-[#0D9488] shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-3 mt-auto shrink-0">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="rounded-[10px] h-11 px-6 font-semibold border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-white shadow-sm transition-all"
                  disabled={isSavingOwner}
                >
                  Hủy bỏ
                </Button>
              </SheetClose>
              <Button
                className="rounded-[10px] h-11 px-8 bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm font-semibold transition-all"
                disabled={isSavingOwner || !fullName.trim() || !phoneNumber.trim() || !email.trim()}
                onClick={handleCreateOwner}
              >
                {isSavingOwner && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu hồ sơ
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        <StaffBoardingOwnerSearchCombobox
          options={mergedOptions}
          value={selectedOwnerId}
          onChange={onOwnerSelect}
        />

        {selectedOwner && (
          <div className="bg-petcenter-background rounded-[12px] p-4 mt-4 border border-petcenter-border">
            <h3 className="font-medium text-petcenter-text mb-2">Thông tin chủ nuôi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-petcenter-text-secondary">Họ tên</p>
                <p className="font-medium text-petcenter-text">{selectedOwner.fullName}</p>
              </div>
              <div>
                <p className="text-petcenter-text-secondary">Số điện thoại</p>
                <p className="font-medium text-petcenter-text">{selectedOwner.phoneNumber}</p>
              </div>
              {selectedOwner.email && (
                <div>
                  <p className="text-petcenter-text-secondary">Email</p>
                  <p className="font-medium text-petcenter-text">{selectedOwner.email}</p>
                </div>
              )}
              {selectedOwner.address && (
                <div>
                  <p className="text-petcenter-text-secondary">Địa chỉ</p>
                  <p className="font-medium text-petcenter-text">{selectedOwner.address}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

