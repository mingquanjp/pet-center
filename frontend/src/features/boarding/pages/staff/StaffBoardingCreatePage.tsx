"use client";

import { useState } from "react";
import { useStaffBoardingCreateOptions } from "../../hooks/useStaffBoardingCreateOptions";
import { useCreateStaffBoarding } from "../../hooks/useCreateStaffBoarding";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { data: options, isLoading: isLoadingOptions } = useStaffBoardingCreateOptions();
  const createMutation = useCreateStaffBoarding();

  // Form State
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [createdOwners, setCreatedOwners] = useState<StaffBoardingOwnerOption[]>([]);
  const [createdPets, setCreatedPets] = useState<StaffBoardingPetOption[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [plannedCheckInDate, setPlannedCheckInDate] = useState<string>(() => {
    // Default to today
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [plannedCheckOutDate, setPlannedCheckOutDate] = useState<string>("");
  const [careRequest, setCareRequest] = useState<string>("");
  const [internalNote, setInternalNote] = useState<string>("");

  // Dialog State
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [createResult, setCreateResult] = useState<CreateStaffBoardingResult | null>(null);

  if (isLoadingOptions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-petcenter-primary mb-4" />
        <p className="text-petcenter-text-secondary">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-red-500">
        <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // Derived State for Summary
  const selectedOwner =
    createdOwners.find((owner) => owner.id === selectedOwnerId) ||
    options.owners.find((owner: StaffBoardingOwnerOption) => owner.id === selectedOwnerId) ||
    null;
  const selectedPet =
    createdPets.find((pet) => pet.id === selectedPetId) ||
    options.pets.find((pet: StaffBoardingPetOption) => pet.id === selectedPetId) ||
    null;
  const selectedRoomType = options.roomTypes.find((r: StaffBoardingRoomTypeOption) => r.id === selectedRoomTypeId) || null;

  const handleSubmit = () => {
    if (!selectedOwnerId || !selectedPetId || !selectedRoomTypeId || !plannedCheckInDate || !plannedCheckOutDate) {
      return;
    }

    const payload: CreateStaffBoardingPayload = {
      ownerId: selectedOwnerId,
      petId: selectedPetId,
      roomTypeId: selectedRoomTypeId,
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
      onError: (error: Error) => {
        console.error("Failed to create boarding:", error);
        // Toast error could be added here
      }
    });
  };

  const handleOwnerSelect = (ownerId: string) => {
    setSelectedOwnerId(ownerId);
    // Reset pet when owner changes
    setSelectedPetId("");
  };

  const handleOwnerCreated = (owner: StaffBoardingOwnerOption) => {
    setCreatedOwners((current) => [owner, ...current.filter((item) => item.id !== owner.id)]);
  };

  const handlePetCreated = (pet: StaffBoardingPetOption) => {
    setCreatedPets((current) => [pet, ...current.filter((item) => item.id !== pet.id)]);
  };

  return (
    <div className="flex-1 px-6 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Form Sections */}
        <div className="lg:col-span-2 pb-10">
          <StaffBoardingCreateHeader />

          <div className="mt-6 space-y-6">
            <StaffBoardingOwnerSection
              options={options.owners}
              selectedOwnerId={selectedOwnerId}
              onOwnerSelect={handleOwnerSelect}
              onOwnerCreated={handleOwnerCreated}
            />

            <StaffBoardingPetSection
              ownerId={selectedOwnerId}
              pets={options.pets}
              selectedPetId={selectedPetId}
              onPetSelect={setSelectedPetId}
              onPetCreated={handlePetCreated}
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
            <div className="h-27 w-full pointer-events-none" />

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
