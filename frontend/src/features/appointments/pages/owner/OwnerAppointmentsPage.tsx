"use client";

import { useEffect, useState } from "react";
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

export function OwnerAppointmentsPage() {
  const [filters, setFilters] = useState<OwnerAppointmentFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const { data, pagination, isLoading, isError, petOptions } = useOwnerAppointments(filters, page);

  useEffect(() => {
    const createdAppointmentId =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("createdAppointmentId");

    if (!createdAppointmentId) {
      return;
    }

    void Promise.resolve().then(() => {
      setFilters({ ...defaultFilters, search: createdAppointmentId });
      setPage(1);
    });
  }, []);

  function handleFiltersChange(nextFilters: OwnerAppointmentFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleResetFilters() {
    setFilters(defaultFilters);
    setPage(1);
  }

  return (
    <div className="flex w-full max-w-[1280px] flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="heading-lg text-petcenter-text tracking-tight">Lịch hẹn của tôi</h1>
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
            Tạo lịch hẹn
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-petcenter-border bg-petcenter-card shadow-card">
        <OwnerAppointmentFilterBar
          filters={filters}
          petOptions={petOptions}
          resultCount={data.length}
          totalCount={pagination.totalItems}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
        />

        <div className="relative">
          {isLoading ? (
            <div className="p-8 body-md text-petcenter-text-secondary">
              Đang tải lịch hẹn...
            </div>
          ) : isError ? (
            <div className="p-8 body-md text-petcenter-danger-text">
              Không thể tải danh sách lịch hẹn.
            </div>
          ) : data.length > 0 ? (
            <>
              <div className="p-4 md:p-5">
                <OwnerAppointmentList appointments={data} />
              </div>
              <OwnerAppointmentPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="p-4 md:p-5">
              <OwnerAppointmentEmptyState onResetFilters={handleResetFilters} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
