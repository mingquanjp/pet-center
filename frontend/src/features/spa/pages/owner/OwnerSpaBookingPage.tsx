"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { CalendarDays, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  ownerSpaPets,
  spaBookingServiceOptions,
  spaBookingTimeSlots,
} from "../../constants/spa.constants"
import type { SpaPaymentMethod } from "../../types/spa.types"
import { OwnerSpaPetDropdown } from "../../components/owner/OwnerSpaPetDropdown"

const initialBookingDate = "2023-11-15"

export function OwnerSpaBookingPage() {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [petDropdownOpen, setPetDropdownOpen] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState("lucky")
  const [selectedServiceId, setSelectedServiceId] = useState("spa-combo")
  const [selectedDate, setSelectedDate] = useState(initialBookingDate)
  const [selectedTime, setSelectedTime] = useState("10:30")
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<SpaPaymentMethod>("counter")

  const selectedPet = useMemo(
    () => ownerSpaPets.find((pet) => pet.id === selectedPetId) ?? ownerSpaPets[0],
    [selectedPetId]
  )
  const selectedService = useMemo(
    () => spaBookingServiceOptions.find((service) => service.id === selectedServiceId) ?? spaBookingServiceOptions[2],
    [selectedServiceId]
  )
  const bookingDateLabel = formatDateLabel(selectedDate)
  const [totalValue, totalCurrency] = formatMoney(selectedService.price).split(" ")

  return (
    <div className="max-w-[1100px] space-y-8">
      <section className="space-y-1">
        <div className="flex items-center gap-2 text-[13px] leading-[18px]">
          <Link href="/owner/spa" className="text-[#3E4946] hover:text-[#005E53]">
            Dịch vụ spa
          </Link>
          <span className="text-[#3E4946]">›</span>
          <span className="font-medium text-[#1B1C15]">Đặt dịch vụ</span>
        </div>
        <h1 className="pt-1 text-[32px] font-bold leading-10 tracking-[-0.02em] text-[#1B1C15]">
          Đặt dịch vụ làm đẹp
        </h1>
        <p className="text-sm leading-5 text-[#3E4946]">
          Chọn thú cưng, dịch vụ và thời gian sử dụng phù hợp.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,642px)_286px]">
        <div className="space-y-6">
          <BookingSection number="1" title="Chọn thú cưng">
            <OwnerSpaPetDropdown
              pets={ownerSpaPets}
              selectedPetId={selectedPetId}
              open={petDropdownOpen}
              onOpenChange={setPetDropdownOpen}
              onSelect={setSelectedPetId}
            />
          </BookingSection>

          <BookingSection number="2" title="Chọn gói dịch vụ">
            <div className="space-y-3">
              {spaBookingServiceOptions.map((service) => {
                const selected = service.id === selectedServiceId

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-[17px] py-[17px] text-left",
                      selected
                        ? "border-2 border-[#005E53] bg-[rgba(0,94,83,0.05)] py-[16px]"
                        : "border-[#BDC9C5] bg-white"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn("flex rounded-full border", selected ? "size-[22px] items-center justify-center border-transparent bg-[#005E53]" : "size-5 border-[#6E7A76] bg-white")}>
                        {selected ? <Check className="size-3.5 text-white" aria-hidden="true" /> : null}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={cn("text-sm leading-5 text-[#1B1C15]", selected ? "font-bold" : "font-medium")}>
                          {service.name}
                        </span>
                        {service.popular ? (
                          <span className="rounded border border-[rgba(254,166,25,0.3)] bg-[rgba(254,166,25,0.2)] px-[9px] py-[3px] text-[10px] font-bold uppercase leading-[15px] tracking-[0.025em] text-[#855300]">
                            Phổ biến
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className={cn("text-sm leading-5", selected ? "font-bold text-[#005E53]" : "font-normal text-[#3E4946]")}>
                      {formatMoney(service.price)}
                    </span>
                  </button>
                )
              })}
            </div>
          </BookingSection>

          <BookingSection number="3" title="Thời gian dự kiến">
            <div className="space-y-2">
              <p className="text-xs font-medium leading-4 text-[#3E4946]">Chọn ngày</p>
              <div className="relative w-full max-w-[260px]">
                <CalendarDays className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#3E4946]" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => {
                    if (dateInputRef.current?.showPicker) {
                      dateInputRef.current.showPicker()
                      return
                    }

                    dateInputRef.current?.focus()
                  }}
                  className="h-11 w-full rounded-lg border border-[#BDC9C5] bg-[#FBFAEE] py-[11px] pl-[41px] pr-[17px] text-left text-sm leading-5 text-[#1B1C15]"
                >
                  {bookingDateLabel}
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="pointer-events-none absolute inset-0 h-11 w-full opacity-0"
                  aria-label="Chọn ngày đặt dịch vụ"
                />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium leading-4 text-[#3E4946]">Chọn giờ</p>
              <div className="relative w-full max-w-[260px]">
                <button
                  type="button"
                  onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-[#BDC9C5] bg-[#FBFAEE] px-[17px] text-left text-sm leading-5 text-[#1B1C15]"
                >
                  <span>{selectedTime}</span>
                  <ChevronDown className="size-4 text-[#3E4946]" aria-hidden="true" />
                </button>

                {timeDropdownOpen ? (
                  <div className="absolute left-0 top-[50px] z-20 max-h-[260px] w-full overflow-y-auto rounded-xl border border-[#BDC9C5] bg-white p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                    {spaBookingTimeSlots.map((time) => {
                      const selected = time === selectedTime

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setSelectedTime(time)
                            setTimeDropdownOpen(false)
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm leading-5 hover:bg-[#FBFAEE]",
                            selected ? "font-bold text-[#005E53]" : "font-normal text-[#1B1C15]"
                          )}
                        >
                          <span>{time}</span>
                          {selected ? <Check className="size-4 text-[#005E53]" aria-hidden="true" /> : null}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </BookingSection>

          <BookingSection number="4" title="Yêu cầu đặc biệt">
            <Textarea
              placeholder="Ghi chú thêm về tình trạng thú cưng, yêu cầu cắt tỉa riêng..."
              className="min-h-[86px] resize-none rounded-lg border-[#BDC9C5] bg-[#FBFAEE] px-[13px] py-[13px] text-sm leading-5 placeholder:text-[#6B7280] focus-visible:ring-0"
            />
          </BookingSection>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-[rgba(189,201,197,0.3)] bg-white p-[25px] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)]">
            <h2 className="border-b border-[rgba(189,201,197,0.5)] pb-[17px] text-lg font-semibold leading-[26px] text-[#1B1C15]">
              Thông tin đặt lịch
            </h2>

            <div className="space-y-4 py-4">
              <SummaryRow label="Thú cưng" value={selectedPet.name} />
              <SummaryRow label="Dịch vụ" value={selectedService.name} />
              <div className="flex items-start justify-between gap-4">
                <span className="text-[13px] leading-[18px] text-[#3E4946]">Thời gian</span>
                <span className="text-right">
                  <span className="block text-sm font-medium leading-5 text-[#1B1C15]">{selectedTime}</span>
                  <span className="block text-[13px] leading-[18px] text-[#3E4946]">{bookingDateLabel}</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] leading-[18px] text-[#3E4946]">Trạng thái</span>
                <span className="rounded-full bg-[#E4E3D7] px-[10px] py-1 text-[11px] font-semibold leading-[14px] tracking-[0.02em] text-[#3E4946]">
                  Chờ tiếp nhận
                </span>
              </div>
            </div>

            <div className="border-t border-[rgba(189,201,197,0.5)] pt-5">
              <h3 className="text-xs font-bold uppercase leading-4 tracking-[0.05em] text-[#1B1C15]">
                Phương thức thanh toán
              </h3>
              <div className="mt-3 space-y-2">
                <PaymentOption
                  checked={paymentMethod === "counter"}
                  label="Thanh toán tại trung tâm"
                  onClick={() => setPaymentMethod("counter")}
                />
                <PaymentOption
                  checked={paymentMethod === "online"}
                  label="Thanh toán online"
                  onClick={() => setPaymentMethod("online")}
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[rgba(0,94,83,0.2)] bg-[rgba(0,94,83,0.05)] px-[17px] pb-[17px] pt-[25px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium leading-5 text-[#1B1C15]">Tổng<br />cộng</span>
                <span className="text-xl font-bold leading-7 tracking-[-0.01em] text-[#005E53]">
                  {totalValue}
                  <br />
                  {totalCurrency}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3 pt-4">
              <Button className="h-10 w-full rounded-lg bg-[#FEA619] text-xs font-bold leading-4 text-[#684000] hover:bg-[#F59E0B]">
                Đặt dịch vụ
              </Button>
              <Button asChild variant="outline" className="h-11 w-full rounded-lg border-[#6E7A76] text-xs font-medium leading-4 text-[#1B1C15] hover:bg-[#FBFAEE]">
                <Link href="/owner/spa">Hủy</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function BookingSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-[rgba(189,201,197,0.3)] bg-white p-[25px] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-[rgba(0,94,83,0.1)] text-[11px] font-semibold leading-[14px] tracking-[0.02em] text-[#005E53]">
          {number}
        </span>
        <h2 className="text-lg font-semibold leading-[26px] text-[#1B1C15]">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[13px] leading-[18px] text-[#3E4946]">{label}</span>
      <span className="text-right text-sm font-medium leading-5 text-[#1B1C15]">{value}</span>
    </div>
  )
}

function PaymentOption({
  checked,
  label,
  onClick,
}: {
  checked: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 text-left">
      <span className={cn("flex size-[18px] items-center justify-center rounded-full border", checked ? "border-transparent bg-[#005E53]" : "border-[#6E7A76] bg-white")}>
        {checked ? <span className="size-1.5 rounded-full bg-white" /> : null}
      </span>
      <span className="text-sm leading-5 text-[#1B1C15]">{label}</span>
    </button>
  )
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}
