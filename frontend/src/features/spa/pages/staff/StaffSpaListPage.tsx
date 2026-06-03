"use client"

import * as React from "react"
import Link from "next/link"
import { Droplets, Hand, RotateCcw, Scissors, Search, Sparkles } from "lucide-react"

import { AppPagination } from "@/components/ui/app-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/ui/loading-state"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { spaApi } from "../../api/spa.api"
import { StaffSpaStatusBadge } from "../../components/staff/StaffSpaStatusBadge"
import type {
  StaffGroomingTicket,
  StaffGroomingTicketList,
  StaffGroomingTicketSpeciesFilter,
  StaffGroomingTicketStatusFilter,
  StaffGroomingTicketTimeRangeFilter,
} from "../../types/spa.types"

const defaultData: StaffGroomingTicketList = {
  summary: {
    total: 0,
    waitingAccept: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  tickets: [],
}

type StaffSpaPageCache = {
  data: StaffGroomingTicketList
  search: string
  status: StaffGroomingTicketStatusFilter
  species: StaffGroomingTicketSpeciesFilter
  timeRange: StaffGroomingTicketTimeRangeFilter
  page: number
}

const staffSpaPageCacheTtlMs = 30 * 1000
const staffSpaPageSize = 5
let staffSpaPageCache: StaffSpaPageCache | null = null
let staffSpaPageCacheTimer: ReturnType<typeof setTimeout> | null = null

function saveStaffSpaPageCache(cache: StaffSpaPageCache): void {
  staffSpaPageCache = cache

  if (staffSpaPageCacheTimer) {
    clearTimeout(staffSpaPageCacheTimer)
  }

  staffSpaPageCacheTimer = setTimeout(() => {
    staffSpaPageCache = null
    staffSpaPageCacheTimer = null
  }, staffSpaPageCacheTtlMs)
}

const statusDisplayOptions: Array<{ value: StaffGroomingTicketStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ tiếp nhận" },
  { value: "waiting", label: "Đã tiếp nhận" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
]

const speciesOptions: Array<{ value: StaffGroomingTicketSpeciesFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "Dog", label: "Chó" },
  { value: "Cat", label: "Mèo" },
  { value: "Other", label: "Khác" },
]

const timeRangeOptions: Array<{ value: StaffGroomingTicketTimeRangeFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "today", label: "Hôm nay" },
  { value: "upcoming", label: "Sắp tới" },
  { value: "past", label: "Đã qua" },
]

function formatSchedule(value: string): string {
  const date = new Date(value)
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
  const today = new Date()
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow)
  const timeLabel = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)

  if (dateKey === todayKey) return `Hôm nay, ${timeLabel}`
  if (dateKey === tomorrowKey) return `Ngày mai, ${timeLabel}`

  const dateLabel = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
  }).format(date)

  return `${dateLabel}, ${timeLabel}`
}

function getActionLabel(ticket: StaffGroomingTicket): string | null {
  if (ticket.canAccept) return "Tiếp nhận"
  if (ticket.canStart) return "Bắt đầu thực hiện"
  if (ticket.canComplete) return "Hoàn thành dịch vụ"
  return null
}

function getServiceVisual(serviceName: string) {
  const normalized = serviceName.toLowerCase()

  if (normalized.includes("tắm")) {
    return { icon: Droplets, bg: "#E0F2F1", color: "#005E53" }
  }

  if (normalized.includes("móng")) {
    return { icon: Hand, bg: "#E0F2F1", color: "#005E53" }
  }

  if (normalized.includes("cắt") || normalized.includes("tỉa")) {
    return { icon: Scissors, bg: "#E0F2F1", color: "#005E53" }
  }

  return { icon: Sparkles, bg: "#E0F2F1", color: "#005E53" }
}

export function StaffSpaListPage() {
  const [data, setData] = React.useState<StaffGroomingTicketList>(() => staffSpaPageCache?.data ?? defaultData)
  const [status, setStatus] = React.useState<StaffGroomingTicketStatusFilter>(() => staffSpaPageCache?.status ?? "all")
  const [species, setSpecies] = React.useState<StaffGroomingTicketSpeciesFilter>(() => staffSpaPageCache?.species ?? "all")
  const [timeRange, setTimeRange] = React.useState<StaffGroomingTicketTimeRangeFilter>(() => staffSpaPageCache?.timeRange ?? "all")
  const [search, setSearch] = React.useState(() => staffSpaPageCache?.search ?? "")
  const [page, setPage] = React.useState(() => staffSpaPageCache?.page ?? 1)
  const [isLoading, setIsLoading] = React.useState(() => !staffSpaPageCache)
  const [pendingTicketId, setPendingTicketId] = React.useState<string | null>(null)
  const [cancelTicket, setCancelTicket] = React.useState<StaffGroomingTicket | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const dataRef = React.useRef(data)

  React.useEffect(() => {
    dataRef.current = data
  }, [data])

  const replaceTicket = React.useCallback((updatedTicket: StaffGroomingTicket) => {
    const nextData = {
      ...dataRef.current,
      tickets: dataRef.current.tickets.map((ticket) =>
        ticket.groomingTicketId === updatedTicket.groomingTicketId ? updatedTicket : ticket
      ),
    }

    dataRef.current = nextData
    setData(nextData)
    saveStaffSpaPageCache({
      data: nextData,
      search,
      status,
      species,
      timeRange,
      page: nextData.pagination.page,
    })
  }, [search, species, status, timeRange])

  const loadTickets = React.useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const nextData = await spaApi.listStaffTickets({
        status,
        species,
        timeRange,
        search,
        page,
        limit: staffSpaPageSize,
      })

      dataRef.current = nextData
      setData(nextData)
      setPage(nextData.pagination.page)
      saveStaffSpaPageCache({
        data: nextData,
        search,
        status,
        species,
        timeRange,
        page: nextData.pagination.page,
      })
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách dịch vụ spa")
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [page, search, species, status, timeRange])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTickets()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [loadTickets])

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadTickets({ silent: true })
    }, 60_000)

    return () => window.clearInterval(intervalId)
  }, [loadTickets])

  async function handlePrimaryAction(ticket: StaffGroomingTicket) {
    setPendingTicketId(ticket.groomingTicketId)

    try {
      let updatedTicket: StaffGroomingTicket | null = null

      if (ticket.canAccept) {
        updatedTicket = await spaApi.acceptStaffTicket(ticket.groomingTicketId)
      } else if (ticket.canStart) {
        updatedTicket = await spaApi.startStaffTicket(ticket.groomingTicketId)
      } else if (ticket.canComplete) {
        updatedTicket = await spaApi.completeStaffTicket(ticket.groomingTicketId)
      }

      if (updatedTicket) {
        replaceTicket(updatedTicket)
        setErrorMessage(null)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật yêu cầu spa")
    } finally {
      setPendingTicketId(null)
    }
  }

  async function handleConfirmCancelAction() {
    if (!cancelTicket) return

    const ticket = cancelTicket
    setPendingTicketId(ticket.groomingTicketId)

    try {
      const updatedTicket = await spaApi.cancelStaffTicket(ticket.groomingTicketId)
      replaceTicket(updatedTicket)
      setCancelTicket(null)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể hủy yêu cầu spa")
    } finally {
      setPendingTicketId(null)
    }
  }

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setSpecies("all")
    setTimeRange("all")
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSpeciesChange(value: StaffGroomingTicketSpeciesFilter) {
    setSpecies(value)
    setPage(1)
  }

  function handleStatusChange(value: StaffGroomingTicketStatusFilter) {
    setStatus(value)
    setPage(1)
  }

  function handleTimeRangeChange(value: StaffGroomingTicketTimeRangeFilter) {
    setTimeRange(value)
    setPage(1)
  }

  const pagination = data.pagination
  const hasActiveFilter =
    search.trim().length > 0 ||
    status !== "all" ||
    species !== "all" ||
    timeRange !== "all"

  return (
    <div className="flex w-full flex-col gap-5 pb-12">
      <section className="flex w-full items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="whitespace-nowrap text-[36px] font-bold leading-10 text-[#1f261f]">Dịch vụ spa</h1>
          <p className="whitespace-nowrap text-sm leading-5 text-[#52605c]">
            Tiếp nhận, theo dõi và hoàn tất các yêu cầu làm đẹp cho thú cưng.
          </p>
        </div>
        <Button
          asChild
          className="h-10 shrink-0 gap-2 rounded-[12px] bg-[#f59e0b] px-5 py-2.5 text-sm font-semibold leading-5 text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#d97706]"
        >
          <Link href="/staff/spa/create" className="text-[0]">
            <span className="text-lg leading-none">+</span>
            <span className="text-sm leading-5">Tạo yêu cầu spa</span>
          </Link>
        </Button>
      </section>

      <section className="rounded-[16px] border border-[#e6e8dd] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6e7774]" aria-hidden="true" />
            <span className="sr-only">Tìm yêu cầu spa</span>
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Tìm theo mã dịch vụ, thú cưng"
              className="h-11 w-full rounded-full border border-[#cfd8d5] bg-white pl-14 pr-4 text-base leading-6 text-[#1b1c15] shadow-none outline-none transition placeholder:text-[#8a918e] focus-visible:border-[#005e53] focus-visible:ring-4 focus-visible:ring-[#005e53]/10"
              type="search"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center 2xl:flex-nowrap">
            <StaffFilterSelect
              label="Thú cưng"
              onChange={(value) => handleSpeciesChange(value as StaffGroomingTicketSpeciesFilter)}
              options={speciesOptions}
              value={species}
            />
            <StaffFilterSelect
              label="Trạng thái"
              onChange={(value) => handleStatusChange(value as StaffGroomingTicketStatusFilter)}
              options={statusDisplayOptions}
              value={status}
            />
            <StaffFilterSelect
              label="Thời gian"
              onChange={(value) => handleTimeRangeChange(value as StaffGroomingTicketTimeRangeFilter)}
              options={timeRangeOptions}
              value={timeRange}
            />
            <Button
              variant="ghost"
              className="h-10 w-fit shrink-0 rounded-xl px-3 text-base font-normal leading-6 text-[#005e53] hover:bg-[#e0f2f1] hover:text-[#004c43] disabled:pointer-events-none disabled:opacity-50"
              disabled={!hasActiveFilter}
              onClick={resetFilters}
            >
              <RotateCcw className="mr-1 size-4" />
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-[12px] border border-[#fde2e2] bg-white px-4 py-3 text-sm text-[#b91c1c]">
          {errorMessage}
        </div>
      ) : null}

      <section className="relative flex w-full flex-col gap-4">
        {data.tickets.map((ticket) => (
          <StaffSpaRequestCard
            key={ticket.groomingTicketId}
            ticket={ticket}
            isPending={pendingTicketId === ticket.groomingTicketId}
            onCancelAction={setCancelTicket}
            onPrimaryAction={handlePrimaryAction}
          />
        ))}

        {!isLoading && data.tickets.length === 0 ? (
          <div className="rounded-[16px] border border-[#e6e8dd] bg-white p-6 text-sm leading-5 text-[#52605c] shadow-[0px_4px_16px_rgba(31,38,31,0.05)]">
            Chưa có yêu cầu spa phù hợp.
          </div>
        ) : null}

        {isLoading ? (
          <div
            className={cn(
              "z-10 flex items-center justify-center rounded-[16px] bg-white/70 backdrop-blur-[2px]",
              data.tickets.length > 0
                ? "absolute inset-0"
                : "min-h-[360px] border border-[#e6e8dd] shadow-[0px_4px_16px_rgba(31,38,31,0.05)]"
            )}
          >
            <LoadingState
              className="py-12"
              title="Dang tai du lieu..."
              description="Vui long cho trong giay lat"
            />
          </div>
        ) : null}
      </section>

      {data.tickets.length > 0 ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <AppPagination
            ariaLabel="Phân trang yêu cầu spa"
            currentPage={pagination.page}
            isLoading={isLoading}
            onPageChange={setPage}
            totalPages={pagination.totalPages}
          />
        </div>
      ) : null}

      <StaffCancelSpaDialog
        isSubmitting={Boolean(cancelTicket && pendingTicketId === cancelTicket.groomingTicketId)}
        onClose={() => {
          if (pendingTicketId) return
          setCancelTicket(null)
        }}
        onConfirm={handleConfirmCancelAction}
        ticket={cancelTicket}
      />
    </div>
  )
}

function StaffSpaRequestCard({
  ticket,
  isPending,
  onCancelAction,
  onPrimaryAction,
}: {
  ticket: StaffGroomingTicket
  isPending: boolean
  onCancelAction: (ticket: StaffGroomingTicket) => void
  onPrimaryAction: (ticket: StaffGroomingTicket) => Promise<void>
}) {
  const visual = getServiceVisual(ticket.serviceName)
  const Icon = visual.icon
  const actionLabel = getActionLabel(ticket)
  const paymentStatusClassName = ticket.paymentStatusTone === "paid" ? "text-[#2e7d32]" : "text-[#b45309]"

  return (
    <Card className="rounded-[16px] border border-[#e6e8dd] bg-white py-0 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <CardContent className="flex flex-col gap-4 p-[25px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: visual.bg }}>
              <Icon className="size-[22px]" style={{ color: visual.color }} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-normal leading-6 text-[#1b1c15]">{ticket.serviceName}</h2>
              <p className="text-[11px] font-bold uppercase leading-[14px] tracking-[0.22px] text-[#3e4946]">
                {ticket.bookingCode}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <StaffSpaStatusBadge label={ticket.statusLabel} tone={ticket.statusTone} />
            <p className="text-base font-bold leading-6 text-[#005e53]">{ticket.totalAmountText}</p>
          </div>
        </div>

        <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-5">
          <RequestMeta label="Đối tượng" value={ticket.petName} emphasized />
          <RequestMeta label="Chủ nuôi" value={ticket.ownerName} />
          <RequestMeta label="Thời gian" value={formatSchedule(ticket.scheduledAt)} />
          <RequestMeta label="Thanh toán" value={ticket.paymentMethodLabel} />
          <RequestMeta
            className={paymentStatusClassName}
            emphasized={ticket.paymentStatusTone === "paid"}
            label="Trạng thái thanh toán"
            value={ticket.paymentStatusLabel}
          />
        </div>

        {ticket.specialRequest ? (
          <div className="rounded-lg bg-[#f5f4e8] p-3 text-[13px] leading-[18px] text-[#3e4946]">
            <span className="font-bold text-[#1b1c15]">Yêu cầu đặc biệt:</span> {ticket.specialRequest}
          </div>
        ) : null}

        {(actionLabel || ticket.canCancel) ? (
          <>
            <Separator className="bg-[#e6e8dd]" />

            <div className="flex justify-end gap-3">
              {ticket.canCancel ? (
                <Button
                  disabled={isPending}
                  onClick={() => onCancelAction(ticket)}
                  variant="outline"
                  className="h-10 rounded-lg border-[#3e4946] bg-white px-4 text-base font-normal leading-6 text-[#3e4946] hover:bg-[#f5f4e8] disabled:opacity-60"
                >
                  Hủy
                </Button>
              ) : null}

              {actionLabel ? (
                <Button
                  disabled={isPending}
                  onClick={() => void onPrimaryAction(ticket)}
                  className="h-10 rounded-lg bg-[#005e53] px-4 text-base font-normal leading-6 text-white hover:bg-[#004c43] disabled:opacity-60"
                >
                  {actionLabel}
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function StaffCancelSpaDialog({
  isSubmitting,
  onClose,
  onConfirm,
  ticket,
}: {
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  ticket: StaffGroomingTicket | null
}) {
  if (!ticket) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b1c15]/45 px-4 py-6">
      <div className="w-full max-w-[480px] rounded-[20px] border border-[#e6e8dd] bg-white p-6 shadow-[0_24px_80px_rgba(27,28,21,0.24)]">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a]">
            <Hand className="size-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold leading-7 text-[#1b1c15]">Xác nhận hủy dịch vụ spa?</h2>
          <p className="mt-2 text-sm leading-5 text-[#3e4946]">
            Yêu cầu sẽ chuyển sang trạng thái đã hủy sau khi xác nhận. Thao tác này nên được dùng khi khách không tiếp tục sử dụng dịch vụ.
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-[#f5f4e8] px-5 py-4">
          <CancelDialogRow emphasized label="Mã yêu cầu:" value={ticket.bookingCode} />
          <CancelDialogRow label="Dịch vụ:" value={ticket.serviceName} />
          <CancelDialogRow label="Thú cưng:" value={ticket.petName} />
          <CancelDialogRow label="Chủ nuôi:" value={ticket.ownerName} />
          <CancelDialogRow label="Thời gian:" value={formatSchedule(ticket.scheduledAt)} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            className="h-10 rounded-lg border-[#3e4946] bg-white px-4 text-base font-normal leading-6 text-[#3e4946] hover:bg-[#f5f4e8]"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Giữ lại
          </Button>
          <Button
            className="h-10 rounded-lg bg-[#ba1a1a] px-4 text-base font-normal leading-6 text-white hover:bg-[#93000a] disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
            type="button"
          >
            {isSubmitting ? "Đang hủy..." : "Xác nhận hủy"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CancelDialogRow({
  emphasized = false,
  label,
  value,
}: {
  emphasized?: boolean
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-[#3e4946]">{label}</span>
      <span className={cn("min-w-0 break-words text-right text-[#1b1c15]", emphasized ? "font-bold" : "font-medium")}>
        {value}
      </span>
    </div>
  )
}

function RequestMeta({
  className,
  emphasized = false,
  label,
  value,
}: {
  className?: string
  emphasized?: boolean
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium leading-[14px] tracking-[0.22px] text-[#3e4946]">{label}</p>
      <p className={cn("text-sm leading-5 text-[#1b1c15]", emphasized ? "font-medium" : "font-normal", className)}>
        {value}
      </p>
    </div>
  )
}

function StaffFilterSelect({
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
      <span className="whitespace-nowrap text-base font-normal leading-6 text-[#3e4946]">{label}:</span>
      <select
        className="h-11 min-w-[132px] rounded-[16px] border border-[#cfd8d5] bg-white px-4 pr-9 text-base leading-6 text-[#1b1c15] outline-none transition focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
