import { Calendar, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { DoctorMedicalRecordDetail } from "../../types/medical-record.types";
import { formatMedicalRecordDate } from "../../utils/medical-record-format";

interface Props {
  latestExam: DoctorMedicalRecordDetail["latestExam"];
}

export function DoctorLatestExamCard({ latestExam }: Props) {
  return (
    <Card className="gap-0 rounded-card border border-petcenter-border bg-petcenter-success-bg/60 p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="title-md text-petcenter-text">Lần khám gần nhất</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-petcenter-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatMedicalRecordDate(latestExam.examinedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" />
              {latestExam.veterinarianName}
            </span>
          </div>
        </div>
        <Badge className="h-7 rounded-pill bg-petcenter-primary px-3 text-white">
          {latestExam.examTypeName}
        </Badge>
      </div>

      <dl className="mt-5 grid gap-4">
        <div>
          <dt className="label-sm uppercase text-petcenter-text-secondary">Mã phiếu</dt>
          <dd className="mt-1 font-semibold text-petcenter-text">{latestExam.examCode}</dd>
        </div>
        <div>
          <dt className="label-sm uppercase text-petcenter-text-secondary">Chẩn đoán</dt>
          <dd className="mt-1 font-semibold text-petcenter-text">{latestExam.diagnosis}</dd>
        </div>
        <div>
          <dt className="label-sm uppercase text-petcenter-text-secondary">Kết luận</dt>
          <dd className="body-md mt-1 text-petcenter-text">{latestExam.conclusion}</dd>
        </div>
        {latestExam.note ? (
          <div>
            <dt className="label-sm uppercase text-petcenter-text-secondary">Ghi chú chuyên môn</dt>
            <dd className="body-md mt-1 text-petcenter-text">{latestExam.note}</dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
