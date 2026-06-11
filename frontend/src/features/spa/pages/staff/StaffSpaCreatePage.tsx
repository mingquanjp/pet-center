"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  PawPrint,
  Plus,
  Search,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { spaApi } from "../../api/spa.api"
import type {
  GroomingAvailabilitySlot,
  GroomingBookingService,
  StaffCounterGroomingOptions,
  StaffCounterGroomingPet,
} from "../../types/spa.types"

const staffCounterPetLimit = 10

function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value)
}

function toDateInputValue(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  return `${year}-${month}-${day}`
}

function getDefaultBookingDate(): string {
  const nextDay = new Date()
  nextDay.setDate(nextDay.getDate() + 1)

  return toDateInputValue(nextDay)
}

function buildScheduledAt(date: string, time: string): string {
  return new Date(`${date}T${time}:00+07:00`).toISOString()
}

function formatDisplayDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+07:00`))
}

function StepHeading({ index, title, active = false }: { index: number; title: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full text-sm font-bold leading-5",
          active ? "bg-[#00796b] text-white" : "bg-[#e4e3d7] text-[#3e4946]"
        )}
      >
        {index}
      </span>
      <h2 className="text-xl font-semibold leading-7 text-[#1b1c15]">{title}</h2>
    </div>
  )
}

function PetAvatar({ pet }: { pet: StaffCounterGroomingPet }) {
  return (
    <Avatar className="size-10 shrink-0">
      {pet.profileImageUrl ? <AvatarImage src={pet.profileImageUrl} alt={pet.petName} /> : null}
      <AvatarFallback className="bg-petcenter-background text-petcenter-primary">
        <PawPrint className="size-5" aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  )
}

function PetOption({
  pet,
  selected,
  onSelect,
}: {
  pet: StaffCounterGroomingPet
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center rounded-[12px] border p-[17px] text-left transition-colors",
        selected ? "border-2 border-[#005e53] bg-[#f5f4e8] p-4" : "border-[#e4e3d7] bg-white hover:border-[#bdc9c5]"
      )}
    >
      <div className="mr-4 shrink-0">
        <PetAvatar pet={pet} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-base font-bold leading-6 text-[#1b1c15]">{pet.petName}</p>
          <p className="shrink-0 text-xs leading-4 text-[#3e4946]">{pet.petId}</p>
        </div>
        <p className="truncate text-sm leading-5 text-[#3e4946]">
          {pet.speciesLabel} / {pet.breed ?? "Chưa cập nhật giống"} • {pet.ownerName}
          {pet.ownerPhoneNumber ? ` • ${pet.ownerPhoneNumber}` : ""}
        </p>
      </div>
      {selected ? <Check className="ml-4 size-5 shrink-0 text-[#00796b]" /> : null}
    </button>
  )
}

function buildPetSubtitle(pet: StaffCounterGroomingPet) {
  return [pet.speciesLabel, pet.breed ?? "Chưa cập nhật giống", pet.ownerName, pet.ownerPhoneNumber]
    .filter(Boolean)
    .join(" • ")
}

function StaffPetDropdownSelection({
  isLoading,
  onSearchChange,
  onSelect,
  pets,
  searchQuery,
  selectedPet,
}: {
  isLoading: boolean
  onSearchChange: (value: string) => void
  onSelect: (petId: string) => void
  pets: StaffCounterGroomingPet[]
  searchQuery: string
  selectedPet: StaffCounterGroomingPet | null
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <fieldset aria-label="Chọn thú cưng">
      {selectedPet ? (
        <div className="relative w-full max-w-[560px]">
          <p className="mb-2 label-md text-petcenter-text-secondary">Thú cưng</p>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-[52px] w-full items-center gap-3 rounded-xl border border-petcenter-border bg-petcenter-filter px-[17px] text-left transition-colors hover:bg-petcenter-background"
          >
            <PetAvatar pet={selectedPet} />
            <span className="min-w-0 flex-1">
              <span className="block truncate body-md font-medium text-petcenter-text">{selectedPet.petName}</span>
              <span className="block truncate body-sm text-petcenter-text-secondary">
                {buildPetSubtitle(selectedPet)}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-petcenter-text-secondary" aria-hidden="true" />
          </button>

          {open ? (
            <div className="absolute left-0 top-[78px] z-20 w-full overflow-hidden rounded-2xl border border-petcenter-border-strong bg-petcenter-card shadow-modal">
              <div className="border-b border-petcenter-border bg-petcenter-card p-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-petcenter-text-secondary"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Tìm thú cưng..."
                    className="h-10 w-full rounded-lg border border-petcenter-border bg-petcenter-filter pl-9 pr-3 body-sm text-petcenter-text outline-none placeholder:text-petcenter-text-muted focus:border-petcenter-primary"
                  />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {isLoading && pets.length === 0 ? (
                  <p className="px-3 py-4 body-sm text-petcenter-text-secondary">Đang tải thú cưng...</p>
                ) : null}
                {pets.map((pet) => {
                  const selected = pet.petId === selectedPet.petId

                  return (
                    <button
                      key={pet.petId}
                      type="button"
                      onClick={() => {
                        onSelect(pet.petId)
                        setOpen(false)
                        onSearchChange("")
                      }}
                      className="flex w-full items-center gap-3 border-b border-petcenter-border px-3 py-3 text-left transition-colors hover:bg-petcenter-filter"
                    >
                      <PetAvatar pet={pet} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate body-md text-petcenter-text",
                            selected ? "font-bold" : "font-normal"
                          )}
                        >
                          {pet.petName}
                        </span>
                        <span className="block truncate body-sm text-petcenter-text-secondary">
                          {buildPetSubtitle(pet)}
                        </span>
                      </span>
                      {selected ? <Check className="size-4 shrink-0 text-petcenter-primary" aria-hidden="true" /> : null}
                    </button>
                  )
                })}
                {!isLoading && pets.length === 0 ? (
                  <p className="px-3 py-4 body-sm text-petcenter-text-secondary">
                    Không tìm thấy thú cưng phù hợp.
                  </p>
                ) : null}
              </div>
              <Button
                asChild
                type="button"
                variant="ghost"
                className="h-[42px] w-full justify-start rounded-none border-t border-petcenter-border px-3 body-sm font-normal text-petcenter-text-secondary hover:bg-petcenter-filter"
              >
                <Link href="/staff/pets/create">+ Thêm hồ sơ thú cưng</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="body-md text-petcenter-text-secondary">
            Chưa có hồ sơ thú cưng phù hợp để tạo yêu cầu spa.
          </p>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-dashed border-petcenter-primary text-petcenter-primary hover:bg-petcenter-filter"
          >
            <Link href="/staff/pets/create">
              <Plus className="size-4" />
              Thêm hồ sơ thú cưng
            </Link>
          </Button>
        </div>
      )}
    </fieldset>
  )
}

function ServiceOption({
  service,
  selected,
  onSelect,
}: {
  service: GroomingBookingService
  selected: boolean
  onSelect: () => void
}) {
  const isPopular = service.serviceName.toLowerCase().includes("spa") || service.serviceName.toLowerCase().includes("combo")

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex min-h-[116px] flex-col items-start rounded-[12px] border p-[17px] text-left transition-colors",
        selected ? "border-2 border-[#005e53] bg-[#f5f4e8] p-4" : "border-[#e4e3d7] bg-white hover:border-[#bdc9c5]"
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <p className="text-base font-semibold leading-6 text-[#1b1c15]">{service.serviceName}</p>
        {isPopular ? (
          <span className="rounded-full bg-[#fff3d8] px-2 py-0.5 text-[11px] font-medium leading-4 text-[#b45309]">
            Phổ biến
          </span>
        ) : null}
      </div>
      <p className="mt-1 flex items-center gap-1 text-sm leading-5 text-[#3e4946]">
        <Clock3 className="size-3.5" />
        {service.durationText}
      </p>
      <p className="mt-auto text-base font-bold leading-6 text-[#005e53]">{formatMoney(service.appliedPrice)} VNĐ</p>
      {selected ? <Check className="absolute right-3 top-3 size-5 text-[#00796b]" /> : null}
    </button>
  )
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm leading-5">
      <p className="max-w-[120px] text-[#3e4946]">{label}</p>
      <div className="min-w-0 text-right text-[#1b1c15]">{children}</div>
    </div>
  )
}

export function StaffSpaCreatePage() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [selectedPetId, setSelectedPetId] = React.useState("")
  const [selectedServiceId, setSelectedServiceId] = React.useState("")
  const [selectedDate, setSelectedDate] = React.useState(getDefaultBookingDate)
  const [selectedTime, setSelectedTime] = React.useState("")
  const [timeDropdownOpen, setTimeDropdownOpen] = React.useState(false)
  const [specialRequest, setSpecialRequest] = React.useState("")
  const [options, setOptions] = React.useState<StaffCounterGroomingOptions | null>(null)
  const [availability, setAvailability] = React.useState<GroomingAvailabilitySlot[]>([])
  const [isOptionsLoading, setIsOptionsLoading] = React.useState(true)
  const [isAvailabilityLoading, setIsAvailabilityLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    const timeoutId = window.setTimeout(() => {
      setIsOptionsLoading(true)

      spaApi
        .getStaffCounterOptions({
          petId: selectedPetId || undefined,
          search: query,
          limit: staffCounterPetLimit,
        })
        .then((nextOptions) => {
          if (!isMounted) return

          setOptions(nextOptions)
          setErrorMessage(null)

          const nextPetId = nextOptions.selectedPet?.petId ?? nextOptions.pets[0]?.petId ?? ""
          if (!selectedPetId && nextPetId) {
            setSelectedPetId(nextPetId)
          }

          setSelectedServiceId((currentServiceId) => {
            const hasSelectedService = nextOptions.services.some((service) => service.serviceId === currentServiceId)

            return hasSelectedService ? currentServiceId : nextOptions.services[0]?.serviceId ?? ""
          })
        })
        .catch((error) => {
          if (!isMounted) return
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải dữ liệu tạo yêu cầu spa")
        })
        .finally(() => {
          if (isMounted) {
            setIsOptionsLoading(false)
          }
        })
    }, 250)

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
    }
  }, [query, selectedPetId])

  React.useEffect(() => {
    let isMounted = true

    spaApi
      .getStaffCounterAvailability(selectedDate)
      .then((data) => {
        if (!isMounted) return

        setAvailability(data.slots)
        setSelectedTime((currentTime) => {
          const selectedSlot = data.slots.find((slot) => slot.time === currentTime)
          const firstAvailableSlot = data.slots.find((slot) => slot.available)

          return selectedSlot?.available ? currentTime : firstAvailableSlot?.time ?? ""
        })
      })
      .catch((error) => {
        if (!isMounted) return
        setErrorMessage(error instanceof Error ? error.message : "Không thể tải khung giờ trống")
      })
      .finally(() => {
        if (isMounted) {
          setIsAvailabilityLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  const selectedPet =
    options?.selectedPet ??
    options?.pets.find((pet) => pet.petId === selectedPetId) ??
    null
  const petDropdownOptions = React.useMemo(() => {
    const petMap = new Map<string, StaffCounterGroomingPet>()

    if (selectedPet) {
      petMap.set(selectedPet.petId, selectedPet)
    }

    options?.pets.forEach((pet) => {
      petMap.set(pet.petId, pet)
    })

    return Array.from(petMap.values())
  }, [options?.pets, selectedPet])
  const selectedService = options?.services.find((service) => service.serviceId === selectedServiceId) ?? null
  const formattedDate = formatDisplayDate(selectedDate)
  const availableSlots = availability.filter((slot) => slot.available)
  const canSubmit = Boolean(selectedPet && selectedService && selectedTime && !isSubmitting)

  function handleDateChange(value: string) {
    setIsAvailabilityLoading(true)
    setTimeDropdownOpen(false)
    setSelectedDate(value)
  }

  async function handleCreateRequest() {
    if (!selectedPet || !selectedService || !selectedTime) {
      const message = "Vui lòng chọn đủ thú cưng, dịch vụ và khung giờ."
      setErrorMessage(message)
      toast.error(message)
      return
    }

    setIsSubmitting(true)

    try {
      await spaApi.createStaffCounterTicket({
        petId: selectedPet.petId,
        serviceId: selectedService.serviceId,
        scheduledAt: buildScheduledAt(selectedDate, selectedTime),
        specialRequest: specialRequest || null,
      })

      toast.success("Tạo yêu cầu spa tại quầy thành công")
      router.push("/staff/spa")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo yêu cầu spa"
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-8 pb-12">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-3 text-sm leading-5">
            <Link href="/staff/spa" className="text-[#3e4946] hover:text-[#005e53]">
              Dịch vụ spa
            </Link>
            <ChevronRight className="size-3 text-[#3e4946]" />
            <span className="font-medium text-[#1b1c15]">Tạo yêu cầu spa</span>
          </nav>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-[12px] border-[#bdc9c5] bg-transparent px-[17px] text-sm font-medium text-[#005e53] hover:bg-[#f5f4e8] hover:text-[#005e53]"
          >
            <Link href="/staff/spa">
              <ArrowLeft className="size-3.5" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
        <h1 className="text-[30px] font-bold leading-9 tracking-[-0.75px] text-[#1b1c15]">Tạo yêu cầu spa</h1>
      </section>

      {errorMessage ? (
        <div className="rounded-[12px] border border-[#fde2e2] bg-white px-4 py-3 text-sm text-[#b91c1c]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_392px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0px_4px_8px_rgba(31,38,31,0.05)]">
            <div className="flex flex-col gap-4">
              <StepHeading index={1} title="Chọn thú cưng" active />
              <StaffPetDropdownSelection
                isLoading={isOptionsLoading}
                pets={petDropdownOptions}
                searchQuery={query}
                selectedPet={selectedPet}
                onSearchChange={setQuery}
                onSelect={setSelectedPetId}
              />
              <div className="hidden">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#3e4946]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-[50px] rounded-[12px] border-[#bdc9c5] bg-[#fbfaee] pl-12 text-base text-[#1b1c15] shadow-none placeholder:text-[#6e7a76] focus-visible:ring-[#005e53]"
                  placeholder="Tìm theo tên thú cưng, mã hồ sơ, chủ nuôi hoặc SĐT..."
                />
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <div className="relative">
                  <select
                    value={selectedPetId}
                    disabled={isOptionsLoading || petDropdownOptions.length === 0}
                    onChange={(event) => setSelectedPetId(event.target.value)}
                    className="h-[54px] w-full appearance-none rounded-[12px] border border-[#bdc9c5] bg-[#fbfaee] px-4 pr-12 text-base text-[#1b1c15] shadow-none outline-none transition-colors focus:border-[#005e53] focus:ring-2 focus:ring-[#005e53]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isOptionsLoading && !options ? <option value="">Đang tải thú cưng...</option> : null}
                    {!isOptionsLoading && petDropdownOptions.length === 0 ? (
                      <option value="">Không tìm thấy thú cưng phù hợp</option>
                    ) : null}
                    {petDropdownOptions.map((pet) => (
                      <option key={pet.petId} value={pet.petId}>
                        {pet.petName} - {pet.speciesLabel} / {pet.breed ?? "Chưa cập nhật giống"} - {pet.ownerName}
                        {pet.ownerPhoneNumber ? ` - ${pet.ownerPhoneNumber}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#3e4946]" />
                </div>
                {selectedPet ? <PetOption pet={selectedPet} selected onSelect={() => undefined} /> : null}
                <div className="hidden">
                {isOptionsLoading && !options ? (
                  <div className="h-[82px] animate-pulse rounded-[12px] border border-[#e4e3d7] bg-[#f5f4e8]" />
                ) : null}
                {options?.pets.map((pet) => (
                  <PetOption
                    key={pet.petId}
                    pet={pet}
                    selected={pet.petId === selectedPetId}
                    onSelect={() => setSelectedPetId(pet.petId)}
                  />
                ))}
                {!isOptionsLoading && options?.pets.length === 0 ? (
                  <div className="rounded-[12px] border border-[#e4e3d7] bg-white p-4 text-sm text-[#3e4946]">
                    Không tìm thấy thú cưng phù hợp.
                  </div>
                ) : null}
                </div>
                <button
                  type="button"
                  className="flex h-[54px] items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#005e53] text-base font-medium leading-6 text-[#005e53] hover:bg-[#f5f4e8]"
                >
                  <Plus className="size-4" />
                  Tạo hồ sơ thú cưng
                </button>
              </div>
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0px_4px_8px_rgba(31,38,31,0.05)]">
            <div className="flex flex-col gap-4">
              <StepHeading index={2} title="Chọn dịch vụ spa" />
              {selectedPet?.weightKg === null ? (
                <div className="rounded-[12px] border border-[#fff3d8] bg-[#fffbeb] p-4 text-sm leading-5 text-[#b45309]">
                  Thú cưng này chưa có cân nặng, cần cập nhật cân nặng trước khi tính giá dịch vụ.
                </div>
              ) : null}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {options?.services.map((service) => (
                  <ServiceOption
                    key={service.serviceId}
                    service={service}
                    selected={service.serviceId === selectedServiceId}
                    onSelect={() => setSelectedServiceId(service.serviceId)}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0px_4px_8px_rgba(31,38,31,0.05)]">
            <div className="flex flex-col gap-4">
              <StepHeading index={3} title="Chọn thời gian" />
              <div className="grid gap-6 md:grid-cols-[minmax(220px,1fr)_minmax(260px,1.1fr)]">
                <label className="flex flex-col gap-2 text-sm font-medium leading-5 text-[#1b1c15]">
                  Ngày dự kiến
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#3e4946]" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => handleDateChange(event.target.value)}
                      className="h-12 rounded-[12px] border-[#bdc9c5] bg-[#fbfaee] pl-12 text-base text-[#1b1c15] shadow-none focus-visible:ring-[#005e53]"
                    />
                  </div>
                </label>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium leading-5 text-[#1b1c15]">Giờ trống ({formattedDate})</p>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#3e4946]" />
                    <button
                      type="button"
                      id="spa-time-slot"
                      disabled={isAvailabilityLoading || availableSlots.length === 0}
                      onClick={() => setTimeDropdownOpen((open) => !open)}
                      className="flex h-12 w-full items-center justify-between rounded-[12px] border border-[#bdc9c5] bg-[#fbfaee] pl-12 pr-4 text-left text-base text-[#1b1c15] shadow-none outline-none transition-colors focus:border-[#005e53] focus:ring-2 focus:ring-[#005e53]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>
                        {isAvailabilityLoading
                          ? "Đang tải khung giờ..."
                          : availableSlots.length > 0 && selectedTime
                            ? selectedTime
                            : "Không có khung giờ trống"}
                      </span>
                      <ChevronDown className="size-4 text-[#3e4946]" aria-hidden="true" />
                    </button>

                    {timeDropdownOpen ? (
                      <div className="absolute left-0 top-[56px] z-20 max-h-[260px] w-full overflow-y-auto rounded-xl border border-[#bdc9c5] bg-white p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                        {availability.map((slot) => {
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
                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm leading-5 hover:bg-[#fbfaee] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                                selected ? "font-bold text-[#005e53]" : "font-normal text-[#1b1c15]"
                              )}
                            >
                              <span>{slot.time}</span>
                              <span className="flex items-center gap-2 text-xs text-[#3e4946]">
                                {slot.available ? `Còn ${slot.availableUnits}` : "Đầy"}
                                {selected ? <Check className="size-4 text-[#005e53]" aria-hidden="true" /> : null}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0px_4px_8px_rgba(31,38,31,0.05)]">
            <div className="flex flex-col gap-4">
              <StepHeading index={4} title="Yêu cầu đặc biệt (Không bắt buộc)" />
              <Textarea
                value={specialRequest}
                onChange={(event) => setSpecialRequest(event.target.value)}
                className="min-h-[108px] resize-none rounded-[12px] border-[#bdc9c5] bg-[#fbfaee] p-4 text-base leading-6 text-[#1b1c15] shadow-none placeholder:text-[#6e7a76] focus-visible:ring-[#005e53]"
                placeholder="Ví dụ: Không dùng sữa tắm có mùi mạnh..."
              />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-0 xl:self-start">
          <section className="relative overflow-hidden rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0px_4px_16px_rgba(31,38,31,0.05)]">
            <div className="relative z-10 flex flex-col gap-4">
              <h2 className="border-b border-[#e4e3d7] pb-[13px] text-lg font-bold leading-7 text-[#1b1c15]">
                Thông tin yêu cầu
              </h2>
              <SummaryRow label="Khách hàng / Thú cưng">
                <p className="font-semibold">
                  {selectedPet ? `${selectedPet.petName} (${selectedPet.breed ?? selectedPet.speciesLabel})` : "Chưa chọn"}
                </p>
                <p className="text-[#3e4946]">{selectedPet?.ownerName ?? ""}</p>
              </SummaryRow>
              <SummaryRow label="Dịch vụ">
                <p className="font-semibold">{selectedService?.serviceName ?? "Chưa chọn"}</p>
              </SummaryRow>
              <SummaryRow label="Thời gian">
                <p className="font-semibold">{selectedTime || "Chưa chọn"}</p>
                <p className="text-[#3e4946]">{formattedDate}</p>
              </SummaryRow>
              <div className="flex items-center justify-between gap-4 pt-2">
                <p className="text-sm leading-5 text-[#3e4946]">Trạng thái</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff3d8] px-2.5 py-1 text-xs font-medium leading-4 text-[#b45309]">
                  <span className="size-1.5 rounded-full bg-[#b45309]" />
                  Chờ tiếp nhận
                </span>
              </div>
            </div>
            <div className="absolute right-[-40px] top-[-40px] size-32 rounded-full bg-[#00796b]/20 blur-[20px]" />
          </section>

          <section className="rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0px_4px_8px_rgba(31,38,31,0.05)]">
            <div className="flex flex-col gap-4">
              <h2 className="border-b border-[#e4e3d7] pb-[13px] text-lg font-bold leading-7 text-[#1b1c15]">
                Thanh toán
              </h2>
              <div className="flex items-center rounded-[12px] border border-[#005e53] bg-[#f5f4e8] px-3 py-[13px]">
                <CircleDot className="mr-3 size-[18px] text-[#005e53]" />
                <p className="text-sm font-medium leading-5 text-[#1b1c15]">Thanh toán tại trung tâm</p>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-[#e4e3d7] pt-[17px]">
                <p className="text-base font-medium leading-6 text-[#3e4946]">Tổng cộng</p>
                <p className="text-xl font-bold leading-7 text-[#fea619]">
                  {selectedService ? `${formatMoney(selectedService.appliedPrice)} VNĐ` : "0 VNĐ"}
                </p>
              </div>
            </div>
          </section>

          <div className="flex justify-center gap-4">
            <Button
              asChild
              variant="outline"
              className="h-[52px] min-w-[100px] rounded-[12px] border-[#bdc9c5] bg-transparent px-[17px] text-base font-medium text-[#1b1c15] hover:bg-[#f5f4e8]"
            >
              <Link href="/staff/spa">Hủy</Link>
            </Button>
            <Button
              type="button"
              disabled={!canSubmit}
              onClick={() => void handleCreateRequest()}
              className="h-[52px] min-w-[166px] rounded-[12px] bg-[#fea619] px-4 text-base font-medium text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#f59e0b] disabled:opacity-60"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo yêu cầu"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
