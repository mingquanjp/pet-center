"use client"

import { RotateCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import { doctorExaminationTypeOptions } from "../../constants/doctor-examinations.constants"
import { DoctorExaminationFilters } from "../../types/examination.types"

interface Props {
  filters: DoctorExaminationFilters
  onChange: (filters: DoctorExaminationFilters) => void
  onReset: () => void
}

export function DoctorExaminationFilterBar({ filters, onChange, onReset }: Props) {
  return (
    <div className="w-full border-b border-petcenter-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          <input
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
            placeholder="Tìm kiếm mã phiếu, tên thú cưng, SĐT..."
            type="text"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Loại khám:</span>
          <select
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
            value={filters.examType}
            onChange={(event) =>
              onChange({ ...filters, examType: event.target.value as DoctorExaminationFilters["examType"] })
            }
          >
            {doctorExaminationTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <Button
          variant="outline"
          className="gap-2 rounded-[0.75rem] border-petcenter-border px-4 py-2 text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-text"
          onClick={onReset}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  )
}
