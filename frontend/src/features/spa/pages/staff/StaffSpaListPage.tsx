"use client"

import * as React from "react"
import Link from "next/link"
import { Clock3, Droplets, Hand, RotateCcw, Scissors, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { spaApi } from "../../api/spa.api"
import { StaffSpaStatusBadge } from "../../components/staff/StaffSpaStatusBadge"
import type {
  StaffGroomingTicket,
  StaffGroomingTicketList,
  StaffGroomingTicketSpeciesFilter,
  StaffGroomingTicketStatusFilter,
  StaffGroomingTicketStatusTone,
  StaffGroomingTicketTimeRangeFilter,
  GroomingService,
} from "../../types/spa.types"

const defaultData: StaffGroomingTicketList = {
  summary: {
    total: 0,
    waitingAccept: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
  },
  tickets: [],
}

type StaffSpaPageCache = {
  data: StaffGroomingTicketList
  search: string
  status: StaffGroomingTicketStatusFilter
  serviceId: string
  species: StaffGroomingTicketSpeciesFilter
  timeRange: StaffGroomingTicketTimeRangeFilter
}

const staffSpaPageCacheTtlMs = 30 * 1000
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

const statusOptions: Array<{ value: StaffGroomingTicketStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ tiếp nhận" },
  { value: "waiting", label: "Đã tiếp nhận" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
]

function getStatusLabel(value: StaffGroomingTicketStatusFilter) {
  return statusOptions.find((option) => option.value === value)?.label ?? "Tất cả"
}

const statusDisplayOptions: Array<{ value: StaffGroomingTicketStatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ tiếp nhận" },
  { value: "waiting", label: "Đã tiếp nhận" },
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

function getStatusDisplayLabel(value: StaffGroomingTicketStatusFilter) {
  return statusDisplayOptions.find((option) => option.value === value)?.label ?? "Tất cả"
}

function getSpeciesLabel(value: StaffGroomingTicketSpeciesFilter) {
  return speciesOptions.find((option) => option.value === value)?.label ?? "Tất cả"
}

function getTimeRangeLabel(value: StaffGroomingTicketTimeRangeFilter) {
  return timeRangeOptions.find((option) => option.value === value)?.label ?? "Tất cả"
}

function getServiceLabel(services: GroomingService[], serviceId: string) {
  if (serviceId === "all") return "Tất cả"

  return services.find((service) => service.serviceId === serviceId)?.serviceName ?? "Tất cả"
}

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
  if (ticket.canComplete) return "Hoàn tất"
  return null
}

function getCardAccent(tone: StaffGroomingTicketStatusTone): string {
  if (tone === "accepted") return "#005E53"
  if (tone === "completed") return "#2E7D32"
  if (tone === "cancelled") return "#B91C1C"
  return "#F59E0B"
}

function getServiceVisual(serviceName: string) {
  const normalized = serviceName.toLowerCase()

  if (normalized.includes("tắm")) {
    return { icon: Droplets, bg: "#D8F3EE", color: "#00796B" }
  }

  if (normalized.includes("móng")) {
    return { icon: Hand, bg: "#FFF3D8", color: "#F59E0B" }
  }

  if (normalized.includes("cắt") || normalized.includes("tỉa")) {
    return { icon: Scissors, bg: "#FBFAF2", color: "#F59E0B" }
  }

  return { icon: Sparkles, bg: "#FBFAF2", color: "#F59E0B" }
}

function getPetInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "P"
}

export function StaffSpaListPage() {
  const [data, setData] = React.useState<StaffGroomingTicketList>(() => staffSpaPageCache?.data ?? defaultData)
  const [status, setStatus] = React.useState<StaffGroomingTicketStatusFilter>(() => staffSpaPageCache?.status ?? "all")
  const [serviceId, setServiceId] = React.useState(() => staffSpaPageCache?.serviceId ?? "all")
  const [species, setSpecies] = React.useState<StaffGroomingTicketSpeciesFilter>(() => staffSpaPageCache?.species ?? "all")
  const [timeRange, setTimeRange] = React.useState<StaffGroomingTicketTimeRangeFilter>(() => staffSpaPageCache?.timeRange ?? "all")
  const [search, setSearch] = React.useState(() => staffSpaPageCache?.search ?? "")
  const [services, setServices] = React.useState<GroomingService[]>([])
  const [isLoading, setIsLoading] = React.useState(() => !staffSpaPageCache)
  const [pendingTicketId, setPendingTicketId] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const loadTickets = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const nextData = await spaApi.listStaffTickets({
        status,
        serviceId,
        species,
        timeRange,
        search,
        limit: 50,
      })

      setData(nextData)
      saveStaffSpaPageCache({
        data: nextData,
        search,
        status,
        serviceId,
        species,
        timeRange,
      })
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách dịch vụ spa")
    } finally {
      setIsLoading(false)
    }
  }, [search, serviceId, species, status, timeRange])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTickets()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [loadTickets])

  React.useEffect(() => {
    let isMounted = true

    spaApi
      .listStaffAvailableServices()
      .then((nextServices) => {
        if (isMounted) {
          setServices(nextServices)
        }
      })
      .catch(() => {
        if (isMounted) {
          setServices([])
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handlePrimaryAction(ticket: StaffGroomingTicket) {
    setPendingTicketId(ticket.groomingTicketId)

    try {
      if (ticket.canAccept) {
        await spaApi.acceptStaffTicket(ticket.groomingTicketId)
      } else if (ticket.canComplete) {
        await spaApi.completeStaffTicket(ticket.groomingTicketId)
      }

      await loadTickets()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật yêu cầu spa")
    } finally {
      setPendingTicketId(null)
    }
  }

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setServiceId("all")
    setSpecies("all")
    setTimeRange("all")
  }

  const showLoadingCards = isLoading && data.tickets.length === 0

  return (
    <div className="flex w-full flex-col gap-8 pb-12">
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

      <section className="flex w-full items-center gap-4 rounded-[16px] border border-[#e6e8dd] bg-white p-[17px] shadow-[0px_4px_8px_rgba(31,38,31,0.05)]">
        <div className="relative w-[308.66px] shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-[#7a837f]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã, thú cưng..."
            className="h-[44px] rounded-[12px] border-0 bg-[#f7f6ea] pl-[41px] pr-[17px] text-sm text-[#1f261f] shadow-none placeholder:text-[#7a837f] focus-visible:ring-0"
          />
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-4 items-center gap-3">
          <label className="relative flex h-[44px] min-w-0 items-center rounded-[12px] bg-[#f7f6ea] px-[17px] text-sm leading-5 text-[#1f261f]">
            <span className="truncate">Dịch vụ: {getServiceLabel(services, serviceId)}</span>
            <span className="ml-auto text-[#52605c]">⌄</span>
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Dịch vụ"
            >
              <option value="all">Tất cả</option>
              {services.map((service) => (
                <option key={service.serviceId} value={service.serviceId}>
                  {service.serviceName}
                </option>
              ))}
            </select>
          </label>

          <label className="relative flex h-[44px] min-w-0 items-center rounded-[12px] bg-[#f7f6ea] px-[17px] text-sm leading-5 text-[#1f261f]">
            <span className="truncate">Thú cưng: {getSpeciesLabel(species)}</span>
            <span className="ml-auto text-[#52605c]">⌄</span>
            <select
              value={species}
              onChange={(event) => setSpecies(event.target.value as StaffGroomingTicketSpeciesFilter)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Loại thú cưng"
            >
              {speciesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="relative flex h-[44px] min-w-0 items-center rounded-[12px] bg-[#f7f6ea] px-[17px] text-sm leading-5 text-[#1f261f]">
            <span className="truncate">Trạng thái: {getStatusDisplayLabel(status)}</span>
            <span className="ml-auto text-[#52605c]">⌄</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StaffGroomingTicketStatusFilter)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Trạng thái"
            >
              {statusDisplayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="relative flex h-[44px] min-w-0 items-center rounded-[12px] bg-[#f7f6ea] px-[17px] text-sm leading-5 text-[#1f261f]">
            <span className="truncate">Thời gian: {getTimeRangeLabel(timeRange)}</span>
            <span className="ml-auto text-[#52605c]">⌄</span>
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value as StaffGroomingTicketTimeRangeFilter)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Thời gian"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="flex h-[44px] shrink-0 items-center gap-1 px-4 text-sm font-medium leading-5 text-[#52605c]"
        >
          <RotateCcw className="size-3" />
          Đặt lại
        </button>

        <div className="hidden">
          <button className="flex h-[44px] min-w-[140px] flex-1 items-center justify-between rounded-[12px] bg-[#f7f6ea] px-[17px] text-left text-sm leading-5 text-[#1f261f]">
            Thú cưng: Tất cả
            <span className="text-[#52605c]">⌄</span>
          </button>

          <label className="relative flex h-[44px] min-w-[140px] flex-1 items-center rounded-[12px] bg-[#f7f6ea] px-[17px] text-sm leading-5 text-[#1f261f]">
            <span>Trạng thái: {getStatusLabel(status)}</span>
            <span className="ml-auto text-[#52605c]">⌄</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StaffGroomingTicketStatusFilter)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Trạng thái"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className="flex h-[44px] min-w-[140px] flex-1 items-center justify-between rounded-[12px] bg-[#f7f6ea] px-[17px] text-left text-sm leading-5 text-[#1f261f]">
            Thời gian: Hôm nay
            <span className="text-[#52605c]">⌄</span>
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="flex h-[44px] shrink-0 items-center gap-1 px-4 text-sm font-medium leading-5 text-[#52605c]"
          >
            <RotateCcw className="size-3" />
            Đặt lại
          </button>
        </div>
      </section>

      <div className="h-px w-full bg-[#e6e8dd]" />

      {errorMessage ? (
        <div className="rounded-[12px] border border-[#fde2e2] bg-white px-4 py-3 text-sm text-[#b91c1c]">
          {errorMessage}
        </div>
      ) : null}

      <section className="flex w-full flex-col gap-4">
        {showLoadingCards
          ? [0, 1, 2].map((rowIndex) => (
              <div
                key={rowIndex}
                className="h-[130px] w-full animate-pulse rounded-[16px] border border-[#e6e8dd] bg-white shadow-[0px_4px_16px_rgba(31,38,31,0.05)]"
              />
            ))
          : null}

        {data.tickets.map((ticket) => (
          <StaffSpaRequestCard
            key={ticket.groomingTicketId}
            ticket={ticket}
            isPending={pendingTicketId === ticket.groomingTicketId}
            onPrimaryAction={handlePrimaryAction}
          />
        ))}

        {!isLoading && data.tickets.length === 0 ? (
          <div className="rounded-[16px] border border-[#e6e8dd] bg-white p-6 text-sm leading-5 text-[#52605c] shadow-[0px_4px_16px_rgba(31,38,31,0.05)]">
            Chưa có yêu cầu spa phù hợp.
          </div>
        ) : null}
      </section>
    </div>
  )
}

function StaffSpaRequestCard({
  ticket,
  isPending,
  onPrimaryAction,
}: {
  ticket: StaffGroomingTicket
  isPending: boolean
  onPrimaryAction: (ticket: StaffGroomingTicket) => Promise<void>
}) {
  const visual = getServiceVisual(ticket.serviceName)
  const Icon = visual.icon
  const actionLabel = getActionLabel(ticket)
  const paymentToneClassName =
    ticket.paymentStatusTone === "paid"
      ? "bg-[#dff3e3] text-[#2e7d32]"
      : "bg-[#fff3d8] text-[#b45309]"

  return (
    <article className="relative w-full overflow-hidden rounded-[16px] border border-[#e6e8dd] bg-white p-[25px] shadow-[0px_4px_16px_rgba(31,38,31,0.05)]">
      <div className="flex gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px]" style={{ backgroundColor: visual.bg }}>
              <Icon className="size-6" style={{ color: visual.color }} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold leading-7 tracking-[-0.2px] text-[#1f261f]">{ticket.serviceName}</h2>
              <p className="text-[11px] font-semibold leading-[14px] tracking-[0.22px] text-[#7a837f]">
                Mã YC: {ticket.bookingCode}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <MetaBlock label="Thú cưng">
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#d8f3ee] text-[10px] font-bold leading-[15px] text-[#005e53]">
                  {getPetInitial(ticket.petName)}
                </span>
                <span className="truncate text-sm font-medium leading-5 text-[#1f261f]">{ticket.petName}</span>
              </div>
            </MetaBlock>
            <MetaBlock label="Chủ nuôi">
              <span className="truncate text-sm leading-5 text-[#52605c]">{ticket.ownerName}</span>
            </MetaBlock>
            <MetaBlock label="Thời gian">
              <span className="flex items-center gap-1 truncate text-sm font-medium leading-5 text-[#1f261f]">
                <Clock3 className="size-[13px] shrink-0 text-[#52605c]" />
                {formatSchedule(ticket.scheduledAt)}
              </span>
            </MetaBlock>
            <MetaBlock label="Thanh toán">
              <span className="flex items-center gap-2 text-sm leading-5 text-[#52605c]">
                {ticket.paymentMethodLabel}
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold leading-[15px]", paymentToneClassName)}>
                  {ticket.paymentStatusLabel}
                </span>
              </span>
            </MetaBlock>
          </div>

          {ticket.specialRequest ? (
            <div className="rounded-[8px] border border-[#e6e8dd] bg-[#fbfaf2] px-3 py-2 text-xs leading-4 text-[#52605c]">
              <span className="mr-2 font-semibold text-[#f59e0b]">!</span>
              {ticket.specialRequest}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-[180px] shrink-0 flex-col items-end justify-between border-l border-[#e6e8dd] pl-8">
          <div className="flex flex-col items-end gap-2">
            <StaffSpaStatusBadge label={ticket.statusLabel} tone={ticket.statusTone} />
            <p className="text-lg font-bold leading-[26px] text-[#1f261f]">{ticket.totalAmountText.replace(" VNĐ", "đ")}</p>
          </div>

          {actionLabel ? (
            <Button
              disabled={isPending}
              onClick={() => void onPrimaryAction(ticket)}
              className="h-9 rounded-[12px] bg-[#005e53] px-4 py-2 text-sm font-medium leading-5 text-white hover:bg-[#004940] disabled:opacity-60"
            >
              {isPending ? actionLabel : actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: getCardAccent(ticket.statusTone) }} />
    </article>
  )
}

function MetaBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-[11px] font-semibold leading-[14px] tracking-[0.22px] text-[#7a837f]">{label}</p>
      {children}
    </div>
  )
}
