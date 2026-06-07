"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useDoctorMedicalRecordDetail } from "../../hooks/useDoctorMedicalRecordDetail";
import { DoctorPetSummaryCard } from "../../components/doctor/detail/DoctorPetSummaryCard";
import { DoctorQuickStatsCard } from "../../components/doctor/detail/DoctorQuickStatsCard";
import { DoctorMedicalRecordTabs } from "../../components/doctor/detail/DoctorMedicalRecordTabs";
import { DoctorMedicalRecordDetailSkeleton } from "../../components/doctor/detail/DoctorMedicalRecordDetailSkeleton";
import { DoctorMedicalRecordEmptyState } from "../../components/doctor/detail/DoctorMedicalRecordEmptyState";

interface Props {
  petId: string;
}

export function DoctorMedicalRecordDetailPage({ petId }: Props) {
  const router = useRouter();
  const { data, isLoading, error } = useDoctorMedicalRecordDetail(petId);

  if (isLoading) {
    return <DoctorMedicalRecordDetailSkeleton />;
  }

  if (error || !data) {
    return <DoctorMedicalRecordEmptyState />;
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="heading-lg text-petcenter-text">Bệnh án của {data.pet.petName}</h2>
          <p className="body-md mt-1 max-w-3xl text-petcenter-text-secondary">
            Tổng hợp các lần khám, chẩn đoán, kết quả khám, đơn thuốc, tiêm phòng và lịch tái khám của thú cưng.
          </p>
        </div>

        <button
          onClick={() => router.push("/doctor/medical-records")}
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-control border border-petcenter-primary px-4 py-2 text-sm font-medium text-petcenter-primary transition-colors hover:bg-petcenter-primary hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
      </div>

      <div className="space-y-6">
        <DoctorPetSummaryCard pet={data.pet} />
        <DoctorQuickStatsCard detail={data} />
        <DoctorMedicalRecordTabs detail={data} />
      </div>
    </div>
  );
}
