"use client";

import { RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  doctorMedicalRecordAlertFilterOptions,
  doctorMedicalRecordTypeFilterOptions,
} from "../../constants/medical-record.constants";
import { DoctorMedicalRecordFilters } from "../../types/medical-record.types";

interface Props {
  filters: DoctorMedicalRecordFilters;
  onChange: (filters: DoctorMedicalRecordFilters) => void;
  onReset: () => void;
}

export function DoctorMedicalRecordFilterBar({ filters, onChange, onReset }: Props) {
  return (
    <div className="rounded-card border border-petcenter-border bg-petcenter-card p-4 shadow-card">
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_220px_220px_auto] lg:items-end">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="label-sm uppercase text-petcenter-text-secondary">Tìm kiếm hồ sơ</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
            <Input
              className="h-11 rounded-control border-petcenter-border-strong bg-petcenter-filter pl-10 text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
              placeholder="Tên thú cưng, mã hồ sơ, chủ nuôi..."
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
            />
          </div>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="label-sm uppercase text-petcenter-text-secondary">Loại</span>
          <Select
            value={filters.recordType}
            onValueChange={(value) =>
              onChange({ ...filters, recordType: value as DoctorMedicalRecordFilters["recordType"] })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-control border-petcenter-border-strong bg-petcenter-filter px-3 text-petcenter-text focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-control border-petcenter-border-strong bg-white shadow-modal">
              {doctorMedicalRecordTypeFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="label-sm uppercase text-petcenter-text-secondary">Cảnh báo</span>
          <Select
            value={filters.alertLevel}
            onValueChange={(value) =>
              onChange({ ...filters, alertLevel: value as DoctorMedicalRecordFilters["alertLevel"] })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-control border-petcenter-border-strong bg-petcenter-filter px-3 text-petcenter-text focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-control border-petcenter-border-strong bg-white shadow-modal">
              {doctorMedicalRecordAlertFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <Button
          variant="outline"
          className="h-11 rounded-control border-petcenter-border-strong bg-white px-4 text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-text"
          onClick={onReset}
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
