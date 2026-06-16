"use client";

import React from "react";
import { useDoctorMedicalRecords } from "../../hooks/useDoctorMedicalRecords";
import { DoctorMedicalRecordsFilterBar } from "../../components/doctor/DoctorMedicalRecordsFilterBar";
import { DoctorMedicalRecordsTable } from "../../components/doctor/DoctorMedicalRecordsTable";
import { DoctorMedicalRecordsPagination } from "../../components/doctor/DoctorMedicalRecordsPagination";

export function DoctorMedicalRecordsPage() {
  const {
    filters,
    items,
    isLoading,
    pagination,
    setKeyword,
    setSpecies,
    setPage,
    resetFilters,
    refetch,
  } = useDoctorMedicalRecords();

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="heading-lg text-petcenter-text">Bệnh án</h2>
          <p className="body-md mt-1 max-w-3xl text-petcenter-text-secondary">
            Tra cứu lịch sử khám, chẩn đoán, kết quả xét nghiệm và ghi chú sức khỏe của thú cưng.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-control border border-petcenter-border-strong bg-white px-4 text-sm font-medium text-petcenter-text shadow-sm hover:bg-petcenter-background active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Làm mới
        </button>
      </div>

      {/* Table Card */}
      <div className="relative flex flex-col overflow-hidden rounded-2xl bg-petcenter-card shadow-card">
        <DoctorMedicalRecordsFilterBar
          filters={filters}
          onKeywordChange={setKeyword}
          onSpeciesChange={setSpecies}
          onReset={resetFilters}
        />

        {/* Table & Pagination */}
        <div className={`transition-all duration-300 ${isLoading && items.length > 0 ? "opacity-70 pointer-events-none blur-[1px]" : "opacity-100 blur-0"}`}>
          <DoctorMedicalRecordsTable items={items} isLoading={isLoading && items.length === 0} />
          {items.length > 0 && (
            <DoctorMedicalRecordsPagination
              total={pagination.total}
              page={pagination.page}
              limit={pagination.limit}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
