"use client";

import { useState, useEffect } from "react";
import { useStaffBoardingCreateOptions } from "../../hooks/useStaffBoardingCreateOptions";
import { useCreateStaffBoarding } from "../../hooks/useCreateStaffBoarding";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dog3DScene } from "@/components/ui/dog-3d";

import { StaffBoardingCreateHeader } from "../../components/staff/create/StaffBoardingCreateHeader";
import { StaffBoardingOwnerSection } from "../../components/staff/create/StaffBoardingOwnerSection";
import { StaffBoardingPetSection } from "../../components/staff/create/StaffBoardingPetSection";
import { StaffBoardingRoomSection } from "../../components/staff/create/StaffBoardingRoomSection";
import { StaffBoardingDateSection } from "../../components/staff/create/StaffBoardingDateSection";
import { StaffBoardingCareRequestSection } from "../../components/staff/create/StaffBoardingCareRequestSection";
import { StaffBoardingCreateSummary } from "../../components/staff/create/StaffBoardingCreateSummary";
import { StaffBoardingCreateSuccessDialog } from "../../components/staff/create/StaffBoardingCreateSuccessDialog";

import {
  CreateStaffBoardingPayload,
  CreateStaffBoardingResult,
  StaffBoardingOwnerOption,
  StaffBoardingPetOption,
  StaffBoardingRoomTypeOption
} from "../../types/boarding.types";

export function StaffBoardingCreatePage() {
  // We will call useStaffBoardingCreateOptions after state declarations
  const createMutation = useCreateStaffBoarding();

  // Form State
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [localOwners, setLocalOwners] = useState<StaffBoardingOwnerOption[]>([]);
  const [localPets, setLocalPets] = useState<StaffBoardingPetOption[]>([]);
  const [plannedCheckInDate, setPlannedCheckInDate] = useState<string>(() => {
    // Default to today
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [plannedCheckOutDate, setPlannedCheckOutDate] = useState<string>("");
  const [careRequest, setCareRequest] = useState<string>("");
  const [internalNote, setInternalNote] = useState<string>("");

  const { data: options, isLoading: isLoadingOptions, isRefreshing, refetch: refetchOptions } = useStaffBoardingCreateOptions({
    plannedCheckInDate,
    plannedCheckOutDate
  });

  useEffect(() => {
    if (options && selectedRoomTypeId) {
      const room = options.roomTypes.find((r: StaffBoardingRoomTypeOption) => r.id === selectedRoomTypeId);
      if (!room || room.availableCount <= 0) {
        setSelectedRoomTypeId("");
      }
    }
  }, [options, selectedRoomTypeId]);

  // Dialog State
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [createResult, setCreateResult] = useState<CreateStaffBoardingResult | null>(null);

  if (isLoadingOptions && !options) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Dog3DScene />
      </div>
    );
  }

  if (!options) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
        {/* We can show the actual error temporarily */}
      </div>
    );
  }

  // Derived State for Summary
  const allOwners = [...localOwners.filter((o) => !options.owners.some((opt: StaffBoardingOwnerOption) => opt.id === o.id)), ...options.owners];
  const allPets = [...localPets.filter((p) => !options.pets.some((opt: StaffBoardingPetOption) => opt.id === p.id)), ...options.pets];
  const selectedOwner = allOwners.find((o: StaffBoardingOwnerOption) => o.id === selectedOwnerId) || null;
  const selectedPet = allPets.find((p: StaffBoardingPetOption) => p.id === selectedPetId) || null;
  const selectedRoomType = options.roomTypes.find((r: StaffBoardingRoomTypeOption) => r.id === selectedRoomTypeId) || null;

  const handleSubmit = () => {
    if (!selectedOwnerId || !selectedPetId || !selectedRoomTypeId || !plannedCheckInDate || !plannedCheckOutDate) {
      return;
    }

    if (selectedRoomType && selectedRoomType.availableCount <= 0) {
      return;
    }

    const payload: CreateStaffBoardingPayload = {
      ownerId: selectedOwnerId,
      petId: selectedPetId,
      roomTypeId: selectedRoomTypeId,
      plannedCheckInAt: plannedCheckInDate,
      plannedCheckOutAt: plannedCheckOutDate,
      plannedCheckInDate,
      plannedCheckOutDate,
      careRequest: careRequest || null,
      specialRequests: [], // We can extract this from careRequest or keep simple
      paymentMethod: "AT_COUNTER",
      paymentStatus: "PAID",
      createMode: "CHECK_IN_NOW",
      note: internalNote || null,
    };

    createMutation.mutate(payload, {
      onSuccess: (data: CreateStaffBoardingResult) => {
        setCreateResult(data);
        setIsSuccessDialogOpen(true);
      },
      onError: (error: Error & { code?: string }) => {
        console.error("Failed to create boarding:", error);
        if (error.message.includes("BOARDING_PET_TIME_CONFLICT") || error.code === "BOARDING_PET_TIME_CONFLICT") {
          toast.error("Thú cưng này đã có lịch lưu trú trùng thời gian đã chọn.");
          refetchOptions();
          return;
        }

        if (error.message.includes("ROOM_TYPE_FULL") || error.code === "ROOM_TYPE_FULL") {
          toast.error("Loại phòng này vừa hết chỗ. Vui lòng chọn loại phòng khác.");
          refetchOptions();
          setSelectedRoomTypeId("");
        } else {
          toast.error(error.message || "Tạo lưu trú thất bại");
        }
      }
    });
  };

  const handleOwnerSelect = (ownerId: string) => {
    setSelectedOwnerId(ownerId);
    // Reset pet when owner changes
    setSelectedPetId("");
  };

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Form Sections */}
        <div className="lg:col-span-2 pb-10">
          <StaffBoardingCreateHeader />

          <div className="mt-6 space-y-6">
            <StaffBoardingOwnerSection
              options={options.owners}
              selectedOwnerId={selectedOwnerId}
              onOwnerSelect={handleOwnerSelect}
              onOwnerCreated={(owner) => {
                setLocalOwners((prev) => [owner, ...prev.filter((o) => o.id !== owner.id)]);
                setSelectedOwnerId(owner.id);
                setSelectedPetId("");
                refetchOptions();
              }}
            />

            <StaffBoardingPetSection
              ownerId={selectedOwnerId}
              pets={options.pets}
              selectedPetId={selectedPetId}
              onPetSelect={setSelectedPetId}
              onPetCreated={(pet) => {
                setLocalPets((prev) => [pet, ...prev.filter((p) => p.id !== pet.id)]);
                setSelectedPetId(pet.id);
                refetchOptions();
              }}
            />

            <StaffBoardingDateSection
              plannedCheckInDate={plannedCheckInDate}
              plannedCheckOutDate={plannedCheckOutDate}
              onCheckInChange={setPlannedCheckInDate}
              onCheckOutChange={setPlannedCheckOutDate}
            />

            <StaffBoardingRoomSection
              roomTypes={options.roomTypes}
              selectedRoomTypeId={selectedRoomTypeId}
              onRoomSelect={setSelectedRoomTypeId}
            />

            <StaffBoardingCareRequestSection
              careRequest={careRequest}
              onChange={setCareRequest}
              internalNote={internalNote}
              onInternalNoteChange={setInternalNote}
            />

          </div>
        </div>

        {/* Right Column - Sticky Summary */}
        <div className="lg:col-span-1 sticky top-6 z-10">
          <div className="relative w-full">
            <div className="h-[72px] w-full pointer-events-none" />

            <div className="absolute top-0 right-0 h-10 flex items-center justify-end">
              <Button variant="outline" asChild className="rounded-control border-petcenter-primary text-petcenter-primary hover:bg-petcenter-primary hover:text-white px-4 py-2 h-auto flex gap-1.5 font-medium text-base transition-colors shrink-0">
                <Link href="/staff/boarding">
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại danh sách
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <StaffBoardingCreateSummary
              owner={selectedOwner}
              pet={selectedPet}
              roomType={selectedRoomType}
              checkInDate={plannedCheckInDate}
              checkOutDate={plannedCheckOutDate}
              isSubmitting={createMutation.isPending}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      <StaffBoardingCreateSuccessDialog
        isOpen={isSuccessDialogOpen}
        onOpenChange={(open) => {
          if (!open && isSuccessDialogOpen) {
            return;
          }
          setIsSuccessDialogOpen(open);
        }}
        result={createResult}
      />
    </div>
  );
}
