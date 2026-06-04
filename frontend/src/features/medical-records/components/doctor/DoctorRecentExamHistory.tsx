import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { DoctorMedicalRecordDetail } from "../../types/medical-record.types";
import { formatMedicalRecordDate } from "../../utils/medical-record-format";

interface Props {
  history: DoctorMedicalRecordDetail["recentExamHistory"];
}

export function DoctorRecentExamHistory({ history }: Props) {
  return (
    <Card className="gap-0 rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
      <h3 className="title-md text-petcenter-text">Lịch sử khám gần đây</h3>
      <div className="mt-5 space-y-4">
        {history.map((exam) => (
          <div key={exam.id} className="grid grid-cols-[auto_1fr_auto] gap-3">
            <div className="mt-1 flex flex-col items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-petcenter-primary" />
              <span className="mt-1 h-full w-px bg-petcenter-border" />
            </div>
            <div className="min-w-0 pb-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-petcenter-text-secondary">
                <Calendar className="h-4 w-4" />
                <span>{formatMedicalRecordDate(exam.examinedAt)}</span>
                <span>•</span>
                <span className="font-semibold text-petcenter-primary">{exam.examCode}</span>
              </div>
              <p className="mt-1 font-semibold text-petcenter-text">{exam.examTypeName}</p>
              <p className="body-sm mt-1 text-petcenter-text-secondary">{exam.diagnosis}</p>
            </div>
            <Button
              variant="ghost"
              className="h-8 rounded-control px-3 text-petcenter-primary hover:bg-petcenter-background"
              onClick={() => console.log("View exam history", exam.id)}
              type="button"
            >
              Xem
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
