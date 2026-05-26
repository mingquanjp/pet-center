"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, CalendarDays, Check, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { spaApi } from "../../api/spa.api"
import type {
  GroomingAvailabilitySlot,
  GroomingBookingPet,
  GroomingBookingService,
  GroomingTicketCreated,
  OwnerSpaPet,
  SpaPaymentMethod,
} from "../../types/spa.types"
import { OwnerSpaBookingSuccessDialog } from "../../components/owner/OwnerSpaBookingSuccessDialog"
import { OwnerSpaPetDropdown } from "../../components/owner/OwnerSpaPetDropdown"

const defaultTime = "10:30"

export function OwnerSpaBookingPage() {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const requestedServiceIdRef = useRef<string | null>(null)
  const [petDropdownOpen, setPetDropdownOpen] = useState(false)
  const [pets, setPets] = useState<OwnerSpaPet[]>([])
  const [services, setServices] = useState<GroomingBookingService[]>([])
  const [slots, setSlots] = useState<GroomingAvailabilitySlot[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(getTomorrowDateInputValue)
  const [selectedTime, setSelectedTime] = useState(defaultTime)
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<SpaPaymentMethod>("counter")
  const [specialRequest, setSpecialRequest] = useState("")
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successTicket, setSuccessTicket] = useState<GroomingTicketCreated | null>(null)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  useEffect(() => {
    requestedServiceIdRef.current = new URLSearchParams(window.location.search).get("serviceId")
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    async function loadBookingOptions() {
      try {
        setIsLoadingOptions(true)
        setErrorMessage(null)

        const options = await spaApi.getBookingOptions(selectedPetId ?? undefined, {
          signal: abortController.signal,
        })

        if (abortController.signal.aborted) {
          return
        }

        const nextPets = options.pets.map(mapBookingPetToDropdownPet)
        const nextSelectedPetId = options.selectedPet?.petId ?? nextPets[0]?.id ?? null
        const requestedServiceId = requestedServiceIdRef.current
        const requestedService = requestedServiceId
          ? options.services.find((service) => service.serviceId === requestedServiceId)
          : undefined

        setPets(nextPets)
        setServices(options.services)
        setSelectedPetId(nextSelectedPetId)
        setSelectedServiceId((previousServiceId) => {
          const currentService = previousServiceId
            ? options.services.find((service) => service.serviceId === previousServiceId)
            : undefined

          return (requestedService ?? currentService ?? options.services[0] ?? null)?.serviceId ?? null
        })

        if (requestedService) {
          requestedServiceIdRef.current = null
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setPets([])
          setServices([])
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải thông tin đặt dịch vụ spa")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingOptions(false)
        }
      }
    }

    void loadBookingOptions()

    return () => {
      abortController.abort()
    }
  }, [selectedPetId])

  useEffect(() => {
    const abortController = new AbortController()

    async function loadAvailability() {
      try {
        setIsLoadingSlots(true)
        setErrorMessage(null)

        const availability = await spaApi.getAvailability(selectedDate, {
          signal: abortController.signal,
        })

        if (abortController.signal.aborted) {
          return
        }

        setSlots(availability.slots)
        setSelectedTime((previousTime) => {
          const selectedSlot = availability.slots.find((slot) => slot.time === previousTime)

          return selectedSlot?.available
            ? previousTime
            : availability.slots.find((slot) => slot.available)?.time ?? defaultTime
        })
      } catch (error) {
        if (!abortController.signal.aborted) {
          setSlots([])
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải khung giờ đặt dịch vụ")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingSlots(false)
        }
      }
    }

    void loadAvailability()

    return () => {
      abortController.abort()
    }
  }, [selectedDate])

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? pets[0] ?? null,
    [pets, selectedPetId]
  )
  const selectedService = useMemo(
    () => services.find((service) => service.serviceId === selectedServiceId) ?? services[0] ?? null,
    [services, selectedServiceId]
  )
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.time === selectedTime) ?? null,
    [slots, selectedTime]
  )
  const availableSlots = useMemo(() => slots.filter((slot) => slot.available), [slots])
  const bookingDateLabel = formatDateLabel(selectedDate)
  const totalAmount = selectedService?.appliedPrice ?? 0
  const [totalValue, totalCurrency] = formatMoney(totalAmount).split(" ")
  const canSubmit = Boolean(selectedPet && selectedService && selectedSlot?.available && !isSubmitting)

  async function handleSubmit() {
    if (!selectedPet || !selectedService || !selectedSlot?.available) {
      setErrorMessage("Vui lòng chọn đầy đủ thú cưng, dịch vụ và khung giờ còn trống")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const ticket = await spaApi.createTicket({
        petId: selectedPet.id,
        serviceId: selectedService.serviceId,
        scheduledAt: buildScheduledAt(selectedDate, selectedTime),
        specialRequest: specialRequest.trim() || null,
        paymentOption: paymentMethod,
      })

      if (ticket.paymentOption === "online") {
        if (ticket.paymentUrl) {
          window.location.assign(ticket.paymentUrl)
          return
        }

        setErrorMessage("Cổng thanh toán online chưa sẵn sàng. Vui lòng chọn thanh toán tại trung tâm.")
        return
      }

      setSuccessTicket(ticket)
      setSuccessDialogOpen(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tạo yêu cầu dịch vụ spa")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-[1280px] space-y-8">
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

      {errorMessage ? <BookingError message={errorMessage} /> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <BookingSection number="1" title="Chọn thú cưng">
            {isLoadingOptions && pets.length === 0 ? (
              <SelectionSkeleton />
            ) : pets.length > 0 && selectedPetId ? (
              <OwnerSpaPetDropdown
                pets={pets}
                selectedPetId={selectedPetId}
                open={petDropdownOpen}
                onOpenChange={setPetDropdownOpen}
                onSelect={setSelectedPetId}
              />
            ) : (
              <p className="text-sm leading-5 text-[#3E4946]">Bạn chưa có hồ sơ thú cưng khả dụng để đặt dịch vụ.</p>
            )}
          </BookingSection>

          <BookingSection number="2" title="Chọn gói dịch vụ">
            <div className="space-y-3">
              {isLoadingOptions && services.length === 0 ? (
                <>
                  <ServiceOptionSkeleton />
                  <ServiceOptionSkeleton />
                  <ServiceOptionSkeleton />
                </>
              ) : services.length > 0 ? (
                services.map((service) => {
                  const selected = service.serviceId === selectedServiceId

                  return (
                    <button
                      key={service.serviceId}
                      type="button"
                      onClick={() => setSelectedServiceId(service.serviceId)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-[17px] py-[17px] text-left",
                        selected
                          ? "border-2 border-[#005E53] bg-[rgba(0,94,83,0.05)] py-[16px]"
                          : "border-[#BDC9C5] bg-white"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={cn("flex rounded-full border", selected ? "size-[22px] items-center justify-center border-transparent bg-[#005E53]" : "size-5 border-[#6E7A76] bg-white")}>
                          {selected ? <Check className="size-3.5 text-white" aria-hidden="true" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className={cn("block truncate text-sm leading-5 text-[#1B1C15]", selected ? "font-bold" : "font-medium")}>
                            {service.serviceName}
                          </span>
                          <span className="block text-xs leading-4 text-[#3E4946]">{service.appliedPricingConditionLabel}</span>
                        </span>
                      </span>
                      <span className={cn("shrink-0 pl-4 text-sm leading-5", selected ? "font-bold text-[#005E53]" : "font-normal text-[#3E4946]")}>
                        {formatMoney(service.appliedPrice)}
                      </span>
                    </button>
                  )
                })
              ) : (
                <p className="text-sm leading-5 text-[#3E4946]">Chưa có dịch vụ phù hợp với thú cưng đã chọn.</p>
              )}
            </div>
          </BookingSection>

          <BookingSection number="3" title="Thời gian dự kiến">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium leading-4 text-[#3E4946]">Chọn ngày</p>
                <div className="relative w-full">
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
                    min={getTodayDateInputValue()}
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="pointer-events-none absolute inset-0 h-11 w-full opacity-0"
                    aria-label="Chọn ngày đặt dịch vụ"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium leading-4 text-[#3E4946]">Chọn giờ</p>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                    disabled={isLoadingSlots || availableSlots.length === 0}
                    className="flex h-11 w-full items-center justify-between rounded-lg border border-[#BDC9C5] bg-[#FBFAEE] px-[17px] text-left text-sm leading-5 text-[#1B1C15] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>{isLoadingSlots ? "Đang tải..." : availableSlots.length > 0 ? selectedTime : "Hết lịch"}</span>
                    <ChevronDown className="size-4 text-[#3E4946]" aria-hidden="true" />
                  </button>

                  {timeDropdownOpen ? (
                    <div className="absolute left-0 top-[50px] z-20 max-h-[260px] w-full overflow-y-auto rounded-xl border border-[#BDC9C5] bg-white p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                      {slots.map((slot) => {
                        const selected = slot.time === selectedTime

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => {
                              setSelectedTime(slot.time)
                              setTimeDropdownOpen(false)
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm leading-5 hover:bg-[#FBFAEE] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                              selected ? "font-bold text-[#005E53]" : "font-normal text-[#1B1C15]"
                            )}
                          >
                            <span>{slot.time}</span>
                            <span className="flex items-center gap-2 text-xs text-[#3E4946]">
                              {slot.available ? `Còn ${slot.availableUnits}` : "Đầy"}
                              {selected ? <Check className="size-4 text-[#005E53]" aria-hidden="true" /> : null}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </BookingSection>

          <BookingSection number="4" title="Yêu cầu đặc biệt">
            <Textarea
              value={specialRequest}
              onChange={(event) => setSpecialRequest(event.target.value)}
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
              <SummaryRow label="Thú cưng" value={selectedPet?.name ?? "-"} />
              <SummaryRow label="Dịch vụ" value={selectedService?.serviceName ?? "-"} />
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
                  {paymentMethod === "online" ? "Chờ thanh toán" : "Chờ tiếp nhận"}
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
              <Button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="h-10 w-full rounded-lg bg-[#FEA619] text-xs font-bold leading-4 text-[#684000] hover:bg-[#F59E0B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : null}
                Đặt dịch vụ
              </Button>
              <Button asChild variant="outline" className="h-11 w-full rounded-lg border-[#6E7A76] text-xs font-medium leading-4 text-[#1B1C15] hover:bg-[#FBFAEE]">
                <Link href="/owner/spa">Hủy</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <OwnerSpaBookingSuccessDialog
        open={successDialogOpen}
        ticket={successTicket}
        onOpenChange={setSuccessDialogOpen}
      />
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

function BookingError({ message }: { message: string }) {
  return (
    <section className="flex items-start gap-3 rounded-xl border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-5">{message}</p>
    </section>
  )
}

function SelectionSkeleton() {
  return <div className="h-[76px] w-full max-w-[448px] animate-pulse rounded-xl bg-[#F5F4E8]" />
}

function ServiceOptionSkeleton() {
  return <div className="h-[60px] w-full animate-pulse rounded-lg border border-[#BDC9C5] bg-[#F5F4E8]" />
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

function mapBookingPetToDropdownPet(pet: GroomingBookingPet): OwnerSpaPet {
  return {
    id: pet.petId,
    name: pet.petName,
    species: pet.speciesLabel,
    weightKg: pet.weightKg ?? 0,
    avatarUrl: pet.profileImageUrl ?? undefined,
    fallbackInitial: pet.petName.charAt(0),
  }
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}

function getTodayDateInputValue() {
  const today = new Date()
  return toDateInputValue(today)
}

function getTomorrowDateInputValue() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return toDateInputValue(tomorrow)
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function buildScheduledAt(date: string, time: string) {
  return `${date}T${time}:00+07:00`
}
