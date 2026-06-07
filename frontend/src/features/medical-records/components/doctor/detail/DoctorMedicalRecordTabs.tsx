import React from "react";
import { DoctorMedicalRecordDetail } from "../../../types/medical-record.types";
import { DoctorExamHistoryTab } from "./DoctorExamHistoryTab";

interface Props {
  detail: DoctorMedicalRecordDetail;
}

export function DoctorMedicalRecordTabs({ detail }: Props) {
  return (
    <section className="rounded-2xl bg-petcenter-card p-6 shadow-card">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-petcenter-text">Lịch sử khám</h3>
        <p className="mt-1 text-sm text-petcenter-text-secondary">
          Mỗi lần khám có thể mở sang chi tiết phiếu khám để xem kết quả, đơn thuốc, tiêm phòng và tái khám liên quan.
        </p>
      </div>
      <DoctorExamHistoryTab exams={detail.exams} petId={detail.pet.petId} />
    </section>
  );
}
