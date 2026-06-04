import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";

import { DoctorMedicalRecordDetail } from "../../types/medical-record.types";

interface Props {
  professionalAlert?: DoctorMedicalRecordDetail["professionalAlert"];
}

export function DoctorMedicalRecordAlertCard({ professionalAlert }: Props) {
  if (!professionalAlert) {
    return (
      <Card className="gap-0 rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-petcenter-success-bg p-2 text-petcenter-success-text">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="label-sm uppercase text-petcenter-text-secondary">Lưu ý chuyên môn</h3>
            <p className="body-md mt-2 text-petcenter-text">Không có lưu ý đặc biệt.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="gap-0 rounded-card border border-petcenter-border bg-petcenter-warning-bg p-5 text-petcenter-warning-text shadow-card">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white/70 p-2">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="label-sm uppercase">{professionalAlert.title}</h3>
          <p className="body-md mt-2">
            <span className="font-semibold">Lưu ý: </span>
            {professionalAlert.description}
          </p>
          {professionalAlert.riskHistory ? (
            <p className="body-md mt-2">
              <span className="font-semibold">Tiền sử bệnh: </span>
              {professionalAlert.riskHistory}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
