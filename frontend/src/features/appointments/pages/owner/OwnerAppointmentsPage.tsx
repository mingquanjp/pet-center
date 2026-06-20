"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOwnerAppointments } from "../../hooks/useOwnerAppointments";
import { OwnerAppointmentFilters } from "../../types/appointment.types";
import { OwnerAppointmentEmptyState } from "../../components/owner/OwnerAppointmentEmptyState";
import { OwnerAppointmentFilterBar } from "../../components/owner/OwnerAppointmentFilterBar";
import { OwnerAppointmentList } from "../../components/owner/OwnerAppointmentList";
import { OwnerAppointmentPagination } from "../../components/owner/OwnerAppointmentPagination";

const defaultFilters: OwnerAppointmentFilters = {
  search: "",
  petId: "ALL",
  status: "ALL",
  date: "",
};

export function OwnerAppointmentsPage({
  initialCreatedAppointmentId = "",
}: {
  initialCreatedAppointmentId?: string;
}) {
  const [filters, setFilters] = useState<OwnerAppointmentFilters>(() => ({
    ...defaultFilters,
    search: initialCreatedAppointmentId.trim(),
  }));
  const [page, setPage] = useState(1);
  const { data, pagination, isLoading, isError, petOptions } = useOwnerAppointments(filters, page);

  function handleFiltersChange(nextFilters: OwnerAppointmentFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleResetFilters() {
    setFilters(defaultFilters);
    setPage(1);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="heading-lg text-petcenter-text tracking-tight">Lịch khám của tôi</h1>
          <p className="body-md mt-1 text-petcenter-text-secondary">
            Theo dõi và quản lý các lịch khám của thú cưng.
          </p>
        </div>

        <Button
          asChild
          className="h-10 shrink-0 rounded-[0.75rem] bg-petcenter-cta px-4 body-md font-semibold text-white shadow-card transition-all hover:bg-petcenter-cta-hover active:scale-95"
        >
          <Link href="/owner/appointments/create">
            <Plus className="size-5" aria-hidden="true" />
            Đặt lịch khám
          </Link>
        </Button>
      </div>

      <OwnerAppointmentFilterBar
        filters={filters}
        petOptions={petOptions}
        resultCount={data.length}
        totalCount={pagination.totalItems}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
      />

      {isLoading ? (
        <div className="rounded-card border border-petcenter-border bg-petcenter-card p-6 body-md text-petcenter-text-secondary shadow-card">
          Đang tải lịch khám...
        </div>
      ) : isError ? (
        <div className="rounded-card border border-petcenter-danger-bg bg-petcenter-danger-bg/30 p-6 body-md text-petcenter-danger-text">
          Không thể tải danh sách lịch khám.
        </div>
      ) : data.length > 0 ? (
        <>
          <OwnerAppointmentList appointments={data} />
          <OwnerAppointmentPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <OwnerAppointmentEmptyState onResetFilters={handleResetFilters} />
      )}
    </div>
  );
}
