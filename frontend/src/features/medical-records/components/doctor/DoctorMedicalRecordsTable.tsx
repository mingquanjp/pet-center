import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DoctorMedicalRecordListItem } from "../../types/medical-record.types";
import { DoctorMedicalRecordPetCell } from "./DoctorMedicalRecordPetCell";
import { SearchX, PawPrint } from "lucide-react";
import { Dog3DScene } from "@/components/ui/dog-3d";

interface Props {
  items: DoctorMedicalRecordListItem[];
  isLoading: boolean;
}

export function DoctorMedicalRecordsTable({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
        <div className="translate-y-4">
          <Dog3DScene />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
        <div className="relative w-20 h-20 rounded-full bg-petcenter-info-bg flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10 text-petcenter-primary" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-petcenter-card rounded-full flex items-center justify-center shadow-sm border border-petcenter-border">
            <PawPrint className="w-4 h-4 text-petcenter-text-muted" />
          </div>
        </div>
        <h3 className="heading-sm text-petcenter-text mb-2">Không tìm thấy hồ sơ bệnh án phù hợp</h3>
        <p className="body-md text-petcenter-text-secondary mb-6">
          Hãy thử thay đổi điều kiện tìm kiếm hoặc đặt lại bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="border-b border-petcenter-border bg-petcenter-background">
            <tr>
              <th className="w-[24%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Thú cưng</th>
              <th className="w-[22%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Chủ nuôi</th>
              <th className="w-[18%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Lần khám gần nhất</th>
              <th className="w-[26%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Chẩn đoán gần nhất</th>
              <th className="w-[10%] px-6 py-4 text-center text-sm font-medium text-petcenter-text-secondary">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-petcenter-border bg-white">
            {items.map((item) => (
              <tr
                key={item.petId}
                className="transition-colors hover:bg-petcenter-background/60"
              >
                <td className="px-6 py-4">
                  <DoctorMedicalRecordPetCell pet={item} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-petcenter-text truncate">
                      {item.ownerName}
                    </span>
                    {item.ownerPhone && (
                      <span className="body-sm text-petcenter-text-secondary truncate mt-0.5">
                        {item.ownerPhone}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-petcenter-text">
                      {format(new Date(item.latestExamDate), "dd/MM/yyyy", { locale: vi })}
                    </span>
                    <span className="body-sm text-petcenter-text-secondary truncate mt-0.5">
                      {item.examTypeName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-petcenter-text line-clamp-2" title={item.latestDiagnosis}>
                    {item.latestDiagnosis}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/doctor/medical-records/${item.petId}`}>
                    <button
                      type="button"
                      className="h-9 whitespace-nowrap rounded-control bg-petcenter-cta px-4 font-semibold text-white shadow-sm transition-all hover:bg-petcenter-cta-hover active:scale-95 active:bg-petcenter-cta-active"
                    >
                      Xem
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
