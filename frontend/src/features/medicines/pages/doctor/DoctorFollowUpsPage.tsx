"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  RotateCcw,
  Search,
  UserRound,
  X,
} from "lucide-react"

import { AppPagination } from "@/components/ui/app-pagination"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { doctorFollowUpsApi } from "../../api/doctor-follow-ups.api"
import { useDoctorFollowUps } from "../../hooks/useDoctorFollowUps"
import type {
  DoctorFollowUpDetail,
  DoctorFollowUpFilters,
  DoctorFollowUpListItem,
  DoctorFollowUpStatus,
  DoctorFollowUpStatusFilter,
} from "../../types/follow-up.types"

const pageSize = 3

const defaultFilters: DoctorFollowUpFilters = {
  search: "",
  status: "all",
  date: "",
  page: 1,
  limit: pageSize,
}

const statusStyles: Record<
  DoctorFollowUpStatus,
  {
    dateClassName: string
    icon: typeof CalendarDays
    label: string
    pillClassName: string
  }
> = {
  upcoming: {
    dateClassName: "text-[#3e4946]",
    icon: CalendarDays,
    label: "Sắp đến",
    pillClassName: "bg-[#fff3d8] text-[#b45309]",
  },
  overdue: {
    dateClassName: "text-[#ba1a1a]",
    icon: AlertTriangle,
    label: "Quá hạn",
    pillClassName: "bg-[#fde2e2] text-[#b91c1c]",
  },
  completed: {
    dateClassName: "text-[#3e4946]",
    icon: CalendarCheck,
    label: "Đã hoàn tất",
    pillClassName: "bg-[#dff3e3] text-[#2e7d32]",
  },
}

const statusFilterOptions: { label: string; value: DoctorFollowUpStatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Sắp đến", value: "upcoming" },
  { label: "Quá hạn", value: "overdue" },
  { label: "Đã hoàn tất", value: "completed" },
]

export function DoctorFollowUpsPage() {
  const [filters, setFilters] = useState<DoctorFollowUpFilters>(defaultFilters)
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null)
  const [selectedFollowUpPreview, setSelectedFollowUpPreview] = useState<DoctorFollowUpListItem | null>(null)
  const [selectedFollowUp, setSelectedFollowUp] = useState<DoctorFollowUpDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isDetailError, setIsDetailError] = useState(false)
  const { data, stats, pagination, isLoading, isInitialLoading, isError, refetch } = useDoctorFollowUps(filters)

  useEffect(() => {
    if (!selectedFollowUpId) return

    let ignore = false

    async function fetchDetail() {
      try {
        setIsDetailLoading(true)
        setIsDetailError(false)
        const detail = await doctorFollowUpsApi.getDoctorFollowUpDetail(selectedFollowUpId as string)
        if (!ignore) setSelectedFollowUp(detail)
      } catch (error) {
        console.error("Failed to fetch follow-up detail:", error)
        if (!ignore) setIsDetailError(true)
      } finally {
        if (!ignore) setIsDetailLoading(false)
      }
    }

    void fetchDetail()

    return () => {
      ignore = true
    }
  }, [selectedFollowUpId])

  const totalPages = Math.max(1, pagination.totalPages)
  const safePage = Math.min(filters.page, totalPages)
  const startItem = pagination.total === 0 ? 0 : (safePage - 1) * pagination.limit + 1
  const endItem = Math.min(safePage * pagination.limit, pagination.total)

  const statCards = [
    {
      icon: CalendarClock,
      iconClassName: "bg-[rgba(254,166,25,0.3)] text-[#b45309]",
      label: "Sắp đến",
      value: formatCount(stats.upcomingCount),
    },
    {
      icon: AlertTriangle,
      iconClassName: "bg-[rgba(255,218,214,0.5)] text-[#ba1a1a]",
      label: "Quá hạn",
      value: formatCount(stats.overdueCount),
    },
    {
      icon: CheckCircle2,
      iconClassName: "bg-[rgba(80,115,87,0.4)] text-[#507357]",
      label: "Đã hoàn tất",
      value: formatCount(stats.completedCount),
    },
  ]

  const handleSearchChange = (value: string) => {
    setFilters((current) => ({ ...current, search: value, page: 1 }))
  }

  const handleStatusFilterChange = (value: DoctorFollowUpStatusFilter) => {
    setFilters((current) => ({ ...current, status: value, page: 1 }))
  }

  const handleDateChange = (value: string) => {
    setFilters((current) => ({ ...current, date: value, page: 1 }))
  }

  const handleResetFilters = () => {
    setFilters(defaultFilters)
  }

  const handleViewFollowUp = (followUp: DoctorFollowUpListItem) => {
    setSelectedFollowUpId(followUp.followUpId)
    setSelectedFollowUpPreview(followUp)
    setSelectedFollowUp(null)
    setIsDetailError(false)
  }

  const closeDetailDialog = () => {
    setSelectedFollowUpId(null)
    setSelectedFollowUpPreview(null)
    setSelectedFollowUp(null)
    setIsDetailError(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[30px] font-bold leading-9 tracking-[0] text-[#1b1c15]">
              Tái khám
            </h1>
            <p className="mt-1 max-w-[672px] text-sm leading-5 text-[#3e4946]">
              Theo dõi các ca cần tái khám, nhắc lịch và cập nhật ghi chú chuyên môn.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Thống kê tái khám" className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon

          return (
            <article
              className="flex h-[110px] items-center gap-5 rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0_4px_8px_rgba(31,38,31,0.05)]"
              key={stat.label}
            >
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-full",
                  stat.iconClassName
                )}
              >
                <Icon aria-hidden="true" className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-5 text-[#3e4946]">{stat.label}</p>
                <p className="mt-1 text-[30px] font-bold leading-9 text-[#1b1c15]">{stat.value}</p>
              </div>
            </article>
          )
        })}
      </section>

      <section className="rounded-[16px] border border-[#e4e3d7] bg-[#fbfaee] p-4 shadow-[0_4px_8px_rgba(31,38,31,0.05)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7a76]" />
            <input
              value={filters.search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Tìm theo ID, tên thú cưng..."
              type="search"
              className="h-11 w-full rounded-full border border-[rgba(189,201,197,0.4)] bg-white pl-11 pr-4 text-sm text-[#1b1c15] outline-none transition placeholder:text-[#6b7280] focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex items-center gap-2">
              <span className="whitespace-nowrap text-sm font-medium text-[#3e4946]">
                Trạng thái:
              </span>
              <Select value={filters.status} onValueChange={handleStatusFilterChange}>
                <SelectTrigger
                  aria-label="Lọc theo trạng thái tái khám"
                  className="h-10 min-w-[150px] rounded-full border-[rgba(189,201,197,0.6)] bg-white px-4 text-sm text-[#1b1c15] shadow-none focus:ring-4 focus:ring-[#005e53]/10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#bdc9c5] bg-white p-1 text-[#1b1c15]">
                  {statusFilterOptions.map((option) => (
                    <SelectItem
                      className="rounded-lg px-3 py-2 text-sm focus:bg-[#d8f3ee] focus:text-[#005e53]"
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="flex items-center gap-2">
              <span className="whitespace-nowrap text-sm font-medium text-[#3e4946]">Ngày:</span>
              <input
                value={filters.date}
                onChange={(event) => handleDateChange(event.target.value)}
                type="date"
                aria-label="Ngày tái khám"
                className="h-10 rounded-full border border-[rgba(189,201,197,0.4)] bg-white px-3 text-sm text-[#1b1c15] outline-none transition focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
              />
            </label>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-[#bdc9c5] bg-white px-4 font-medium text-[#3e4946] hover:bg-[#e9e9dd] xl:ml-auto"
            onClick={handleResetFilters}
          >
            <RotateCcw aria-hidden="true" className="mr-2 size-4" />
            Đặt lại
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[16px] border border-[#e4e3d7] bg-white shadow-[0_4px_16px_rgba(31,38,31,0.05)]">
        {isInitialLoading ? (
          <LoadingState
            className="py-16"
            title="Đang tải lịch tái khám..."
            description="Dữ liệu tái khám đang được lấy từ hệ thống."
          />
        ) : isError && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <AlertCircle className="size-12 text-[#ba1a1a]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#1b1c15]">Không thể tải danh sách tái khám</p>
              <p className="mt-1 text-sm text-[#52605c]">Vui lòng kiểm tra lại kết nối hoặc quyền truy cập.</p>
            </div>
            <Button
              className="rounded-[12px] border-[#bdc9c5]"
              onClick={() => refetch()}
              type="button"
              variant="outline"
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <div className={cn("transition-opacity duration-200", isLoading ? "pointer-events-none opacity-50" : "opacity-100")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] table-fixed border-collapse text-left">
                <thead className="border-b border-petcenter-border bg-petcenter-background">
                  <tr>
                    <TableHeaderCell className="w-[210px]">Thú cưng</TableHeaderCell>
                    <TableHeaderCell className="w-[160px]">Chủ nuôi</TableHeaderCell>
                    <TableHeaderCell className="w-[180px]">Phiếu khám</TableHeaderCell>
                    <TableHeaderCell className="w-[150px]">Ngày hẹn</TableHeaderCell>
                    <TableHeaderCell className="min-w-[240px]">Lý do tái khám</TableHeaderCell>
                    <TableHeaderCell className="w-[170px]">Trạng thái</TableHeaderCell>
                    <TableHeaderCell className="w-[130px] text-right">Thao tác</TableHeaderCell>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petcenter-border bg-white">
                  {data.map((followUp) => (
                    <FollowUpTableRow
                      followUp={followUp}
                      key={followUp.followUpId}
                      onView={() => handleViewFollowUp(followUp)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {data.length === 0 ? (
              <div className="border-t border-[#e4e3d7] bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#1b1c15]">Không tìm thấy lịch tái khám phù hợp</p>
                <p className="mt-1 text-sm text-[#52605c]">Thử đổi từ khóa hoặc kiểm tra lại bộ lọc.</p>
              </div>
            ) : null}

            <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row">
              <p className="text-sm text-petcenter-text-secondary">
                Hiển thị{" "}
                <span className="font-medium text-petcenter-text">{startItem}</span>
                -
                <span className="font-medium text-petcenter-text">{endItem}</span>{" "}
                của <span className="font-medium text-petcenter-text">{pagination.total || 0}</span> lịch tái khám
              </p>
              <AppPagination
                ariaLabel="Phân trang danh sách tái khám"
                currentPage={safePage}
                onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                size="sm"
                totalPages={totalPages}
              />
            </div>
          </div>
        )}
      </section>

      <FollowUpDetailDialog
        followUp={selectedFollowUp ?? selectedFollowUpPreview}
        isError={isDetailError}
        isLoading={isDetailLoading}
        onOpenChange={(open) => {
          if (!open) closeDetailDialog()
        }}
      />
    </div>
  )
}

function FollowUpTableRow({ followUp, onView }: { followUp: DoctorFollowUpListItem; onView: () => void }) {
  const status = statusStyles[followUp.status]
  const DateIcon = status.icon

  return (
    <tr className="transition-colors hover:bg-petcenter-background/60">
      <TableBodyCell>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              getPetAvatarClassName(followUp.pet.species)
            )}
            aria-hidden="true"
          >
            {followUp.pet.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-[#1b1c15]">{followUp.pet.name}</p>
            <p className="truncate text-xs leading-4 text-[#6e7a76]">
              {followUp.pet.speciesLabel} • {followUp.pet.breed ?? "Chưa cập nhật"}
            </p>
          </div>
        </div>
      </TableBodyCell>
      <TableBodyCell>{followUp.owner.fullName}</TableBodyCell>
      <TableBodyCell>
        <span className="font-medium text-[#005e53]">{followUp.examinationCode}</span>
      </TableBodyCell>
      <TableBodyCell>
        <span className={cn("inline-flex items-center gap-1.5 font-medium", status.dateClassName)}>
          <DateIcon aria-hidden="true" className="size-4" />
          {formatDate(followUp.followUpDate)}
        </span>
      </TableBodyCell>
      <TableBodyCell>
        <span className="line-clamp-2">{followUp.reason ?? "Chưa cập nhật"}</span>
      </TableBodyCell>
      <TableBodyCell>
        <span
          className={cn(
            "inline-flex min-w-[88px] justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium leading-4",
            status.pillClassName
          )}
        >
          {status.label}
        </span>
      </TableBodyCell>
      <TableBodyCell className="text-right">
        <button
          aria-label={`Xem lịch tái khám ${followUp.followUpCode}`}
          className="inline-flex size-8 items-center justify-center rounded-[12px] text-[#005e53] transition hover:bg-[#d8f3ee]"
          onClick={onView}
          type="button"
        >
          <Eye aria-hidden="true" className="size-[18px]" />
        </button>
      </TableBodyCell>
    </tr>
  )
}

function FollowUpDetailDialog({
  followUp,
  isError,
  isLoading,
  onOpenChange,
}: {
  followUp: DoctorFollowUpDetail | DoctorFollowUpListItem | null
  isError: boolean
  isLoading: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!followUp) {
    return null
  }

  const status = statusStyles[followUp.status]
  const statusSummary = getStatusSummary(followUp)
  const detail = isFollowUpDetail(followUp) ? followUp : null

  return (
    <Dialog open={Boolean(followUp)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[900px] flex-col gap-0 overflow-hidden rounded-[16px] border border-[#bdc9c5] bg-white p-0 text-[#1b1c15] shadow-[0_24px_64px_rgba(31,38,31,0.25)] ring-0 sm:max-w-[900px]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#bdc9c5] px-6 py-4">
          <div className="min-w-0">
            <DialogTitle className="text-xl font-bold leading-7 text-[#1b1c15]">
              Chi tiết tái khám
            </DialogTitle>
            <p className="mt-1 text-sm leading-5 text-[#3e4946]">
              {followUp.pet.name} • {followUp.examinationCode}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span
              className={cn(
                "inline-flex min-w-[88px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold leading-4",
                status.pillClassName
              )}
            >
              <span className="size-2 rounded-full bg-current" aria-hidden="true" />
              {status.label}
            </span>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Đóng chi tiết tái khám"
                className="inline-flex size-8 items-center justify-center rounded-full text-[#3e4946] transition hover:bg-[#f5f4e8] hover:text-[#1b1c15]"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </DialogClose>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading && !detail ? (
            <LoadingState
              className="py-12"
              title="Đang tải chi tiết tái khám..."
              description="Hệ thống đang lấy thông tin chi tiết."
            />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <AlertCircle className="size-10 text-[#ba1a1a]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#1b1c15]">Không thể tải chi tiết tái khám</p>
                <p className="mt-1 text-sm text-[#52605c]">Vui lòng đóng modal và thử lại.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
              <aside className="flex flex-col gap-4">
                <DetailPanel title="THÔNG TIN THÚ CƯNG">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold",
                        getPetAvatarClassName(followUp.pet.species)
                      )}
                      aria-hidden="true"
                    >
                      {followUp.pet.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold leading-6 text-[#1b1c15]">
                        {followUp.pet.name}
                      </p>
                      <p className="text-sm leading-5 text-[#6e7a76]">
                        {[
                          followUp.pet.speciesLabel,
                          followUp.pet.breed,
                          followUp.pet.ageLabel,
                          followUp.pet.genderLabel,
                        ].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </div>
                </DetailPanel>

                <DetailPanel title="CHỦ NUÔI">
                  <div className="space-y-3 text-sm leading-5 text-[#3e4946]">
                    <ContactLine icon={UserRound}>{followUp.owner.fullName}</ContactLine>
                    <ContactLine icon={Phone}>{followUp.owner.phoneNumber ?? "Chưa cập nhật"}</ContactLine>
                    <ContactLine icon={Mail}>{followUp.owner.email ?? "Chưa cập nhật"}</ContactLine>
                  </div>
                </DetailPanel>

                <DetailPanel title="TRẠNG THÁI TÁI KHÁM">
                  <div className="space-y-3 text-sm leading-5 text-[#3e4946]">
                    <InfoRow label="Ngày hẹn" value={formatDate(followUp.followUpDate)} />
                    <InfoRow label={statusSummary.label} value={statusSummary.value} valueClassName={statusSummary.className} />
                  </div>
                </DetailPanel>
              </aside>

              <section className="min-w-0 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailBlock label="LÝ DO TÁI KHÁM" value={followUp.reason ?? "Chưa cập nhật"} />
                  <DetailBlock
                    label="NGƯỜI CHỈ ĐỊNH"
                    value={`${followUp.doctor.fullName} (${formatDate(followUp.exam.examDate)})`}
                  />
                </div>

                <section className="rounded-[12px] border border-[#00796b] bg-[#eef7f5] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold leading-4 tracking-[0.12em] text-[#005e53]">
                        PHIẾU KHÁM LIÊN QUAN
                      </p>
                      <p className="mt-2 text-base font-bold leading-6 text-[#1b1c15]">
                        {followUp.examinationCode}
                      </p>
                      <p className="text-sm leading-5 text-[#3e4946]">
                        Ngày khám: {formatDate(followUp.exam.examDate)}
                      </p>
                    </div>
                    <Link
                      href={`/doctor/examinations/${followUp.appointmentId}?returnTo=${encodeURIComponent("/doctor/follow-ups")}`}
                      className="self-start rounded-full border border-[#005e53] px-4 py-2 text-sm font-medium text-[#005e53] transition hover:bg-[#005e53] hover:text-white"
                    >
                      Xem phiếu khám
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-[#bdc9c5] pt-4 text-sm leading-5 text-[#3e4946] md:grid-cols-2">
                    <InfoRow label="Chẩn đoán" value={followUp.exam.diagnosis ?? "Chưa cập nhật"} />
                    <InfoRow label="Đơn thuốc" value={`${followUp.exam.medicineCount} loại thuốc`} />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold leading-4 tracking-[0.12em] text-[#1b1c15]">
                    CHẨN ĐOÁN TRƯỚC ĐÓ
                  </h3>
                  <div className="mt-3 space-y-3 rounded-[12px] bg-[#f5f4e8] p-4 text-sm leading-5 text-[#3e4946]">
                    <InfoRow label="Chẩn đoán chính" value={followUp.exam.diagnosis ?? "Chưa cập nhật"} />
                    <InfoRow label="Kết luận" value={followUp.exam.conclusion ?? "Chưa cập nhật"} />
                    <InfoRow label="Theo dõi" value={followUp.ownerNote ?? followUp.reason ?? "Chưa cập nhật"} />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold leading-4 tracking-[0.12em] text-[#1b1c15]">
                    GHI CHÚ CHUYÊN MÔN
                  </h3>
                  <p className="mt-3 rounded-[12px] border border-[#e4e3d7] bg-[#fbfaee] px-4 py-3 text-sm leading-5 text-[#3e4946]">
                    {detail?.exam.healthNote ?? detail?.exam.prescription?.generalNote ?? "Chưa có ghi chú chuyên môn."}
                  </p>
                </section>

                <section>
                  <h3 className="text-xs font-bold leading-4 tracking-[0.12em] text-[#1b1c15]">
                    LỊCH SỬ NHẮC TÁI KHÁM
                  </h3>
                  <div className="mt-3 space-y-3">
                    {(detail?.reminderHistory ?? []).map((entry) => (
                      <TimelineEntry
                        key={`${entry.title}-${entry.time}`}
                        title={entry.title}
                        time={formatDateTime(entry.time)}
                        description={entry.description}
                      />
                    ))}
                  </div>
                </section>
              </section>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col gap-4 border-t border-[#bdc9c5] px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-[390px] text-xs leading-4 text-[#3e4946]">
            Bác sĩ chỉ theo dõi thông tin tái khám tại màn hình này. Vui lòng tạo phiếu khám mới khi tiến hành khám thực tế.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-[8px] border-[#6e7a76] bg-white px-6 text-sm font-medium text-[#1b1c15] hover:bg-[#f5f4e8]"
              >
                Đóng
              </Button>
            </DialogClose>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  )
}

function DetailPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-[12px] border border-[#e4e3d7] bg-white p-4 shadow-[0_2px_8px_rgba(31,38,31,0.04)]">
      <h3 className="border-b border-[#e4e3d7] pb-3 text-xs font-bold leading-4 tracking-[0.12em] text-[#1b1c15]">
        {title}
      </h3>
      <div className="pt-4">{children}</div>
    </section>
  )
}

function ContactLine({
  children,
  icon: Icon,
}: {
  children: React.ReactNode
  icon: typeof UserRound
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-[#6e7a76]" />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold leading-4 tracking-[0.12em] text-[#1b1c15]">{label}</p>
      <p className="mt-2 text-sm leading-5 text-[#3e4946]">{value}</p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#6e7a76]">{label}</span>
      <span className={cn("text-right font-medium text-[#1b1c15]", valueClassName)}>{value}</span>
    </div>
  )
}

function TimelineEntry({
  description,
  time,
  title,
}: {
  description: string
  time: string
  title: string
}) {
  return (
    <article className="relative pl-8">
      <span className="absolute left-[7px] top-7 h-[calc(100%-1.25rem)] w-px bg-[#bdc9c5]" aria-hidden="true" />
      <span className="absolute left-0 top-1 flex size-4 items-center justify-center rounded-full bg-[#005e53]" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-white" />
      </span>
      <div className="rounded-[12px] border border-[#e4e3d7] bg-white p-3">
        <p className="text-sm font-bold leading-5 text-[#1b1c15]">{title}</p>
        <p className="mt-1 text-xs leading-4 text-[#6e7a76]">{time}</p>
        <p className="mt-2 text-sm leading-5 text-[#3e4946]">{description}</p>
      </div>
    </article>
  )
}

function getStatusSummary(followUp: DoctorFollowUpListItem | DoctorFollowUpDetail) {
  if (followUp.status === "overdue") {
    return {
      className: "text-[#ba1a1a]",
      label: "Tình trạng",
      value: "Đã quá hạn",
    }
  }

  if (followUp.status === "completed") {
    return {
      className: "text-[#2e7d32]",
      label: "Tình trạng",
      value: "Đã hoàn tất",
    }
  }

  const days = getDaysUntil(followUp.followUpDate)

  return {
    className: "text-[#005e53]",
    label: "Thời gian còn lại",
    value: days > 0 ? `Còn ${days} ngày` : "Trong hôm nay",
  }
}

function isFollowUpDetail(
  followUp: DoctorFollowUpDetail | DoctorFollowUpListItem
): followUp is DoctorFollowUpDetail {
  return "reminderHistory" in followUp
}

function getDaysUntil(dateValue: string) {
  const target = new Date(`${dateValue}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = target.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diffMs / 86_400_000))
}

function getPetAvatarClassName(species: string) {
  if (species === "Dog") return "bg-[#fff3d8] text-[#b45309]"
  if (species === "Cat") return "bg-[#e0f2fe] text-[#0369a1]"
  return "bg-[#e4e3d7] text-[#3e4946]"
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatDateTime(dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatCount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    minimumIntegerDigits: 2,
    maximumFractionDigits: 0,
  }).format(value)
}

function TableHeaderCell({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn("px-6 py-4 text-left text-sm font-medium text-petcenter-text-secondary", className)}
      scope="col"
      {...props}
    />
  )
}

function TableBodyCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-6 py-4 text-petcenter-text", className)} {...props} />
}
