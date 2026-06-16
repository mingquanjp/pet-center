"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  CircleAlert,
  Eye,
  FileDown,
  RotateCcw,
  FlaskConical,
  Pill,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react"

import { AppPagination } from "@/components/ui/app-pagination"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LoadingState } from "@/components/ui/loading-state"
import { cn } from "@/lib/utils"
import { getMedicineUnitLabel } from "../../utils/medicine-format"
import type { MedicineUnit } from "../../types/medicine.types"

import { doctorPrescriptionsApi } from "../../api/doctor-prescriptions.api"
import { useDoctorPrescriptions } from "../../hooks/useDoctorPrescriptions"
import type {
  DoctorPrescriptionDetail,
  DoctorPrescriptionFilters,
  DoctorPrescriptionStatus,
} from "../../types/prescription.types"

const pageSize = 3

const defaultFilters: DoctorPrescriptionFilters = {
  search: "",
  status: "ALL",
  date: "",
  page: 1,
  limit: pageSize,
}

const formatPrescriptionQuantity = (quantity?: string | null, unit?: string | null) => {
  if (!quantity) return "-"
  return unit ? `${quantity} ${formatMedicineUnit(unit)}` : quantity
}

function formatMedicineUnit(unit?: string | null) {
  if (!unit) return ""

  return getMedicineUnitLabel(unit as MedicineUnit)
}

const statusLabels: Record<DoctorPrescriptionStatus, string> = {
  prescribed: "Đã kê đơn",
  result_recorded: "Đã ghi kết quả",
  follow_up_required: "Cần tái khám",
}

const statusFilterOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "prescribed", label: "Đã kê đơn" },
  { value: "result_recorded", label: "Đã ghi kết quả" },
  { value: "follow_up_required", label: "Cần tái khám" },
] as const

export function DoctorPrescriptionsPage() {
  const [filters, setFilters] = useState<DoctorPrescriptionFilters>(defaultFilters)
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null)
  const [selectedPrescription, setSelectedPrescription] = useState<DoctorPrescriptionDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isDetailError, setIsDetailError] = useState(false)
  const { data, stats, pagination, isLoading, isInitialLoading, isError, refetch } = useDoctorPrescriptions(filters)

  useEffect(() => {
    if (!selectedPrescriptionId) return

    let ignore = false

    async function fetchDetail() {
      try {
        setIsDetailLoading(true)
        setIsDetailError(false)
        const detail = await doctorPrescriptionsApi.getDoctorPrescriptionDetail(selectedPrescriptionId as string)
        if (!ignore) setSelectedPrescription(detail)
      } catch (error) {
        console.error("Failed to fetch prescription detail:", error)
        if (!ignore) setIsDetailError(true)
      } finally {
        if (!ignore) setIsDetailLoading(false)
      }
    }

    void fetchDetail()

    return () => {
      ignore = true
    }
  }, [selectedPrescriptionId])

  const totalPages = Math.max(1, pagination.totalPages)
  const safePage = Math.min(filters.page, totalPages)
  const startItem = pagination.total === 0 ? 0 : (safePage - 1) * pagination.limit + 1
  const endItem = Math.min(safePage * pagination.limit, pagination.total)

  const statCards = [
    {
      label: "Đơn thuốc đã kê",
      value: formatCount(stats.totalCount),
      icon: ClipboardList,
      iconClassName: "bg-[#d8f3ee] text-[#005e53]",
    },
    {
      label: "Đơn thuốc trong hôm nay",
      value: formatCount(stats.todayCount),
      icon: CalendarDays,
      iconClassName: "bg-[#fff3d8] text-[#b45309]",
    },
    {
      label: "Có tái khám",
      value: formatCount(stats.followUpCount),
      icon: Stethoscope,
      iconClassName: "bg-[#e0f2fe] text-[#0369a1]",
    },
  ]

  const handleSearchChange = (value: string) => {
    setFilters((current) => ({ ...current, search: value, page: 1 }))
  }

  return (
    <div className="flex-1 space-y-6">
      <header>
        <h1 className="heading-lg text-petcenter-text">Đơn thuốc</h1>
        <p className="body-md mt-1 max-w-3xl text-petcenter-text-secondary">
          Xem lại các đơn thuốc đã kê và hướng dẫn sử dụng thuốc cho từng phiếu khám trong hệ thống.
        </p>
      </header>

      <section aria-label="Thống kê đơn thuốc" className="grid gap-6 md:grid-cols-3">
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

      <div className="relative flex flex-col overflow-hidden rounded-2xl bg-petcenter-card shadow-card">
      <section className="w-full border-b border-petcenter-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-50 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
            <input
              className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Tìm kiếm mã đơn, mã phiếu khám, tên thú cưng..."
              type="text"
              value={filters.search}
            />
          </div>

          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Trạng thái:</span>
            <select
              className="body-md min-w-44 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as DoctorPrescriptionFilters["status"],
                  page: 1,
                }))
              }
              value={filters.status}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button
            className="gap-2 rounded-[0.75rem] border-petcenter-border px-4 py-2 text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-text"
            onClick={() => setFilters(defaultFilters)}
            type="button"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Đặt lại
          </Button>
        </div>
      </section>

      <section className="overflow-hidden bg-white">
        {isInitialLoading ? (
          <LoadingState
            className="py-16"
            title="Đang tải đơn thuốc..."
            description="Dữ liệu đơn thuốc đang được lấy từ hệ thống."
          />
        ) : isError && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <AlertCircle className="size-12 text-[#ba1a1a]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#1b1c15]">Không thể tải danh sách đơn thuốc</p>
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
                    <TableHeaderCell className="w-[160px]">Mã đơn</TableHeaderCell>
                    <TableHeaderCell className="w-[150px]">Phiếu khám</TableHeaderCell>
                    <TableHeaderCell className="w-[220px]">Thú cưng</TableHeaderCell>
                    <TableHeaderCell className="w-[165px]">Chủ nuôi</TableHeaderCell>
                    <TableHeaderCell className="w-[140px]">Ngày kê</TableHeaderCell>
                    <TableHeaderCell className="w-[120px] text-center">Số thuốc</TableHeaderCell>
                    <TableHeaderCell className="w-[120px] text-right">Thao tác</TableHeaderCell>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petcenter-border bg-white">
                  {data.map((prescription) => (
                    <tr className="transition-colors hover:bg-petcenter-background/60" key={prescription.prescriptionId}>
                      <TableBodyCell>
                        <span className="font-medium text-[#005e53]">{prescription.prescriptionCode}</span>
                      </TableBodyCell>
                      <TableBodyCell>{prescription.examinationCode}</TableBodyCell>
                      <TableBodyCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              getPetAvatarClassName(prescription.pet.species)
                            )}
                            aria-hidden="true"
                          >
                            {prescription.pet.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#1b1c15]">{prescription.pet.name}</p>
                            <p className="truncate text-xs leading-4 text-[#6e7a76]">
                              {prescription.pet.speciesLabel} • {prescription.pet.breed ?? "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      </TableBodyCell>
                      <TableBodyCell>{prescription.owner.fullName}</TableBodyCell>
                      <TableBodyCell>{formatDate(prescription.prescribedDate)}</TableBodyCell>
                      <TableBodyCell className="text-center font-medium text-[#1b1c15]">
                        {prescription.medicineCount}
                      </TableBodyCell>
                      <TableBodyCell className="text-right">
                        <button
                          aria-label={`Xem đơn thuốc ${prescription.prescriptionCode}`}
                          className="inline-flex size-8 items-center justify-center rounded-[12px] text-[#005e53] transition hover:bg-[#d8f3ee]"
                          onClick={() => setSelectedPrescriptionId(prescription.prescriptionId)}
                          type="button"
                        >
                          <Eye aria-hidden="true" className="size-[18px]" />
                        </button>
                      </TableBodyCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.length === 0 ? (
              <div className="border-t border-[#e4e3d7] bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#1b1c15]">Không tìm thấy đơn thuốc phù hợp</p>
                <p className="mt-1 text-sm text-[#52605c]">Thử đổi từ khóa hoặc đặt lại bộ lọc.</p>
              </div>
            ) : null}

            <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row">
              <p className="text-sm text-petcenter-text-secondary">
                Hiển thị{" "}
                <span className="font-medium text-petcenter-text">{startItem}</span>
                -
                <span className="font-medium text-petcenter-text">{endItem}</span>{" "}
                của <span className="font-medium text-petcenter-text">{pagination.total || 0}</span> đơn thuốc
              </p>
              <AppPagination
                ariaLabel="Phân trang danh sách đơn thuốc"
                currentPage={safePage}
                isLoading={isLoading}
                onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                totalPages={totalPages}
                size="sm"
              />
            </div>
          </div>
        )}
      </section>
      </div>

      <PrescriptionDetailDialog
        isError={isDetailError}
        isLoading={isDetailLoading}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPrescriptionId(null)
            setSelectedPrescription(null)
            setIsDetailError(false)
          }
        }}
        prescriptionCode={data.find((item) => item.prescriptionId === selectedPrescriptionId)?.prescriptionCode}
        prescription={selectedPrescription}
      />
    </div>
  )
}

function PrescriptionDetailDialog({
  isError,
  isLoading,
  onOpenChange,
  prescription,
  prescriptionCode,
}: {
  isError: boolean
  isLoading: boolean
  onOpenChange: (open: boolean) => void
  prescription: DoctorPrescriptionDetail | null
  prescriptionCode?: string
}) {
  return (
    <Dialog open={Boolean(prescriptionCode || prescription || isLoading || isError)} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[900px] sm:max-w-[900px] flex-col gap-0 overflow-hidden rounded-[16px] border-0 bg-white p-0 text-[#1b1c15] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-0"
        showCloseButton={false}
      >
        {isLoading ? (
          <div className="px-6 py-12">
            <LoadingState
              className="py-8"
              title="Đang tải chi tiết đơn thuốc..."
              description="Vui lòng đợi trong giây lát."
            />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <AlertCircle className="size-12 text-[#ba1a1a]" aria-hidden="true" />
            <DialogTitle className="text-xl font-bold leading-7 text-[#1b1c15]">
              Không thể tải chi tiết đơn thuốc
            </DialogTitle>
            <p className="text-sm text-[#52605c]">Vui lòng đóng cửa sổ và thử lại.</p>
            <DialogClose asChild>
              <Button className="rounded-[12px] border-[#bdc9c5]" type="button" variant="outline">
                Đóng
              </Button>
            </DialogClose>
          </div>
        ) : prescription ? (
          <>
            <header className="flex shrink-0 items-center justify-between border-b border-[#bdc9c5] bg-[#fbfaee] px-6 py-4">
              <div>
                <DialogTitle className="text-xl font-bold leading-7 text-[#1b1c15]">
                  Chi tiết đơn thuốc
                </DialogTitle>
                <p className="mt-0.5 text-sm font-medium leading-5 text-[#3e4946]">
                  {prescription.examinationCode}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-[#dff3e3] px-3 py-1 text-xs font-semibold leading-4 text-[#2e7d32]">
                  {statusLabels[prescription.status]}
                </span>
                <DialogClose asChild>
                  <button
                    aria-label="Đóng chi tiết đơn thuốc"
                    className="inline-flex size-8 items-center justify-center rounded-full text-[#3e4946] transition hover:bg-[#e9e9dd]"
                    type="button"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </DialogClose>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-8">
                <section aria-label="Thông tin đơn thuốc" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <PrescriptionMeta label="PHIẾU KHÁM" value={prescription.examinationCode} />
                  <PrescriptionMeta label="NGÀY KÊ" value={formatDate(prescription.prescribedDate)} />
                  <PrescriptionMeta label="BÁC SĨ KÊ" value={prescription.doctor.fullName} />
                  <PrescriptionMeta label="SỐ THUỐC" value={`${prescription.medicines.length} loại`} />
                </section>

                <section aria-label="Thú cưng và chủ nuôi" className="grid gap-4 md:grid-cols-2">
                  <InfoCard
                    avatarClassName="bg-[rgba(0,121,107,0.2)] text-[#00796b]"
                    avatarLabel={prescription.pet.name.charAt(0)}
                    subtitle={`${prescription.pet.speciesLabel} ${prescription.pet.breed ?? ""} • ${prescription.pet.ageLabel ?? "Chưa cập nhật"}`}
                    title={prescription.pet.name}
                  />
                  <InfoCard
                    avatarClassName="bg-[rgba(254,166,25,0.2)] text-[#b45309]"
                    icon={<UserRound aria-hidden="true" className="size-4" />}
                    subtitle={`SĐT: ${prescription.owner.phoneNumber ?? "Chưa cập nhật"}`}
                    title={prescription.owner.fullName}
                  />
                </section>

                <section className="flex flex-col gap-2">
                  <SectionHeading icon={<FlaskConical aria-hidden="true" className="size-[15px]" />}>
                    Chẩn đoán
                  </SectionHeading>
                  <div className="rounded-[16px] border border-[rgba(189,201,197,0.3)] bg-[#fbfaee] p-[13px] text-sm leading-5 text-[#3e4946]">
                    {prescription.diagnosis || "Chưa cập nhật chẩn đoán."}
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<Pill aria-hidden="true" className="size-[15px]" />}>
                    Danh sách thuốc
                  </SectionHeading>
                  <div className="overflow-hidden rounded-[24px] border border-[rgba(189,201,197,0.5)]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[820px] border-collapse">
                        <thead>
                          <tr className="bg-[#e9e9dd]">
                            <MedicineHeaderCell className="w-[205px]">Tên thuốc</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[106px]">S.Lượng</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[128px]">Liều dùng</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[122px]">Tần suất</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[113px]">Thời gian</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[174px]">Hướng dẫn</MedicineHeaderCell>
                          </tr>
                        </thead>
                        <tbody>
                          {prescription.medicines.map((medicine) => (
                            <tr
                              className="border-t border-[rgba(189,201,197,0.3)] first:border-t-0"
                              key={medicine.prescriptionItemId}
                            >
                              <MedicineBodyCell className="font-medium text-[#1b1c15]">
                                {medicine.medicineName}
                              </MedicineBodyCell>
                              <MedicineBodyCell>{formatPrescriptionQuantity(medicine.quantity, medicine.medicineUnit)}</MedicineBodyCell>
                              <MedicineBodyCell>{medicine.dosage}</MedicineBodyCell>
                              <MedicineBodyCell>{medicine.frequency}</MedicineBodyCell>
                              <MedicineBodyCell>{medicine.duration}</MedicineBodyCell>
                              <MedicineBodyCell className="text-xs leading-4 text-[#3e4946]">
                                {medicine.usageInstruction ?? medicine.note ?? "-"}
                              </MedicineBodyCell>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] border border-[rgba(255,185,95,0.2)] bg-[rgba(255,221,184,0.1)] p-[17px]">
                  <SectionHeading
                    className="text-[#855300]"
                    icon={<CircleAlert aria-hidden="true" className="size-[14px]" />}
                  >
                    Ghi chú hướng dẫn
                  </SectionHeading>
                  <p className="mt-1 text-sm leading-5 text-[#684000]">
                    {prescription.generalNote || "Cho thú cưng dùng thuốc đúng hướng dẫn và theo dõi các dấu hiệu bất thường."}
                  </p>
                </section>

                {prescription.followUp ? (
                  <section className="flex items-start gap-4 rounded-[24px] border border-[rgba(0,121,107,0.2)] bg-[rgba(0,121,107,0.05)] p-[17px]">
                    <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#00796b]" />
                    <div>
                      <p className="text-sm font-bold leading-5 text-[#1b1c15]">
                        Có chỉ định tái khám:{" "}
                        <span className="text-[#00796b]">{formatDate(prescription.followUp.followUpDate)}</span>
                      </p>
                      <p className="text-sm leading-5 text-[#3e4946]">{prescription.followUp.reason ?? "Theo lịch hẹn của bác sĩ."}</p>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>

            <footer className="flex shrink-0 justify-end gap-3 border-t border-[#bdc9c5] bg-[#fbfaee] px-6 py-4">
              <DialogClose asChild>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#bdc9c5] bg-white px-6 text-sm font-semibold text-[#1b1c15] transition hover:bg-[#f5f4e8]"
                  type="button"
                >
                  Đóng
                </button>
              </DialogClose>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#005e53] px-6 text-sm font-semibold text-white transition hover:bg-[#004f47]"
                type="button"
              >
                <FileDown aria-hidden="true" className="size-4" />
                Xuất đơn thuốc
              </button>
            </footer>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function formatCount(value: number) {
  return String(value).padStart(2, "0")
}

function formatDate(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function getPetAvatarClassName(species: string) {
  if (species === "Dog") return "bg-[#fff3d8] text-[#b45309]"
  if (species === "Cat") return "bg-[#e0f2fe] text-[#0369a1]"

  return "bg-[#e4e3d7] text-[#3e4946]"
}

function PrescriptionMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#3e4946]">{label}</p>
      <p className="mt-1 truncate text-sm font-medium leading-5 text-[#1b1c15]">{value}</p>
    </div>
  )
}

function InfoCard({
  avatarClassName,
  avatarLabel,
  icon,
  subtitle,
  title,
}: {
  avatarClassName: string
  avatarLabel?: string
  icon?: React.ReactNode
  subtitle: string
  title: string
}) {
  return (
    <article className="flex h-[82px] items-center gap-4 rounded-[12px] border border-[rgba(189,201,197,0.3)] bg-[#f5f4e8] p-[17px]">
      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full font-bold", avatarClassName)}>
        {icon ?? avatarLabel}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-5 text-[#1b1c15]">{title}</p>
        <p className="truncate text-xs leading-4 text-[#3e4946]">{subtitle}</p>
      </div>
    </article>
  )
}

function SectionHeading({
  children,
  className,
  icon,
}: {
  children: React.ReactNode
  className?: string
  icon: React.ReactNode
}) {
  return (
    <h3 className={cn("flex items-center gap-2 text-sm font-bold leading-5 text-[#1b1c15]", className)}>
      <span className="text-[#00796b]">{icon}</span>
      {children}
    </h3>
  )
}

function MedicineHeaderCell({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("px-4 py-3 text-left text-sm font-bold leading-5 text-[#3e4946]", className)} scope="col" {...props} />
}

function MedicineBodyCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 text-sm leading-5 text-[#1b1c15]", className)} {...props} />
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
