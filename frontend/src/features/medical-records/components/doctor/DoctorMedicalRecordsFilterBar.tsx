import React from "react";
import { Search, RotateCcw } from "lucide-react";
import {
  DoctorMedicalRecordFilters,
} from "../../types/medical-record.types";

interface Props {
  filters: DoctorMedicalRecordFilters;
  onKeywordChange: (keyword: string) => void;
  onSpeciesChange: (species: DoctorMedicalRecordFilters["species"]) => void;
  onReset: () => void;
}

export function DoctorMedicalRecordsFilterBar({
  filters,
  onKeywordChange,
  onSpeciesChange,
  onReset,
}: Props) {
  const speciesOptions = [
    { value: "ALL", label: "Tất cả loài" },
    { value: "Dog", label: "Chó" },
    { value: "Cat", label: "Mèo" },
    { value: "Other", label: "Khác" },
  ];

  return (
    <div className="w-full border-b border-petcenter-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tên thú cưng, mã hồ sơ, chủ nuôi..."
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Loài:</span>
          <select
            value={filters.species}
            onChange={(e) => onSpeciesChange(e.target.value as DoctorMedicalRecordFilters["species"])}
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
          >
            {speciesOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>



        <button
          onClick={onReset}
          type="button"
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[0.75rem] border border-petcenter-border bg-transparent px-4 py-2 text-sm font-medium text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-text transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Đặt lại</span>
        </button>
      </div>
    </div>
  );
}
