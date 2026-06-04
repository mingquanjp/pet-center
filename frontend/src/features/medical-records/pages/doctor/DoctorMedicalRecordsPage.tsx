"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { DoctorMedicalRecordDetailModal } from "../../components/doctor/DoctorMedicalRecordDetailModal";
import { DoctorMedicalRecordFilterBar } from "../../components/doctor/DoctorMedicalRecordFilterBar";
import { DoctorMedicalRecordTable } from "../../components/doctor/DoctorMedicalRecordTable";
import { useDoctorMedicalRecords } from "../../hooks/useDoctorMedicalRecords";
import { DoctorMedicalRecordFilters } from "../../types/medical-record.types";

const defaultFilters: DoctorMedicalRecordFilters = {
  search: "",
  recordType: "ALL",
  alertLevel: "ALL",
};

export function DoctorMedicalRecordsPage() {
  const [filters, setFilters] = useState<DoctorMedicalRecordFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { data, pagination } = useDoctorMedicalRecords(filters, page);

  const handleFilterChange = (nextFilters: DoctorMedicalRecordFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const handleViewDetail = (recordId: string) => {
    setSelectedRecordId(recordId);
    setIsDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedRecordId(null);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-3">
        <nav className="flex items-center gap-2 text-sm text-petcenter-text-secondary" aria-label="Breadcrumb">
          <span>Tổng quan</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-petcenter-text">Bệnh án</span>
        </nav>

        <div>
          <h2 className="heading-lg text-petcenter-text">Bệnh án</h2>
          <p className="body-md mt-1 max-w-3xl text-petcenter-text-secondary">
            Tra cứu lịch sử khám, chẩn đoán, kết quả xét nghiệm và ghi chú sức khỏe của thú cưng.
          </p>
        </div>
      </div>

      <DoctorMedicalRecordFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <DoctorMedicalRecordTable
        records={data}
        pagination={pagination}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        onViewDetail={handleViewDetail}
      />

      <DoctorMedicalRecordDetailModal
        open={isDetailOpen}
        recordId={selectedRecordId}
        onOpenChange={handleDetailOpenChange}
      />
    </div>
  );
}
