import { Activity } from "lucide-react";

import { Card } from "@/components/ui/card";

import { DoctorMedicalRecordDetail } from "../../types/medical-record.types";

interface Props {
  latestClinicalResult: DoctorMedicalRecordDetail["latestClinicalResult"];
}

const clinicalFields = [
  { key: "generalCondition", label: "Trạng thái chung" },
  { key: "skinCoat", label: "Da/Lông" },
  { key: "respiratory", label: "Hô hấp/Tim mạch" },
  { key: "digestive", label: "Tiêu hóa" },
] as const;

export function DoctorLatestClinicalResultCard({ latestClinicalResult }: Props) {
  const vitalItems = [
    { label: "Nhiệt độ", value: latestClinicalResult.temperature },
    { label: "Cân nặng", value: latestClinicalResult.weight },
    { label: "Nhịp tim", value: latestClinicalResult.heartRate },
  ];

  return (
    <Card className="gap-0 rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-petcenter-primary" />
        <h3 className="title-md text-petcenter-text">Kết quả khám gần nhất</h3>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {vitalItems.map((item) => (
          <div key={item.label} className="rounded-control border border-petcenter-border bg-petcenter-filter p-3">
            <p className="label-sm uppercase text-petcenter-text-secondary">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-petcenter-text">{item.value ?? "Chưa cập nhật"}</p>
          </div>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {clinicalFields.map((field) => (
          <div key={field.key} className="rounded-control border border-petcenter-border bg-white p-3">
            <dt className="label-sm uppercase text-petcenter-text-secondary">{field.label}</dt>
            <dd className="body-md mt-1 text-petcenter-text">
              {latestClinicalResult[field.key] ?? "Chưa cập nhật"}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
