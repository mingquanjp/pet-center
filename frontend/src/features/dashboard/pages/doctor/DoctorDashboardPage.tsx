"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { AssignedExamTable } from "../../components/doctor/AssignedExamTable";
import { DoctorDashboardHeader } from "../../components/doctor/DoctorDashboardHeader";
import { DoctorDashboardStats } from "../../components/doctor/DoctorDashboardStats";
import { DoctorRecentActivities } from "../../components/doctor/DoctorRecentActivities";
import { useDoctorDashboard } from "../../hooks/useDoctorDashboard";

export function DoctorDashboardPage() {
  const { data, isError, isLoading, refetch } = useDoctorDashboard();

  if (isLoading) {
    return <DoctorDashboardSkeleton />;
  }

  if (isError) {
    return <DoctorDashboardError onRetry={refetch} />;
  }

  if (!data) {
    return <DoctorDashboardError onRetry={refetch} />;
  }

  return (
    <div className="flex-1 space-y-6">
      <DoctorDashboardHeader doctor={data.doctor} />
      <DoctorDashboardStats stats={data.stats} />

      <section className="flex flex-col gap-gutter">
        <AssignedExamTable exams={data.assignedExams} />
        <DoctorRecentActivities activities={data.recentActivities} />
      </section>
    </div>
  );
}

function DoctorDashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mx-auto flex min-h-[420px] w-full max-w-3xl flex-col items-center justify-center rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg/40 px-6 py-12 text-center">
      <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
      <h1 className="heading-sm mt-4 text-petcenter-danger-text">
        Không thể tải dữ liệu tổng quan.
      </h1>
      <Button
        className="mt-6 h-10 rounded-control bg-petcenter-primary px-4 font-semibold text-white hover:bg-petcenter-primary-hover"
        onClick={onRetry}
        type="button"
      >
        <RefreshCw className="h-4 w-4" />
        Thử lại
      </Button>
    </section>
  );
}

function DoctorDashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6">
      <section className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-pill bg-petcenter-sidebar" />
        <Skeleton className="h-10 w-80 max-w-full rounded bg-petcenter-sidebar" />
        <Skeleton className="h-5 w-[520px] max-w-full rounded bg-petcenter-sidebar" />
      </section>
      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            className="h-32 rounded-card border border-petcenter-border bg-petcenter-card shadow-card"
            key={index}
          />
        ))}
      </section>
      <section className="flex flex-col gap-gutter">
        <Skeleton className="h-[520px] rounded-card bg-petcenter-card shadow-card" />
        <Skeleton className="h-[520px] rounded-card bg-petcenter-card shadow-card" />
      </section>
    </div>
  );
}
