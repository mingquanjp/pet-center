import React from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, ClipboardList, Stethoscope, User } from "lucide-react";
import { DoctorMedicalExamHistoryItem } from "../../../types/medical-record.types";
import { formatDateTime, formatExamStatus } from "../../../utils/medical-record-format";

interface Props {
  exams: DoctorMedicalExamHistoryItem[];
  petId: string;
}

export function DoctorExamHistoryTab({ exams, petId }: Props) {
  if (exams.length === 0) {
    return <div className="py-12 text-center text-petcenter-text-secondary">Chưa có lịch sử khám.</div>;
  }

  const sorted = [...exams].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

  return (
    <div className="space-y-4">
      {sorted.map((exam) => (
        <ExamCard key={exam.examId} exam={exam} petId={petId} />
      ))}
    </div>
  );
}

function ExamCard({ exam, petId }: { exam: DoctorMedicalExamHistoryItem; petId: string }) {
  const returnTo = `/doctor/medical-records/${encodeURIComponent(petId)}`;

  return (
    <div className="overflow-hidden rounded-xl border border-petcenter-border bg-petcenter-background transition-colors hover:border-petcenter-border-strong">
      <div className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-start">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-petcenter-primary/10 text-petcenter-primary md:mt-0">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-semibold text-petcenter-text">{exam.examTypeName || "Khám bệnh"}</h4>
              <span className="inline-flex items-center rounded-full bg-petcenter-primary/10 px-2.5 py-0.5 text-xs font-medium text-petcenter-primary">
                {formatExamStatus(exam.examStatus)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-petcenter-text-secondary">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDateTime(exam.examDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {exam.veterinarianName}
              </span>
              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4" />
                Phiếu {exam.appointmentId}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/doctor/examinations/${exam.appointmentId}?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control bg-petcenter-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-petcenter-primary/90"
        >
          Xem chi tiết phiếu khám
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-petcenter-border bg-white px-5 py-4 md:grid-cols-2">
        <InfoBlock label="Triệu chứng ghi nhận ban đầu" value={exam.symptomDescription} />
        <InfoBlock label="Chẩn đoán chính" value={exam.diagnosis} />
        <InfoBlock label="Kết luận của bác sĩ" value={exam.conclusion} />
        <InfoBlock label="Ghi chú chuyên môn" value={exam.healthNote} />
      </div>
    </div>
  );
}

function InfoBlock({ label, value, strong = false }: { label: string; value: string | null; strong?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-petcenter-text-secondary">{label}</div>
      <div className={strong ? "font-semibold text-petcenter-text" : "text-sm text-petcenter-text"}>
        {value || "Chưa ghi nhận"}
      </div>
    </div>
  );
}
