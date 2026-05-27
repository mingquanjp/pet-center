"use client"

import * as React from "react"
import Link from "next/link"
import {
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Home,
  PawPrint,
  Plus,
  Search,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BoardingStatus = "pending" | "accepted" | "waiting_check_in" | "completed"
type BoardingRoomType = "standard" | "vip"
type BoardingPaymentStatus = "paid" | "counter"
type BoardingTimeRange = "all" | "upcoming" | "current" | "past"

type BoardingBooking = {
  id: string
  petName: string
  petImageUrl?: string
  roomCode: string
  roomType: BoardingRoomType
  checkInDate: string
  checkOutDate: string
  stayDays: number
  status: BoardingStatus
  paymentStatus: BoardingPaymentStatus
  timeRange: BoardingTimeRange
}

type BoardingFilters = {
  search: string
  status: "all" | BoardingStatus
  roomType: "all" | BoardingRoomType
  timeRange: BoardingTimeRange
}

const BOARDING_PAGE_SIZE = 6

const ownerBoardingBookings: BoardingBooking[] = [
  {
    id: "BK-2501",
    petName: "Lucky",
    petImageUrl: "/meo_auth.png",
    roomCode: "P-02",
    roomType: "standard",
    checkInDate: "22/10/2026",
    checkOutDate: "25/10/2026",
    stayDays: 3,
    status: "pending",
    paymentStatus: "paid",
    timeRange: "upcoming",
  },
  {
    id: "BK-2502",
    petName: "Milo",
    roomCode: "P-05",
    roomType: "vip",
    checkInDate: "18/10/2026",
    checkOutDate: "23/10/2026",
    stayDays: 5,
    status: "accepted",
    paymentStatus: "paid",
    timeRange: "upcoming",
  },
  {
    id: "BK-2503",
    petName: "Bé Bông",
    roomCode: "P-03",
    roomType: "standard",
    checkInDate: "22/10/2026",
    checkOutDate: "27/10/2026",
    stayDays: 5,
    status: "waiting_check_in",
    paymentStatus: "paid",
    timeRange: "upcoming",
  },
  {
    id: "BK-2504",
    petName: "Mimi",
    roomCode: "P-01",
    roomType: "standard",
    checkInDate: "19/10/2026",
    checkOutDate: "24/10/2026",
    stayDays: 5,
    status: "pending",
    paymentStatus: "counter",
    timeRange: "upcoming",
  },
  {
    id: "BK-2505",
    petName: "Buddy",
    roomCode: "P-04",
    roomType: "standard",
    checkInDate: "16/10/2026",
    checkOutDate: "21/10/2026",
    stayDays: 5,
    status: "accepted",
    paymentStatus: "paid",
    timeRange: "upcoming",
  },
  {
    id: "BK-2506",
    petName: "Milo",
    roomCode: "P-06",
    roomType: "vip",
    checkInDate: "17/10/2026",
    checkOutDate: "24/10/2026",
    stayDays: 7,
    status: "completed",
    paymentStatus: "paid",
    timeRange: "past",
  },
  {
    id: "BK-2507",
    petName: "Bella",
    roomCode: "P-07",
    roomType: "vip",
    checkInDate: "10/11/2026",
    checkOutDate: "14/11/2026",
    stayDays: 4,
    status: "pending",
    paymentStatus: "counter",
    timeRange: "upcoming",
  },
  {
    id: "BK-2508",
    petName: "Kem",
    roomCode: "P-08",
    roomType: "standard",
    checkInDate: "01/10/2026",
    checkOutDate: "04/10/2026",
    stayDays: 3,
    status: "completed",
    paymentStatus: "paid",
    timeRange: "past",
  },
]

const statusOptions: Array<{ label: string; value: BoardingFilters["status"] }> = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "accepted" },
  { label: "Chờ check-in", value: "waiting_check_in" },
  { label: "Hoàn tất", value: "completed" },
]

const roomTypeOptions: Array<{ label: string; value: BoardingFilters["roomType"] }> = [
  { label: "Tất cả", value: "all" },
  { label: "Tiêu chuẩn", value: "standard" },
  { label: "VIP", value: "vip" },
]

const timeRangeOptions: Array<{ label: string; value: BoardingTimeRange }> = [
  { label: "Tất cả", value: "all" },
  { label: "Sắp tới", value: "upcoming" },
  { label: "Đang lưu trú", value: "current" },
  { label: "Đã qua", value: "past" },
]

const statusMeta: Record<BoardingStatus, { label: string; className: string }> = {
  pending: {
    label: "Chờ xác nhận",
    className: "bg-[#FFF3D8] text-[#B45309]",
  },
  accepted: {
    label: "Chờ xác nhận",
    className: "bg-[#DFF3E3] text-[#2E7D32]",
  },
  waiting_check_in: {
    label: "Chờ check-in",
    className: "bg-[#FFF3D8] text-[#B45309]",
  },
  completed: {
    label: "Hoàn tất",
    className: "bg-[#D8F3EE] text-[#00796B]",
  },
}

const roomTypeLabel: Record<BoardingRoomType, string> = {
  standard: "Tiêu chuẩn",
  vip: "VIP",
}

const paymentStatusLabel: Record<BoardingPaymentStatus, string> = {
  paid: "Đã thanh toán",
  counter: "Thanh toán tại quầy",
}

export function OwnerBoardingPage() {
  const [filters, setFilters] = React.useState<BoardingFilters>({
    search: "",
    status: "all",
    roomType: "all",
    timeRange: "all",
  })
  const [page, setPage] = React.useState(1)

  const filteredBookings = React.useMemo(() => {
    const normalizedSearch = filters.search.trim().toLocaleLowerCase("vi-VN")

    return ownerBoardingBookings.filter((booking) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        booking.id.toLocaleLowerCase("vi-VN").includes(normalizedSearch) ||
        booking.petName.toLocaleLowerCase("vi-VN").includes(normalizedSearch)
      const matchesStatus = filters.status === "all" || booking.status === filters.status
      const matchesRoomType = filters.roomType === "all" || booking.roomType === filters.roomType
      const matchesTimeRange = filters.timeRange === "all" || booking.timeRange === filters.timeRange

      return matchesSearch && matchesStatus && matchesRoomType && matchesTimeRange
    })
  }, [filters])

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / BOARDING_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const displayedBookings = filteredBookings.slice(
    (currentPage - 1) * BOARDING_PAGE_SIZE,
    currentPage * BOARDING_PAGE_SIZE
  )

  function updateFilter(key: keyof BoardingFilters, value: string) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
    setPage(1)
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="heading-lg text-balance text-[#1B1C15]">Lưu trú của tôi</h1>
          <p className="body-lg text-pretty text-[#3E4946]">
            Đặt phòng và theo dõi thú cưng trong thời gian lưu trú.
          </p>
        </div>
        <Button
          asChild
          className="h-12 w-fit gap-2 rounded-lg bg-[#F59E0B] px-6 text-lg font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#D97706]"
        >
          <Link href="/owner/boarding/booking">
            <Plus className="size-4" aria-hidden="true" />
            Đặt phòng lưu trú
          </Link>
        </Button>
      </section>

      <BoardingFilters filters={filters} onFilterChange={updateFilter} />

      {displayedBookings.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayedBookings.map((booking) => (
            <BoardingBookingCard booking={booking} key={booking.id} />
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

      <BoardingPagination currentPage={currentPage} onPageChange={setPage} totalPages={totalPages} />
    </div>
  )
}

function BoardingFilters({
  filters,
  onFilterChange,
}: {
  filters: BoardingFilters
  onFilterChange: (key: keyof BoardingFilters, value: string) => void
}) {
  return (
    <section className="rounded-[12px] border border-[#E6E8DD] bg-white p-[17px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6E7A76]"
            aria-hidden="true"
          />
          <span className="sr-only">Tìm kiếm lưu trú</span>
          <input
            className="h-10 w-full rounded-lg border border-transparent bg-[#E4E3D7] pl-10 pr-4 text-sm leading-5 text-[#1B1C15] outline-none transition placeholder:text-[#6E7A76] focus:border-[#00796B] focus:bg-white focus:ring-4 focus:ring-[#00796B]/10"
            onChange={(event) => onFilterChange("search", event.target.value)}
            placeholder="Tìm kiếm theo mã lưu trú, thú cưng..."
            type="search"
            value={filters.search}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:shrink-0 xl:items-center">
          <BoardingFilterSelect
            label="Trạng thái"
            onChange={(value) => onFilterChange("status", value)}
            options={statusOptions}
            value={filters.status}
          />
          <BoardingFilterSelect
            label="Loại phòng"
            onChange={(value) => onFilterChange("roomType", value)}
            options={roomTypeOptions}
            value={filters.roomType}
          />
          <BoardingFilterSelect
            label="Thời gian"
            onChange={(value) => onFilterChange("timeRange", value)}
            options={timeRangeOptions}
            value={filters.timeRange}
          />
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
    <label className="relative block min-w-0 xl:min-w-[180px]">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className="h-10 w-full appearance-none rounded-lg border border-[#BDC9C5] bg-white px-3 pr-9 text-sm leading-5 text-[#1B1C15] outline-none transition focus:border-[#00796B] focus:ring-4 focus:ring-[#00796B]/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {label}: {option.label}
          </option>
        ))}
      </select>
      <ChevronRight
        className="pointer-events-none absolute right-3 top-1/2 size-4 rotate-90 text-[#3E4946]"
        aria-hidden="true"
      />
    </label>
  )
}

function BoardingBookingCard({ booking }: { booking: BoardingBooking }) {
  const status = statusMeta[booking.status]

  return (
    <article className="flex min-h-[258px] flex-col justify-between rounded-[16px] border border-transparent bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div>
        <div className="flex items-start justify-between gap-3 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12 bg-[#E4E3D7] after:border-transparent">
              {booking.petImageUrl ? <AvatarImage src={booking.petImageUrl} alt={`Ảnh thú cưng ${booking.petName}`} /> : null}
              <AvatarFallback className="bg-[#E4E3D7] text-[#7A837F]">
                <PawPrint className="size-5" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-base font-normal leading-6 text-[#1B1C15]">{booking.petName}</h2>
              <p className="text-[13px] leading-[18px] text-[#3E4946]">Mã {booking.id}</p>
            </div>
          </div>
          <span className={cn("shrink-0 rounded-full px-3 py-1 text-[13px] font-medium leading-[19px]", status.className)}>
            {status.label}
          </span>
        </div>

        <div className="space-y-2 pb-4 text-[13px] leading-[18px] text-[#3E4946]">
          <div className="flex items-start gap-2">
            <DoorOpen className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
            <p>
              Phòng:{" "}
              <span className="font-bold text-[#1B1C15]">
                {booking.roomCode} / {roomTypeLabel[booking.roomType]}
              </span>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
            <div>
              <p>
                Thời gian:{" "}
                <span className="text-[#1B1C15]">
                  {booking.checkInDate} - {booking.checkOutDate}
                </span>
              </p>
              <p className="text-[#1B1C15]">({booking.stayDays} ngày)</p>
            </div>
          </div>
          <div className="flex items-start gap-2 pt-1">
            <Banknote className="mt-0.5 size-[15px] shrink-0 text-[#6E7A76]" aria-hidden="true" />
            <p>
              Thanh toán: <span className="text-[#1B1C15]">{paymentStatusLabel[booking.paymentStatus]}</span>
            </p>
          </div>
        </div>
      </div>

      <Button
        asChild
        className="h-10 w-full rounded-xl bg-[#00796B] text-base font-normal leading-6 text-white hover:bg-[#00695C]"
      >
        <Link href={`/owner/boarding/${encodeURIComponent(booking.id)}`}>Xem chi tiết</Link>
      </Button>
    </article>
  )
}

function BoardingPagination({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2 pb-8 pt-2" aria-label="Phân trang lưu trú">
      <button
        aria-label="Trang trước"
        className="flex size-10 items-center justify-center rounded-lg border border-[#BDC9C5] bg-white text-[#3E4946] transition hover:bg-[#F1EFE2] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border text-base leading-6 transition",
            page === currentPage
              ? "border-[#00796B] bg-[#00796B] text-white"
              : "border-[#BDC9C5] bg-white text-[#1B1C15] hover:bg-[#F1EFE2]"
          )}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}
      <button
        aria-label="Trang sau"
        className="flex size-10 items-center justify-center rounded-lg border border-[#BDC9C5] bg-white text-[#3E4946] transition hover:bg-[#F1EFE2] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </nav>
  )
}
