import React from "react";
import { Info, Pill } from "lucide-react";
import { DoctorPrescriptionRecord } from "../../../types/medical-record.types";
import { formatDate } from "../../../utils/medical-record-format";

interface Props {
  prescriptions: DoctorPrescriptionRecord[];
}

export function DoctorPrescriptionsTab({ prescriptions }: Props) {
  if (prescriptions.length === 0) {
    return <div className="py-12 text-center text-petcenter-text-secondary">Chưa có đơn thuốc.</div>;
  }

  const sorted = [...prescriptions].sort((a, b) => new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime());

  return (
    <div className="mt-4 space-y-6">
      {sorted.map((prescription) => (
        <div key={prescription.prescriptionId} className="overflow-hidden rounded-xl border border-petcenter-border">
          <div className="flex flex-col justify-between gap-3 border-b border-petcenter-border bg-gray-50 px-5 py-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-petcenter-primary" />
              <div>
                <h4 className="font-semibold text-petcenter-text">Đơn thuốc</h4>
                <p className="text-xs text-petcenter-text-secondary">Liên quan lần khám {prescription.examId}</p>
              </div>
            </div>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-petcenter-text-secondary shadow-sm">
              Kê ngày: {formatDate(prescription.prescribedAt)}
            </span>
          </div>

          {prescription.generalNote && (
            <div className="flex gap-2 border-b border-petcenter-border bg-yellow-50/50 px-5 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <p className="text-sm text-yellow-800">{prescription.generalNote}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-petcenter-border bg-white">
                <tr>
                  <th className="px-5 py-3 font-medium text-petcenter-text-secondary">Tên thuốc</th>
                  <th className="px-5 py-3 font-medium text-petcenter-text-secondary">Số lượng</th>
                  <th className="px-5 py-3 font-medium text-petcenter-text-secondary">Liều dùng</th>
                  <th className="px-5 py-3 font-medium text-petcenter-text-secondary">Tần suất</th>
                  <th className="px-5 py-3 font-medium text-petcenter-text-secondary">Thời gian</th>
                  <th className="w-1/4 px-5 py-3 font-medium text-petcenter-text-secondary">Cách dùng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prescription.items.map((item) => (
                  <tr key={item.prescriptionItemId} className="bg-white hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-petcenter-text">{item.medicineName}</td>
                    <td className="px-5 py-3 text-petcenter-text">{item.quantity || "-"}</td>
                    <td className="px-5 py-3 text-petcenter-text">{item.dosage}</td>
                    <td className="px-5 py-3 text-petcenter-text">{item.frequency}</td>
                    <td className="px-5 py-3 text-petcenter-text">{item.duration}</td>
                    <td className="px-5 py-3 text-sm text-petcenter-text">
                      <div className="flex flex-col gap-1">
                        {item.usageInstruction && <span>{item.usageInstruction}</span>}
                        {item.note && <span className="text-xs italic text-petcenter-text-secondary">Lưu ý: {item.note}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
