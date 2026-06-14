"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  ChevronRight,
  Clock3,
  DoorOpen,
  Home,
  PawPrint,
  Plus,
  Search,
  ShieldPlus,
} from "lucide-react"

import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppPagination } from "@/components/ui/app-pagination"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { boardingApi } from "../../api/boarding.api"
import type {
  BoardingHealthStatus,
  BoardingRecordListItem,
  BoardingRecordStatus,
  BoardingTimeRange,
  Pagination,
} from "../../types/boarding.types"
import { OwnerBoardingCancelDialog } from "../../components/owner/OwnerBoardingCancelDialog"

type BoardingFilters = {
  search: string
  status: "all" | BoardingRecordStatus
  roomTypeId: "all" | string
  timeRange: BoardingTimeRange
}

const BOARDING_PAGE_SIZE = 6
const defaultPagination: Pagination = {
  page: 1,
  limit: BOARDING_PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

const statusOptions: Array<{ label: string; value: BoardingFilters["status"] }> = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Chờ check-in", value: "confirmed" },
  { label: "Đang lưu trú", value: "staying" },
  { label: "Hoàn tất", value: "checked_out" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Từ chối", value: "rejected" },
]

const timeRangeOptions: Array<{ label: string; value: BoardingTimeRange }> = [
  { label: "Tất cả", value: "all" },
  { label: "Sắp tới", value: "upcoming" },
  { label: "Đang lưu trú", value: "current" },
  { label: "Đã qua", value: "past" },
]

const statusMeta: Record<BoardingRecordStatus, { className: string }> = {
  pending: {
    className: "bg-[#FFF3D8] text-[#B45309]",
  },
  confirmed: {
    className: "bg-[#FFF3D8] text-[#B45309]",
  },
  staying: {
    className: "bg-[#DFF3E3] text-[#00796B]",
  },
  checked_out: {
    className: "bg-[#D8F3EE] text-[#00796B]",
  },
  cancelled: {
    className: "bg-[#FDE2E4] text-[#C62828]",
  },
  rejected: {
    className: "bg-[#FDE2E4] text-[#C62828]",
  },
}

export function OwnerBoardingPage() {
  const [filters, setFilters] = React.useState<BoardingFilters>({
    search: "",
    status: "all",
    roomTypeId: "all",
    timeRange: "all",
  })
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [records, setRecords] = React.useState<BoardingRecordListItem[]>([])
  const [knownRoomTypes, setKnownRoomTypes] = React.useState<Array<{ label: string; value: string }>>([
    { label: "Tất cả", value: "all" },
  ])
  const [pagination, setPagination] = React.useState<Pagination>(defaultPagination)
  const [isLoadingRecords, setIsLoadingRecords] = React.useState(true)
  const [hasLoadedRecords, setHasLoadedRecords] = React.useState(false)
  const [recordsError, setRecordsError] = React.useState<string | null>(null)
  const [cancelRecordId, setCancelRecordId] = React.useState<string | null>(null)
  const [isCanceling, setIsCanceling] = React.useState(false)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(filters.search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [filters.search])

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadRoomTypeOptions() {
      try {
        const result = await boardingApi.listOwnerRecords(
          {
            page: 1,
            limit: 100,
          },
          { signal: abortController.signal }
        )

        if (!abortController.signal.aborted) {
          setKnownRoomTypes((currentOptions) => mergeRoomTypeOptions(currentOptions, result.records))
        }
      } catch {
        // Room type options are derived from bookings; the main list still owns visible error handling.
      }
    }

    void loadRoomTypeOptions()

    return () => {
      abortController.abort()
    }
  }, [])

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadBoardingRecords() {
      try {
        setIsLoadingRecords(true)
        setRecordsError(null)

        const result = await boardingApi.listOwnerRecords(
          {
            search: searchQuery || undefined,
            status: filters.status,
            roomTypeId: filters.roomTypeId === "all" ? undefined : filters.roomTypeId,
            timeRange: filters.timeRange,
            page,
            limit: BOARDING_PAGE_SIZE,
          },
          { signal: abortController.signal }
        )

        if (!abortController.signal.aborted) {
          setRecords(result.records)
          setPagination({
            ...result.pagination,
            totalPages: Math.max(1, result.pagination.totalPages),
          })
          setKnownRoomTypes((currentOptions) => mergeRoomTypeOptions(currentOptions, result.records))
          setHasLoadedRecords(true)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setRecords([])
          setPagination(defaultPagination)
          setHasLoadedRecords(true)
          setRecordsError(error instanceof Error ? error.message : "Không thể tải danh sách lưu trú")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingRecords(false)
        }
      }
    }

    void loadBoardingRecords()

    return () => {
      abortController.abort()
    }
  }, [filters.roomTypeId, filters.status, filters.timeRange, page, searchQuery])

  const shouldShowSkeleton = isLoadingRecords && !hasLoadedRecords
  const currentPage = pagination.page
  const totalPages = Math.max(1, pagination.totalPages)

  function updateFilter(key: keyof BoardingFilters, value: string) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
    setPage(1)
  }

  async function proceedCancelRecord() {
    if (!cancelRecordId) return

    setIsCanceling(true)
    try {
      await boardingApi.cancelRecord(cancelRecordId)
      // Cập nhật state nội bộ để thấy ngay sự thay đổi
      setRecords((prev) =>
        prev.map((record) =>
          record.boardingRecordId === cancelRecordId
            ? { ...record, status: "cancelled", statusLabel: "Đã hủy" }
            : record
        )
      )
      toast.success("Hủy lưu trú thành công")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể hủy lịch lưu trú"
      setRecordsError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsCanceling(false)
      setCancelRecordId(null)
    }
  }

  function handleCancelRecord(boardingRecordId: string) {
    setCancelRecordId(boardingRecordId)
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center pb-2">
        <div>
          <h1 className="heading-lg text-petcenter-text tracking-tight">Lưu trú của tôi</h1>
          <p className="body-md mt-1 text-petcenter-text-secondary">
            Đặt phòng và theo dõi thú cưng trong thời gian lưu trú.
          </p>
        </div>

        <Button
          asChild
          className="h-10 shrink-0 rounded-[0.75rem] bg-petcenter-cta px-4 body-md font-semibold text-white shadow-card transition-all hover:bg-petcenter-cta-hover active:scale-95"
        >
          <Link href="/owner/boarding/booking">
            <Plus className="size-5" aria-hidden="true" />
            Đặt phòng lưu trú
          </Link>
        </Button>
      </div>

      <BoardingFilters filters={filters} onFilterChange={updateFilter} roomTypeOptions={knownRoomTypes} />

      {recordsError ? (
        <BoardingRecordsError message={recordsError} />
      ) : shouldShowSkeleton ? (
        <BoardingRecordsSkeleton />
      ) : records.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record) => (
            <BoardingBookingCard booking={record} key={record.boardingRecordId} onCancel={handleCancelRecord} />
          ))}
        </section>
      ) : (
        <section className="flex min-h-[260px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#BDC9C5] bg-white px-6 py-12 text-center">
          <Home className="size-14 text-[#00796B]/30" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold leading-[26px] text-[#1B1C15]">Không có lịch lưu trú phù hợp</h2>
          <p className="mt-2 text-sm leading-5 text-[#3E4946]">
            Thử đổi bộ lọc hoặc tìm theo mã lưu trú khác.
          </p>
        </section>
      )}

      <AppPagination
        ariaLabel="Phân trang lưu trú"
        className="pb-8 pt-2"
        currentPage={currentPage}
        isLoading={isLoadingRecords}
        onPageChange={setPage}
        totalPages={totalPages}
      />

      <OwnerBoardingCancelDialog
        isOpen={Boolean(cancelRecordId)}
        isPending={isCanceling}
        onOpenChange={(open) => {
          if (!open) setCancelRecordId(null)
        }}
        onSubmit={proceedCancelRecord}
      />
    </div>
  )
}

function mergeRoomTypeOptions(
  currentOptions: Array<{ label: string; value: string }>,
  records: BoardingRecordListItem[]
): Array<{ label: string; value: string }> {
  const optionsByValue = new Map(currentOptions.map((option) => [option.value, option]))

  records.forEach((record) => {
    optionsByValue.set(record.room.roomTypeId, {
      label: record.room.roomTypeName,
      value: record.room.roomTypeId,
    })
  })

  return Array.from(optionsByValue.values())
}

function BoardingFilters({
  filters,
  onFilterChange,
  roomTypeOptions,
}: {
  filters: BoardingFilters
  onFilterChange: (key: keyof BoardingFilters, value: string) => void
  roomTypeOptions: Array<{ label: string; value: string }>
}) {
  const hasActiveFilter =
    filters.search.trim().length > 0 ||
    filters.status !== "all" ||
    filters.roomTypeId !== "all" ||
    filters.timeRange !== "all"

  function resetFilters() {
    onFilterChange("search", "")
    onFilterChange("status", "all")
    onFilterChange("roomTypeId", "all")
    onFilterChange("timeRange", "all")
  }

  return (
    <section className="rounded-[16px] border border-[#E6E8DD] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6E7774]" aria-hidden="true" />
          <span className="sr-only">Tìm kiếm lưu trú</span>
          <input
            type="search"
            placeholder="Tìm theo mã lưu trú, thú cưng..."
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            className="h-11 w-full rounded-full border border-[#CFD8D5] bg-white pl-14 pr-4 text-base leading-6 text-[#1B1C15] outline-none transition placeholder:text-[#8A918E] focus:border-[#005E53] focus:ring-4 focus:ring-[#005E53]/10"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap">
          <BoardingFilterSelect
            label="Trạng thái"
            onChange={(value) => onFilterChange("status", value)}
            options={statusOptions}
            value={filters.status}
          />
          <BoardingFilterSelect
            label="Loại phòng"
            onChange={(value) => onFilterChange("roomTypeId", value)}
            options={roomTypeOptions}
            value={filters.roomTypeId}
          />
          <BoardingFilterSelect
            label="Thời gian"
            onChange={(value) => onFilterChange("timeRange", value)}
            options={timeRangeOptions}
            value={filters.timeRange}
          />
          <Button
            variant="ghost"
            className="h-10 w-fit shrink-0 rounded-xl px-3 text-base font-normal leading-6 text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#004C43] disabled:pointer-events-none disabled:opacity-50"
            disabled={!hasActiveFilter}
            onClick={resetFilters}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      </div>
    </section>
  )
}

function BoardingFilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm font-normal leading-5 text-[#3E4946]">{label}:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 min-w-[120px] rounded-lg border border-[#CFD8D5] bg-white px-3 text-sm leading-5 text-[#1B1C15] outline-none transition focus:border-[#005E53] focus:ring-2 focus:ring-[#005E53]/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-44 rounded-lg border border-[#CFD8D5] bg-white p-1 shadow-md">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-md py-2 px-3 text-sm font-normal text-[#3E4946] hover:bg-[#F3F7F6] focus:bg-[#E0F2F1] focus:text-[#005E53] cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function BoardingBookingCard({ booking, onCancel }: { booking: BoardingRecordListItem, onCancel: (id: string) => void }) {
  const status = statusMeta[booking.status]
  const isStaying = booking.status === "staying"
  const canCancel = booking.status === "pending" && booking.payment.paymentStatus === "unpaid"

  return (
    <article className="flex min-h-[258px] flex-col justify-between rounded-[16px] border border-transparent bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div>
        <div className="flex items-start justify-between gap-3 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12 bg-[#E4E3D7] after:border-transparent">
              {booking.pet.profileImageUrl ? (
                <AvatarImage src={booking.pet.profileImageUrl} alt={`Ảnh thú cưng ${booking.pet.petName}`} />
              ) : null}
              <AvatarFallback className="bg-[#E4E3D7] text-[#7A837F]">
                <PawPrint className="size-5" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-base font-normal leading-6 text-[#1B1C15]">{booking.pet.petName}</h2>
              <p className="text-[13px] leading-[18px] text-[#3E4946]">Mã {booking.boardingCode}</p>
            </div>
          </div>
          <span className={cn("shrink-0 rounded-full px-3 py-1 text-[13px] font-medium leading-[19px]", status.className)}>
            {booking.statusLabel}
          </span>
        </div>

        <div className="space-y-2 pb-4 text-[13px] leading-[18px] text-[#3E4946]">
          <div className="flex items-start gap-2">
            <DoorOpen className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
            <p>
              Phòng: <span className="font-bold text-[#1B1C15]">{booking.room.roomTypeName}</span>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
            <div>
              <p>
                Thời gian:{" "}
                <span className="text-[#1B1C15]">
                  {booking.plannedDateRangeText}
                </span>
              </p>
              <p className="text-[#1B1C15]">({booking.stayDays} ngày)</p>
            </div>
          </div>
          {isStaying ? (
            <>
              <div className="flex items-start gap-2 pt-1">
                <ShieldPlus className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
                <p>
                  Sức khỏe:{" "}
                  <span className={cn("font-medium", getHealthStatusClassName(booking.activeCare?.healthStatus))}>
                    {booking.activeCare?.healthStatusLabel ?? "Chưa cập nhật"}
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock3 className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
                <p>
                  Cập nhật cuối:{" "}
                  <span className="text-[#1B1C15]">{formatLastUpdatedAt(booking.activeCare?.lastUpdatedAt)}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 pt-1">
              <Banknote className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
              <p>
                Thanh toán: <span className="text-[#1B1C15]">{booking.payment.paymentStatusLabel}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {canCancel ? (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 flex-1 rounded-xl border-[#C62828] text-base font-normal leading-6 text-[#C62828] hover:bg-[#FDE2E4] hover:text-[#C62828]"
            onClick={() => onCancel(booking.boardingRecordId)}
          >
            Hủy
          </Button>
          <Button
            asChild
            className="h-10 flex-1 rounded-xl bg-[#00796B] text-base font-normal leading-6 text-white hover:bg-[#00695C]"
          >
            <Link href={`/owner/boarding/${encodeURIComponent(booking.boardingRecordId)}`}>
              Xem chi tiết
            </Link>
          </Button>
        </div>
      ) : (
        <Button
          asChild
          className="h-10 w-full rounded-xl bg-[#00796B] text-base font-normal leading-6 text-white hover:bg-[#00695C]"
        >
          <Link href={`/owner/boarding/${encodeURIComponent(booking.boardingRecordId)}`}>
            {isStaying ? "Theo dõi chi tiết" : "Xem chi tiết"}
          </Link>
        </Button>
      )}
    </article>
  )
}

function getHealthStatusClassName(status: BoardingHealthStatus | undefined) {
  if (status === "normal") return "text-[#00796B]"
  if (status === "attention") return "text-[#B45309]"
  if (status === "urgent") return "text-[#B91C1C]"

  return "text-[#3E4946]"
}

function formatLastUpdatedAt(value: string | null | undefined): string {
  if (!value) return "Chưa cập nhật"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Chưa cập nhật"

  const parts = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      result[part.type] = part.value
      return result
    }, {})

  return `${parts.hour}:${parts.minute} ${parts.day}/${parts.month}/${parts.year}`
}

function BoardingRecordsError({ message }: { message: string }) {
  return (
    <section className="flex items-start gap-3 rounded-[16px] border border-[#B91C1C]/20 bg-[#FEE2E2] p-4 text-[#B91C1C]">
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <h2 className="text-sm font-bold leading-5">Không thể tải danh sách lưu trú</h2>
        <p className="mt-1 text-sm leading-5">{message}</p>
      </div>
    </section>
  )
}

function BoardingRecordsSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: BOARDING_PAGE_SIZE }).map((_, index) => (
        <article
          className="flex min-h-[258px] animate-pulse flex-col justify-between rounded-[16px] bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
          key={index}
        >
          <div>
            <div className="flex items-start justify-between gap-3 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-[#E4E3D7]" />
                <div className="space-y-2">
                  <div className="h-5 w-24 rounded bg-[#E4E3D7]" />
                  <div className="h-4 w-20 rounded bg-[#E4E3D7]" />
                </div>
              </div>
              <div className="h-7 w-24 rounded-full bg-[#E4E3D7]" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-3/4 rounded bg-[#E4E3D7]" />
              <div className="h-4 w-5/6 rounded bg-[#E4E3D7]" />
              <div className="h-4 w-2/3 rounded bg-[#E4E3D7]" />
            </div>
          </div>
          <div className="h-10 w-full rounded-xl bg-[#E4E3D7]" />
        </article>
      ))}
    </section>
  )
}
