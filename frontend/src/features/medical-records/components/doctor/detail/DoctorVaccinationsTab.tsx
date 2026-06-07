import React from "react";
import { Syringe } from "lucide-react";
import { DoctorVaccinationItem } from "../../../types/medical-record.types";
import { formatDate } from "../../../utils/medical-record-format";

interface Props {
  vaccinations: DoctorVaccinationItem[];
}

export function DoctorVaccinationsTab({ vaccinations }: Props) {
  if (vaccinations.length === 0) {
    return <div className="py-12 text-center text-petcenter-text-secondary">Chưa có lịch sử tiêm phòng.</div>;
  }

  const sorted = [...vaccinations].sort((a, b) => new Date(b.vaccinationDate).getTime() - new Date(a.vaccinationDate).getTime());

  return (
    <div className="mt-4 space-y-4">
      {sorted.map((vaccination) => (
        <div
          key={vaccination.vaccinationId}
          className="flex flex-col gap-4 rounded-xl border border-petcenter-border bg-petcenter-background p-5 md:flex-row md:items-center"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Syringe className="h-5 w-5" />
          </div>
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
            <VaccinationField label="Tên vaccine" value={vaccination.vaccineName} strong />
            <VaccinationField label="Ngày tiêm" value={formatDate(vaccination.vaccinationDate)} />
            <VaccinationField label="Phiếu khám liên quan" value={vaccination.examId || "Không có"} />
            <VaccinationField label="Ghi chú" value={vaccination.note || "Không có ghi chú"} />
          </div>
        </div>
      ))}
    </div>
  );
}

function VaccinationField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-petcenter-text-secondary">{label}</div>
      <div className={strong ? "font-semibold text-petcenter-text" : "text-sm font-medium text-petcenter-text"}>{value}</div>
    </div>
  );
}
