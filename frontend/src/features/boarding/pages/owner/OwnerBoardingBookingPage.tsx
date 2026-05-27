"use client"

import * as React from "react"
import Link from "next/link"
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Info,
  PawPrint,
  WalletCards,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type BoardingPet = {
  id: string
  name: string
  species: string
  weightKg: number
  avatarUrl?: string
}

type BoardingRoomOption = {
  id: "standard" | "vip" | "private"
  name: string
  pricePerDay: number
  description: string
  popular?: boolean
}

type BoardingPaymentOption = "counter" | "online"

const ownerBoardingPets: BoardingPet[] = [
  {
    id: "pet-lucky",
    name: "Lucky",
    species: "Chó",
    weightKg: 15,
    avatarUrl: "/meo_auth.png",
  },
  {
    id: "pet-milo",
    name: "Milo",
    species: "Mèo",
    weightKg: 4,
  },
  {
    id: "pet-bong",
    name: "Bé Bông",
    species: "Chó",
    weightKg: 6,
  },
]

const roomOptions: BoardingRoomOption[] = [
  {
    id: "standard",
    name: "Standard",
    pricePerDay: 120000,
    description: "Phòng tiêu chuẩn thoáng mát, có quạt, ăn hạt cơ bản.",
  },
  {
    id: "vip",
    name: "VIP",
    pricePerDay: 250000,
    description: "Phòng máy lạnh, có camera giám sát 24/7, ăn pate/thịt luộc ngày 2 bữa, đi dạo 1 lần/ngày.",
    popular: true,
  },
  {
    id: "private",
    name: "Chuồng riêng",
    pricePerDay: 80000,
    description: "Khu vực yên tĩnh cho bé nhát, không gian khép kín an toàn.",
  },
]

const defaultCheckIn = "2024-05-20T09:00"
const defaultCheckOut = "2024-05-22T17:00"

export function OwnerBoardingBookingPage() {
  const [selectedPetId, setSelectedPetId] = React.useState(ownerBoardingPets[0]?.id ?? "")
  const [petDropdownOpen, setPetDropdownOpen] = React.useState(false)
  const [checkInAt, setCheckInAt] = React.useState(defaultCheckIn)
  const [checkOutAt, setCheckOutAt] = React.useState(defaultCheckOut)
  const [selectedRoomId, setSelectedRoomId] = React.useState<BoardingRoomOption["id"]>("vip")
  const [specialRequest, setSpecialRequest] = React.useState("")
  const [paymentOption, setPaymentOption] = React.useState<BoardingPaymentOption>("counter")

  const selectedPet = ownerBoardingPets.find((pet) => pet.id === selectedPetId) ?? ownerBoardingPets[0]
  const selectedRoom = roomOptions.find((room) => room.id === selectedRoomId) ?? roomOptions[0]
  const nights = calculateNights(checkInAt, checkOutAt)
  const totalAmount = nights * selectedRoom.pricePerDay

  return (
    <div className="flex w-full max-w-[1280px] flex-col gap-8">
      <section className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-sm leading-5" aria-label="Breadcrumb">
          <Link href="/owner/boarding" className="text-[#3E4946] transition hover:text-[#00796B]">
            Lưu trú
          </Link>
          <ChevronRight className="size-4 text-[#3E4946]" aria-hidden="true" />
          <span className="font-medium text-[#1B1C15]">Đặt phòng lưu trú</span>
        </nav>

        <div className="space-y-2">
          <h1 className="heading-lg text-[#1B1C15]">Đặt phòng lưu trú</h1>
          <p className="body-lg text-[#3E4946]">
            Chọn thú cưng, thời gian lưu trú và loại phòng phù hợp.
          </p>
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,598px)_322px]">
        <section className="rounded-xl border border-[rgba(189,201,197,0.3)] bg-white px-[25px] pb-[41px] pt-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <h2 className="border-b border-[rgba(189,201,197,0.3)] pb-[17px] text-lg font-semibold leading-[26px] text-[#1B1C15]">
            Thông tin đặt phòng
          </h2>

          <div className="mt-6 flex flex-col gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-medium leading-4 text-[#3E4946]">Chọn thú cưng</label>
              <div className="relative max-w-[448px]">
                <button
                  type="button"
                  className="flex h-[52px] w-full items-center gap-3 rounded-xl border border-[#E6E8DD] bg-[#FBFAEE] px-[17px] text-left transition hover:border-[#BDC9C5]"
                  onClick={() => setPetDropdownOpen((current) => !current)}
                >
                  <PetAvatar pet={selectedPet} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium leading-[17.5px] text-[#1B1C15]">
                      {selectedPet.name}
                    </span>
                    <span className="block truncate text-[13px] leading-[16.25px] text-[#3E4946]">
                      {selectedPet.species} • {selectedPet.weightKg} kg
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-[#1B1C15]" aria-hidden="true" />
                </button>

                {petDropdownOpen ? (
                  <div className="absolute left-0 top-[60px] z-20 w-full overflow-hidden rounded-xl border border-[#BDC9C5] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                    {ownerBoardingPets.map((pet) => (
                      <button
                        key={pet.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#FBFAEE]",
                          pet.id === selectedPetId && "bg-[#FBFAEE]"
                        )}
                        onClick={() => {
                          setSelectedPetId(pet.id)
                          setPetDropdownOpen(false)
                        }}
                      >
                        <PetAvatar pet={pet} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium leading-5 text-[#1B1C15]">{pet.name}</span>
                          <span className="block truncate text-[13px] leading-[18px] text-[#3E4946]">
                            {pet.species} • {pet.weightKg} kg
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DateTimeField label="Nhận phòng" value={checkInAt} onChange={setCheckInAt} />
              <DateTimeField label="Trả phòng" value={checkOutAt} onChange={setCheckOutAt} min={checkInAt} />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium leading-4 text-[#1B1C15]">Loại phòng</p>
              <div className="space-y-3">
                {roomOptions.map((room) => (
                  <RoomOptionCard
                    key={room.id}
                    room={room}
                    selected={room.id === selectedRoomId}
                    onSelect={() => setSelectedRoomId(room.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="boarding-special-request" className="block text-xs font-medium leading-4 text-[#1B1C15]">
                Yêu cầu chăm sóc đặc biệt
              </label>
              <Textarea
                id="boarding-special-request"
                value={specialRequest}
                onChange={(event) => setSpecialRequest(event.target.value)}
                placeholder="Thói quen ăn uống, tính cách của bé..."
                className="min-h-[82px] resize-none rounded-lg border-[#BDC9C5] bg-white px-[13px] py-[13px] text-sm leading-5 placeholder:text-[#3E4946]/50 focus-visible:ring-0"
              />
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className="rounded-xl border border-[rgba(189,201,197,0.3)] bg-white p-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="text-lg font-semibold leading-[26px] text-[#1B1C15]">Tóm tắt đặt phòng</h2>

            <div className="mt-4 space-y-4">
              <SummaryRow label="Thú cưng" value={`${selectedPet.name} (${selectedPet.species})`} />
              <div className="border-b border-[#E4E3D7] pb-[9px] pt-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[13px] leading-[18px] text-[#3E4946]">Thời gian</span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-right text-sm font-medium leading-5 text-[#1B1C15]">
                      {formatShortDate(checkInAt)} - {formatShortDate(checkOutAt)}
                    </span>
                    <span className="rounded bg-[rgba(151,243,226,0.2)] px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.02em] text-[#005E53]">
                      {nights} Đêm
                    </span>
                  </span>
                </div>
              </div>
              <SummaryRow label="Loại phòng" value={selectedRoom.name} />

              <div className="flex items-end justify-between gap-4 pt-4">
                <span className="text-lg font-semibold leading-[26px] text-[#1B1C15]">Tạm tính</span>
                <span className="text-xl font-bold leading-7 tracking-[-0.01em] text-[#FEA619]">
                  {formatMoney(totalAmount)}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-[rgba(189,201,197,0.3)] pt-[25px]">
              <h3 className="text-xs font-semibold leading-4 text-[#1B1C15]">Phương thức thanh toán</h3>
              <div className="mt-3 space-y-2">
                <PaymentCard
                  checked={paymentOption === "counter"}
                  description="Bạn thanh toán khi mang thú cưng đến nhận phòng."
                  icon={Banknote}
                  label="Thanh toán tại trung tâm"
                  onSelect={() => setPaymentOption("counter")}
                />
                <PaymentCard
                  checked={paymentOption === "online"}
                  description="Thanh toán trước bằng ví điện tử, thẻ hoặc chuyển khoản."
                  icon={WalletCards}
                  label="Thanh toán online"
                  onSelect={() => setPaymentOption("online")}
                />
              </div>
            </div>

            <div className="mt-4 border-t border-[rgba(189,201,197,0.3)] pt-[17px]">
              <div className="space-y-3">
                <Button className="h-[50px] w-full rounded-lg bg-[#FEA619] text-lg font-semibold leading-[26px] text-white hover:bg-[#F59E0B]">
                  Xác nhận đặt phòng
                </Button>
                <Button asChild variant="outline" className="h-[52px] w-full rounded-lg border-[#6E7A76] text-lg font-semibold leading-[26px] text-[#1B1C15] hover:bg-[#FBFAEE]">
                  <Link href="/owner/boarding">Hủy</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="flex gap-3 rounded-xl border border-[rgba(189,201,197,0.3)] bg-[#EFEEE2] p-[17px]">
            <Info className="mt-0.5 size-5 shrink-0 text-[#6E7A76]" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="text-xs font-semibold leading-4 text-[#1B1C15]">Lưu ý từ trung tâm</h3>
              <p className="text-[13px] leading-[21px] text-[#3E4946]">
                Vui lòng mang theo sổ tiêm chủng khi nhận phòng. Thú cưng cần được tiêm phòng dại và các bệnh
                truyền nhiễm đầy đủ trước khi lưu trú ít nhất 14 ngày.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function PetAvatar({ pet, size }: { pet: BoardingPet; size: "sm" | "md" }) {
  return (
    <Avatar className={cn("bg-[#E4E3D7] after:border-transparent", size === "sm" ? "size-8" : "size-12")}>
      {pet.avatarUrl ? <AvatarImage alt={`Ảnh thú cưng ${pet.name}`} src={pet.avatarUrl} /> : null}
      <AvatarFallback className="bg-[#E4E3D7] text-[#6E7A76]">
        <PawPrint className={size === "sm" ? "size-4" : "size-5"} aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  )
}

function DateTimeField({
  label,
  min,
  onChange,
  value,
}: {
  label: string
  min?: string
  onChange: (value: string) => void
  value: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium leading-4 text-[#1B1C15]">{label}</label>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#3E4946]" aria-hidden="true" />
        <button
          type="button"
          className="h-[40px] w-full rounded-lg border border-[#BDC9C5] bg-white py-[9px] pl-[41px] pr-[17px] text-left text-sm leading-5 text-[#1B1C15] transition hover:border-[#00796B]"
          onClick={() => {
            if (inputRef.current?.showPicker) {
              inputRef.current.showPicker()
              return
            }

            inputRef.current?.focus()
          }}
        >
          {formatDateTime(value)}
        </button>
        <input
          ref={inputRef}
          aria-label={label}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          min={min}
          onChange={(event) => onChange(event.target.value)}
          type="datetime-local"
          value={value}
        />
      </div>
    </div>
  )
}

function RoomOptionCard({
  onSelect,
  room,
  selected,
}: {
  onSelect: () => void
  room: BoardingRoomOption
  selected: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border p-[17px] text-left transition",
        selected
          ? "border-[#005E53] bg-[rgba(151,243,226,0.1)] shadow-[0_0_0_1px_#005E53]"
          : "border-[#BDC9C5] bg-white hover:border-[#00796B]"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-lg font-semibold leading-[26px] text-[#1B1C15]">{room.name}</span>
          {room.popular ? (
            <span className="rounded-full border border-[#FBC97C] bg-[#FFF3D8] px-2 py-0.5 text-[10px] font-bold uppercase leading-[20px] text-[#684000]">
              Phổ biến
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-lg font-semibold leading-[26px] text-[#005E53]">
          {formatMoney(room.pricePerDay).replace(" ", "")}/ngày
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-[18px] text-[#3E4946]">{room.description}</p>
    </button>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E4E3D7] pb-[9px] pt-2">
      <span className="text-[13px] leading-[18px] text-[#3E4946]">{label}</span>
      <span className="text-right text-sm font-medium leading-5 text-[#1B1C15]">{value}</span>
    </div>
  )
}

function PaymentCard({
  checked,
  description,
  icon: Icon,
  label,
  onSelect,
}: {
  checked: boolean
  description: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  label: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full gap-3 rounded-xl border p-[13px] text-left transition",
        checked ? "border-[#00796B] bg-[rgba(151,243,226,0.1)]" : "border-[#BDC9C5] bg-white hover:border-[#00796B]"
      )}
      onClick={onSelect}
    >
      <Icon className="mt-0.5 size-5 shrink-0 text-[#6E7A76]" aria-hidden />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-[#1B1C15]">{label}</span>
        <span className="block text-xs leading-[15px] text-[#3E4946]">{description}</span>
      </span>
    </button>
  )
}

function calculateNights(checkInAt: string, checkOutAt: string) {
  const checkIn = new Date(checkInAt)
  const checkOut = new Date(checkOutAt)
  const diffMs = checkOut.getTime() - checkIn.getTime()

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 1
  }

  return Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`
}

function formatShortDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "--/--"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date)
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "--/--/----, --:--"
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)

  return `${datePart}, ${timePart}`
}
