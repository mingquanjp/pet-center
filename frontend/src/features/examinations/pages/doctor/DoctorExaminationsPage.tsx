"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"

import {
  DoctorExaminationFilters,
  DoctorExaminationTab,
} from "../../types/examination.types"
import { DoctorExaminationFilterBar } from "../../components/doctor/DoctorExaminationFilterBar"
import { DoctorExaminationStats } from "../../components/doctor/DoctorExaminationStats"
import { DoctorExaminationTable } from "../../components/doctor/DoctorExaminationTable"
import { DoctorExaminationTabs } from "../../components/doctor/DoctorExaminationTabs"
import { doctorExaminationsApi } from "../../api/doctor-examinations.api"
import { useDoctorExaminations } from "../../hooks/useDoctorExaminations"

const defaultFilters: DoctorExaminationFilters = {
  search: "",
  status: "ALL",
  examType: "ALL",
  date: "",
  page: 1,
  limit: 10,
}

export function DoctorExaminationsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<DoctorExaminationFilters>(defaultFilters)
  const { data, stats, tabStats, pagination, isLoading, isInitialLoading, isError, refetch } = useDoctorExaminations(filters)

  const handleTabChange = (status: DoctorExaminationTab) => {
    setFilters((current) => ({ ...current, status, page: 1 }))
  }

  const handleFilterChange = (newFilters: DoctorExaminationFilters) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters((current) => ({ ...current, page }))
  }

  const handleStartExamination = async (appointmentId: string) => {
    await doctorExaminationsApi.startDoctorExamination(appointmentId)
    router.push(`/doctor/examinations/${appointmentId}`)
  }

  return (
    <div className="flex-1 space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="heading-lg text-petcenter-text">Phiếu khám</h2>
            <p className="body-md mt-1 max-w-3xl text-petcenter-text-secondary">
              Quản lý các phiếu khám sắp tới, theo dõi trạng thái và cập nhật kết quả khám cho thú cưng.
            </p>
          </div>

          <Button
            variant="outline"
            className="h-9 rounded-control border-petcenter-border-strong bg-white px-4 text-petcenter-text hover:bg-petcenter-background active:scale-95"
            onClick={() => refetch()}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>

        <DoctorExaminationStats
          total={stats.totalCount}
          waiting={stats.waitingCount}
          examining={stats.examiningCount}
          completed={stats.completedCount}
          followUp={stats.followUpCount}
        />

        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-petcenter-card shadow-card">
          <DoctorExaminationFilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => setFilters(defaultFilters)}
          />
          <DoctorExaminationTabs
            activeTab={filters.status}
            counts={tabStats}
            onChange={handleTabChange}
          />
          {isInitialLoading ? (
            <div className="py-10">
              <LoadingState
                title="Đang tải dữ liệu..."
                description="Vui lòng đợi trong giây lát trong khi hệ thống tải phiếu khám."
              />
            </div>
          ) : isError && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
              <p className="font-medium text-petcenter-text-secondary">Không thể tải danh sách phiếu khám</p>
              <Button
                variant="outline"
                className="rounded-[0.75rem] border-petcenter-border"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <div className={`transition-opacity duration-200 ${isLoading && !isInitialLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              <DoctorExaminationTable
                examinations={data}
                pagination={pagination}
                onPageChange={handlePageChange}
                onStartExamination={handleStartExamination}
              />
            </div>
          )}
        </div>
    </div>
  )
}
