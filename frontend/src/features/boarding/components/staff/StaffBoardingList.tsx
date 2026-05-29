import React from "react";
import { StaffBoardingListItem } from "../../types/boarding.types";
import { StaffBoardingCard } from "./StaffBoardingCard";
import { StaffBoardingEmptyState } from "./StaffBoardingEmptyState";

interface Props {
  records: StaffBoardingListItem[];
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  onUpdate?: (record: StaffBoardingListItem) => void;
  onCheckOut?: (id: string) => void;
  onView?: (id: string) => void;
  onResetFilters: () => void;
}

export function StaffBoardingList({
  records,
  onConfirm,
  onReject,
  onCheckIn,
  onUpdate,
  onCheckOut,
  onView,
  onResetFilters,
}: Props) {
  if (records.length === 0) {
    return <StaffBoardingEmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <StaffBoardingCard
          key={record.id}
          record={record}
          onConfirm={onConfirm}
          onReject={onReject}
          onCheckIn={onCheckIn}
          onUpdate={onUpdate}
          onCheckOut={onCheckOut}
          onView={onView}
        />
      ))}
    </div>
  );
}
