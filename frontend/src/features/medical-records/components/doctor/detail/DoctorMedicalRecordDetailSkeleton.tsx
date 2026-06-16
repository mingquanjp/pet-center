import React from "react";

export function DoctorMedicalRecordDetailSkeleton() {
  return (
    <div className="flex-1 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Pet Summary Skeleton */}
      <div className="h-48 w-full bg-gray-200 rounded-2xl"></div>

      {/* Stats Skeleton */}
      <div className="h-32 bg-gray-200 rounded-2xl"></div>

      {/* History Skeleton */}
      <div className="h-96 w-full bg-gray-200 rounded-2xl"></div>
    </div>
  );
}
