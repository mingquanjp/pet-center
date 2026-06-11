"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  PawPrint,
  WalletCards,
  Search
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { boardingApi } from "../../api/boarding.api"
import type {
  BoardingBookingPet,
  BoardingPaymentOption,
  BoardingRecordCreated,
  BoardingRoomTypeBooking,
} from "../../types/boarding.types"

const popularRoomKeywords = ["vip", "cao cấp"]

export function OwnerBoardingBookingPage() {
  const router = useRouter()
  const defaultTimes = React.useMemo(() => getDefaultBookingTimes(), [])
  const [pets, setPets] = React.useState<BoardingBookingPet[]>([])
  const [roomOptions, setRoomOptions] = React.useState<BoardingRoomTypeBooking[]>([])
  const [selectedPetId, setSelectedPetId] = React.useState<string | null>(null)
  const [petDropdownOpen, setPetDropdownOpen] = React.useState(false)
  const [petSearchQuery, setPetSearchQuery] = React.useState("")
  const [checkInAt, setCheckInAt] = React.useState(defaultTimes.checkInAt)
  const [checkOutAt, setCheckOutAt] = React.useState(defaultTimes.checkOutAt)
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null)
  const [specialRequest, setSpecialRequest] = React.useState("")
  const [paymentOption, setPaymentOption] = React.useState<BoardingPaymentOption>("counter")
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [successRecord, setSuccessRecord] = React.useState<BoardingRecordCreated | null>(null)

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadBookingOptions() {
      if (!isValidDateTimeInput(checkInAt) || !isValidDateTimeInput(checkOutAt)) {
        const message = "Vui lòng chọn đầy đủ thời gian nhận phòng và trả phòng"
        setErrorMessage(message)
        toast.error(message)
        setIsLoadingOptions(false)
        return
      }

      try {
        setIsLoadingOptions(true)
        setErrorMessage(null)

        const options = await boardingApi.getBookingOptions(
          {
            petId: selectedPetId ?? undefined,
            plannedCheckInAt: toApiDateTime(checkInAt),
            plannedCheckOutAt: toApiDateTime(checkOutAt),
          },
          { signal: abortController.signal }
        )

        if (abortController.signal.aborted) {
          return
        }

        setPets(options.pets)
        setRoomOptions(options.roomTypes)
        setSelectedPetId(options.selectedPet?.petId ?? options.pets[0]?.petId ?? null)
        setSelectedRoomId((previousRoomId) => {
          const currentRoom = previousRoomId
            ? options.roomTypes.find((room) => room.roomTypeId === previousRoomId)
            : undefined

          return (currentRoom ?? options.roomTypes.find((room) => room.available) ?? options.roomTypes[0] ?? null)?.roomTypeId ?? null
        })
      } catch (error) {
        if (!abortController.signal.aborted) {
          setPets([])
          setRoomOptions([])
          const message = error instanceof Error ? error.message : "Không thể tải thông tin đặt phòng lưu trú"
          setErrorMessage(message)
          toast.error(message)
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
  }, [checkInAt, checkOutAt, selectedPetId])

  const selectedPet = React.useMemo(
    () => pets.find((pet) => pet.petId === selectedPetId) ?? pets[0] ?? null,
    [pets, selectedPetId]
  )
  const selectedRoom = React.useMemo(
    () => roomOptions.find((room) => room.roomTypeId === selectedRoomId) ?? roomOptions[0] ?? null,
    [roomOptions, selectedRoomId]
  )
  const filteredPets = React.useMemo(() => {
    return pets.filter((pet) =>
      pet.petName.toLowerCase().includes(petSearchQuery.toLowerCase())
    )
  }, [pets, petSearchQuery])

  const nights = selectedRoom?.nights ?? calculateNights(checkInAt, checkOutAt)
  const totalAmount = selectedRoom?.estimatedTotal ?? 0
  const canSubmit = Boolean(selectedPet && selectedRoom?.available && !isSubmitting)

  async function handleSubmit() {
    if (!selectedPet || !selectedRoom) {
      const message = "Vui lòng chọn thú cưng và loại phòng lưu trú"
      setErrorMessage(message)
      toast.error(message)
      return
    }

    if (!isValidDateTimeInput(checkInAt) || !isValidDateTimeInput(checkOutAt)) {
      const message = "Vui lòng chọn đầy đủ thời gian nhận phòng và trả phòng"
      setErrorMessage(message)
      toast.error(message)
      return
    }

    if (!selectedRoom.available) {
      const message = "Loại phòng này đã hết chỗ trong khoảng thời gian đã chọn"
      setErrorMessage(message)
      toast.error(message)
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const record = await boardingApi.createRecord({
        petId: selectedPet.petId,
        roomTypeId: selectedRoom.roomTypeId,
        plannedCheckInAt: toApiDateTime(checkInAt),
        plannedCheckOutAt: toApiDateTime(checkOutAt),
        careRequest: specialRequest.trim() || null,
        paymentOption,
      })

      if (record.paymentOption === "online") {
        if (record.paymentUrl) {
          window.location.assign(record.paymentUrl)
          return
        }

        const message = "Cổng thanh toán online chưa sẵn sàng. Vui lòng chọn thanh toán tại trung tâm."
        setErrorMessage(message)
        toast.error(message)
        return
      }

      setSuccessRecord(record)
      toast.success("Tạo yêu cầu đặt phòng lưu trú thành công")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo yêu cầu đặt phòng lưu trú"
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

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

      {errorMessage ? <BookingError message={errorMessage} /> : null}
      <BookingSuccessDialog
        record={successRecord}
        onBackToList={() => router.push("/owner/boarding")}
        onClose={() => setSuccessRecord(null)}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-xl border border-[rgba(189,201,197,0.3)] bg-white px-[25px] pb-[41px] pt-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <h2 className="border-b border-[rgba(189,201,197,0.3)] pb-[17px] text-lg font-semibold leading-[26px] text-[#1B1C15]">
            Thông tin đặt phòng
          </h2>

          <div className="mt-6 flex flex-col gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-medium leading-4 text-[#3E4946]">Chọn thú cưng</label>
              <div className="relative max-w-[448px]">
                {isLoadingOptions && pets.length === 0 ? (
                  <div className="h-[52px] animate-pulse rounded-xl bg-[#EFEEE2]" />
                ) : selectedPet ? (
                <button
                  type="button"
                  className="flex h-[52px] w-full items-center gap-3 rounded-xl border border-[#E6E8DD] bg-[#FBFAEE] px-[17px] text-left transition hover:border-[#BDC9C5]"
                  onClick={() => {
                    setPetDropdownOpen((current) => !current)
                    if (petDropdownOpen) setPetSearchQuery("")
                  }}
                >
                  <PetAvatar pet={selectedPet} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium leading-[17.5px] text-[#1B1C15]">
                      {selectedPet.petName}
                    </span>
                    <span className="block truncate text-[13px] leading-[16.25px] text-[#3E4946]">
                      {selectedPet.speciesLabel} • {formatWeight(selectedPet.weightKg)}
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-[#1B1C15]" aria-hidden="true" />
                </button>
                ) : (
                  <p className="rounded-xl border border-[#E6E8DD] bg-[#FBFAEE] px-4 py-3 text-sm text-[#3E4946]">
                    Bạn chưa có hồ sơ thú cưng khả dụng để đặt phòng.
                  </p>
                )}

                {petDropdownOpen ? (
                  <div className="absolute left-0 top-[60px] z-20 w-full overflow-hidden rounded-xl border border-[#BDC9C5] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                    <div className="border-b border-[#BDC9C5] p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8D9693]" aria-hidden="true" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm thú cưng..."
                          value={petSearchQuery}
                          onChange={(e) => setPetSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-[#E6E8DD] bg-[#FBFAEE] py-2.5 pl-9 pr-3 text-sm text-[#1B1C15] placeholder:text-[#8D9693] focus:border-[#005E53] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredPets.length > 0 ? (
                        filteredPets.map((pet) => {
                          const selected = pet.petId === selectedPetId
                          return (
                            <button
                              key={pet.petId}
                              type="button"
                              className="flex w-full items-center gap-3 border-b border-[rgba(189,201,197,0.3)] px-3 py-3 text-left transition hover:bg-[#FBFAEE]"
                              onClick={() => {
                                setSelectedPetId(pet.petId)
                                setPetDropdownOpen(false)
                                setPetSearchQuery("")
                              }}
                            >
                              <PetAvatar pet={pet} size="sm" />
                              <span className="min-w-0 flex-1">
                                <span className={cn("block truncate text-sm leading-5 text-[#1B1C15]", selected ? "font-bold" : "font-normal")}>
                                  {pet.petName}
                                </span>
                                <span className="block truncate text-[13px] leading-[18px] text-[#3E4946]">
                                  {pet.speciesLabel} • {formatWeight(pet.weightKg)}
                                </span>
                              </span>
                              {selected ? <Check className="size-4 shrink-0 text-[#005E53]" aria-hidden="true" /> : null}
                            </button>
                          )
                        })
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-[#8D9693]">
                          Không tìm thấy thú cưng
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/owner/pets/add")}
                      className="h-[42px] w-full justify-start rounded-none border-t border-[#BDC9C5] px-3 text-[13px] font-normal leading-[18px] text-[#3E4946] hover:bg-[#FBFAEE]"
                    >
                      + Thêm hồ sơ thú cưng
                    </Button>
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
                {isLoadingOptions && roomOptions.length === 0 ? (
                  <>
                    <RoomOptionSkeleton />
                    <RoomOptionSkeleton />
                    <RoomOptionSkeleton />
                  </>
                ) : roomOptions.length > 0 ? (
                  roomOptions.map((room) => (
                    <RoomOptionCard
                      key={room.roomTypeId}
                      room={room}
                      selected={room.roomTypeId === selectedRoomId}
                      onSelect={() => setSelectedRoomId(room.roomTypeId)}
                    />
                  ))
                ) : (
                  <p className="rounded-lg border border-[#BDC9C5] bg-white p-4 text-sm text-[#3E4946]">
                    Hiện chưa có loại phòng khả dụng.
                  </p>
                )}
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
              <SummaryRow
                label="Thú cưng"
                value={selectedPet ? `${selectedPet.petName} (${selectedPet.speciesLabel})` : "Chưa chọn"}
              />
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
              <SummaryRow label="Loại phòng" value={selectedRoom?.roomTypeName ?? "Chưa chọn"} />

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
                <Button
                  className="h-[50px] w-full rounded-lg bg-[#FEA619] text-lg font-semibold leading-[26px] text-white hover:bg-[#F59E0B]"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  type="button"
                >
                  {isSubmitting ? <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? "Đang đặt phòng" : "Xác nhận đặt phòng"}
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

function BookingError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[#F8C7C7] bg-[#FFF5F5] px-4 py-3 text-sm text-[#8A1F1F]">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

function BookingSuccessDialog({
  onBackToList,
  onClose,
  record,
}: {
  onBackToList: () => void
  onClose: () => void
  record: BoardingRecordCreated | null
}) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-xl border border-[#B7D9D3] bg-white px-5 py-8 shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:max-w-[460px] sm:px-8" showCloseButton>
        {record ? (
          <div className="flex flex-col items-center text-center">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#E0F2F1] text-[#00796B] sm:size-[72px]">
              <Check className="size-9" aria-hidden="true" />
            </span>

            <DialogTitle className="mt-5 text-2xl font-bold leading-8 tracking-[0] text-[#1B1C15] sm:text-[28px] sm:leading-9">
              Đặt phòng thành công
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-[440px] break-words text-sm leading-6 text-[#3E4946] sm:text-base">
              Yêu cầu {record.boardingCode} đã được gửi tới trung tâm và đang chờ xác nhận.
            </DialogDescription>

            <div className="mt-6 grid w-full min-w-0 gap-3 text-sm leading-5">
              <SummaryInline label="Thú cưng" value={record.petName} />
              <SummaryInline label="Loại phòng" value={record.roomTypeName} />
              <SummaryInline
                label="Thời gian"
                value={`${formatShortDate(record.plannedCheckInAt)} - ${formatShortDate(record.plannedCheckOutAt)}`}
              />
              <SummaryInline label="Tạm tính" value={formatMoney(record.totalAmount)} />
            </div>

            <div className="mt-6 grid flex justify-center">
              <Button
                className="h-12 rounded-lg bg-[#00796B] px-5 text-base font-semibold text-white hover:bg-[#00695C]"
                onClick={onBackToList}
              >
                Về danh sách lưu trú
              </Button>
        
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function SummaryInline({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex min-h-[52px] min-w-0 items-center justify-between gap-4 rounded-lg bg-[#FBFAEE] px-4 py-3 text-left">
      <span className="shrink-0 text-[#3E4946]">{label}</span>
      <span className="min-w-0 break-words text-right font-semibold text-[#1B1C15]">{value}</span>
    </p>
  )
}

function PetAvatar({ pet, size }: { pet: BoardingBookingPet; size: "sm" | "md" }) {
  return (
    <Avatar className={cn("bg-[#E4E3D7] after:border-transparent", size === "sm" ? "size-8" : "size-12")}>
      {pet.profileImageUrl ? <AvatarImage alt={`Ảnh thú cưng ${pet.petName}`} src={pet.profileImageUrl} /> : null}
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
  room: BoardingRoomTypeBooking
  selected: boolean
}) {
  const popular = popularRoomKeywords.some((keyword) => room.roomTypeName.toLowerCase().includes(keyword))

  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border p-[17px] text-left transition",
        selected
          ? "border-[#005E53] bg-[rgba(151,243,226,0.1)] shadow-[0_0_0_1px_#005E53]"
          : "border-[#BDC9C5] bg-white hover:border-[#00796B]",
        !room.available && "cursor-not-allowed opacity-60"
      )}
      disabled={!room.available}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-lg font-semibold leading-[26px] text-[#1B1C15]">{room.roomTypeName}</span>
          {popular ? (
            <span className="rounded-full border border-[#FBC97C] bg-[#FFF3D8] px-2 py-0.5 text-[10px] font-bold uppercase leading-[20px] text-[#684000]">
              Phổ biến
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-lg font-semibold leading-[26px] text-[#005E53]">
          {formatMoney(room.unitPrice).replace(" ", "")}/ngày
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-[18px] text-[#3E4946]">{room.description ?? "Chưa có mô tả."}</p>
      <p className="mt-2 text-xs font-medium leading-4 text-[#00796B]">
        {room.available ? `Còn ${room.availableUnits} chỗ` : "Đã hết chỗ"}
      </p>
    </button>
  )
}

function RoomOptionSkeleton() {
  return <div className="h-[94px] animate-pulse rounded-lg bg-[#EFEEE2]" />
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

function getDefaultBookingTimes() {
  const checkIn = new Date()
  checkIn.setDate(checkIn.getDate() + 1)
  checkIn.setHours(9, 0, 0, 0)

  const checkOut = new Date(checkIn)
  checkOut.setDate(checkOut.getDate() + 2)
  checkOut.setHours(17, 0, 0, 0)

  return {
    checkInAt: toDateTimeInputValue(checkIn),
    checkOutAt: toDateTimeInputValue(checkOut),
  }
}

function toDateTimeInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toApiDateTime(value: string) {
  return new Date(value).toISOString()
}

function isValidDateTimeInput(value: string) {
  return value.trim() !== "" && !Number.isNaN(new Date(value).getTime())
}

function formatWeight(value: number | null) {
  return value === null ? "Chưa cập nhật kg" : `${value} kg`
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
