"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CalendarCheck,
  Camera,
  Check,
  Clock3,
  ClipboardList,
  FileText,
  Filter,
  Home,
  LogIn,
  PawPrint,
  ReceiptText,
  RotateCcw,
  Utensils,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { boardingApi } from "../../api/boarding.api"
import type { BoardingHealthStatus, BoardingRecordListItem, BoardingRecordStatus } from "../../types/boarding.types"

type OwnerBoardingDetailPageProps = {
  boardingRecordId: string
}

type StatusMeta = {
  className: string
  dotClassName: string
  label: string
}

const statusMeta: Record<BoardingRecordStatus, StatusMeta> = {
  pending: {
    className: "bg-[#FFF3D8] text-[#B45309]",
    dotClassName: "bg-[#B45309]",
    label: "Chờ xác nhận",
  },
  confirmed: {
    className: "bg-[#FFF3D8] text-[#B45309]",
    dotClassName: "bg-[#B45309]",
    label: "Chờ check-in",
  },
  staying: {
    className: "bg-[#DFF3E3] text-[#00796B]",
    dotClassName: "bg-[#00796B]",
    label: "Đang lưu trú",
  },
  checked_out: {
    className: "bg-[#E4E3D7] text-[#3E4946]",
    dotClassName: "bg-[#6E7A76]",
    label: "Đã trả thú cưng",
  },
}

export function OwnerBoardingDetailPage({ boardingRecordId }: OwnerBoardingDetailPageProps) {
  const [record, setRecord] = React.useState<BoardingRecordListItem | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadRecord() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await boardingApi.getOwnerRecordById(boardingRecordId, {
          signal: abortController.signal,
        })

        if (!abortController.signal.aborted) {
          setRecord(result)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setRecord(null)
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải chi tiết lưu trú")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadRecord()

    return () => {
      abortController.abort()
    }
  }, [boardingRecordId])

  if (isLoading) return <BoardingDetailSkeleton />
  if (errorMessage) return <BoardingDetailError message={errorMessage} />

  if (!record) {
    return (
      <section className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-[#BDC9C5] bg-white px-6 py-12 text-center">
        <Home className="size-14 text-[#00796B]/30" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold leading-7 text-[#1B1C15]">Không tìm thấy lịch lưu trú</h1>
        <p className="mt-2 max-w-md text-sm leading-5 text-[#3E4946]">
          Lịch lưu trú này không tồn tại hoặc không thuộc tài khoản hiện tại.
        </p>
        <Button asChild className="mt-6 h-10 rounded-lg bg-[#00796B] px-5 text-sm text-white hover:bg-[#00695C]">
          <Link href="/owner/boarding">Về danh sách lưu trú</Link>
        </Button>
      </section>
    )
  }

  const meta = statusMeta[record.status]

  return (
    <div className="space-y-8 p-0">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] leading-[18px] text-[#3E4946]" aria-label="Breadcrumb">
          <Link href="/owner/boarding" className="transition hover:text-[#005E53]">
            Lưu trú
          </Link>
          <span aria-hidden="true">›</span>
          <Link href="/owner/boarding" className="transition hover:text-[#005E53]">
            Lưu trú của tôi
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-[#1B1C15]">Chi tiết lưu trú</span>
        </nav>

        <Button
          asChild
          variant="outline"
          className="h-10 w-fit gap-2 rounded-lg border-[#BDC9C5] bg-transparent px-4 text-xs font-medium text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#005E53]"
        >
          <Link href="/owner/boarding">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Quay lại danh sách lưu trú
          </Link>
        </Button>
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-[#E6E8DD] bg-white p-[25px] shadow-[0_4px_8px_rgba(0,0,0,0.05)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#1B1C15]">Chi tiết lưu trú</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm leading-5 text-[#3E4946]">
            <span>{record.boardingCode}</span>
            <span className="size-1 rounded-full bg-[#BDC9C5]" aria-hidden="true" />
            <span className="font-medium text-[#1B1C15]">{record.pet.petName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold leading-[14px] tracking-[0.22px]", meta.className)}>
            <span className={cn("size-2 rounded-full", meta.dotClassName)} aria-hidden="true" />
            {meta.label}
          </span>
          <Button
            variant="outline"
            className="h-9 rounded-lg border-[#005E53] bg-white px-4 text-xs font-medium text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#005E53]"
          >
            <ReceiptText className="mr-2 size-4" aria-hidden="true" />
            Tải hóa đơn
          </Button>
          <Button asChild className="h-9 rounded-lg bg-[#005E53] px-4 text-xs font-medium text-white hover:bg-[#004C43]">
            <Link href="/owner/boarding/booking">
              <RotateCcw className="mr-2 size-4" aria-hidden="true" />
              Đặt lại phòng này
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <InfoCard icon={CalendarCheck} title="Thông tin lưu trú">
            <div className="grid grid-cols-2 gap-4 pt-1">
              <DateBlock label="Ngày nhận" value={formatDate(record.plannedCheckInAt)} subValue={formatTime(record.plannedCheckInAt)} />
              <DateBlock label="Ngày trả" value={formatDate(record.plannedCheckOutAt)} subValue={formatTime(record.plannedCheckOutAt)} />
            </div>
            <div className="mt-5 space-y-3">
              <DashedRow label="Phòng" value={record.room.roomTypeName} />
              <DashedRow label="Tổng chi phí" value={formatMoney(record.estimatedTotal)} valueClassName="text-[#005E53]" />
              <DashedRow
                label="Trạng thái thanh toán"
                value={record.payment.paymentStatusLabel}
                valueClassName={record.payment.paymentStatus === "paid" ? "rounded bg-[#DFF3E3] px-2 py-0.5 text-[#2E7D32] text-[11px] tracking-[0.22px]" : "rounded bg-[#FFF3D8] px-2 py-0.5 text-[#B45309] text-[11px] tracking-[0.22px]"}
              />
            </div>
          </InfoCard>

          <InfoCard icon={PawPrint} title="Thú cưng">
            <div className="flex items-center gap-4 pt-2">
              <Avatar className="size-16 border-2 border-[#E4E3D7] bg-[#E4E3D7] after:border-transparent">
                {record.pet.profileImageUrl ? (
                  <AvatarImage src={record.pet.profileImageUrl} alt={`Ảnh thú cưng ${record.pet.petName}`} />
                ) : null}
                <AvatarFallback className="bg-[#E4E3D7] text-[#7A837F]">
                  <PawPrint className="size-7" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold leading-[26px] text-[#1B1C15]">{record.pet.petName}</h2>
                <p className="text-[13px] leading-[18px] text-[#3E4946]">Hồ sơ thú cưng</p>
                <span className="mt-1 inline-flex rounded bg-[#EFEEE2] px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.22px] text-[#3E4946]">
                  ID: {record.pet.petId}
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard icon={ClipboardList} iconClassName="text-[#F59E0B]" title="Yêu cầu chăm sóc">
            <ul className="space-y-3 pt-1">
              <CareRequestItem icon={Utensils} text="Cho ăn đúng khẩu phần trung tâm đã tiếp nhận." />
              <CareRequestItem icon={Banknote} text={`Thanh toán: ${record.payment.paymentMethodLabel}.`} />
              <CareRequestItem icon={Clock3} text={`Thời gian lưu trú ${record.stayDays} ngày.`} />
            </ul>
          </InfoCard>
        </aside>

        <article className="rounded-xl border border-[#E6E8DD] bg-white p-[25px] shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between border-b border-[#E6E8DD] pb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold leading-[26px] text-[#1B1C15]">
              <Clock3 className="size-[18px] text-[#00796B]" aria-hidden="true" />
              Nhật ký chăm sóc
            </h2>
            <Button variant="ghost" className="h-8 gap-1 px-2 text-xs font-medium text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#005E53]">
              <Filter className="size-4" aria-hidden="true" />
              Lọc
            </Button>
          </div>

          <div className="pt-6">
            <CareLogTimeline record={record} />
          </div>
        </article>
      </section>
    </div>
  )
}

function InfoCard({
  children,
  icon: Icon,
  iconClassName,
  title,
}: {
  children: React.ReactNode
  icon: LucideIcon
  iconClassName?: string
  title: string
}) {
  return (
    <section className="rounded-xl border border-[#E6E8DD] bg-white p-[25px] shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
      <h2 className="flex items-center gap-2 border-b border-[#E6E8DD] pb-3 text-lg font-semibold leading-[26px] text-[#1B1C15]">
        <Icon className={cn("size-5 text-[#00796B]", iconClassName)} aria-hidden="true" />
        {title}
      </h2>
      <div className="pt-4">{children}</div>
    </section>
  )
}

function DateBlock({ label, subValue, value }: { label: string; subValue: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold leading-[14px] tracking-[0.22px] text-[#3E4946]">{label}</p>
      <p className="text-sm font-medium leading-5 text-[#1B1C15]">{value}</p>
      <p className="text-[13px] leading-[18px] text-[#3E4946]">{subValue}</p>
    </div>
  )
}

function DashedRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-dashed border-[#E6E8DD] pb-2 pt-[9px]">
      <span className="text-[13px] leading-[18px] text-[#3E4946]">{label}</span>
      <span className={cn("min-w-0 break-words text-right text-sm font-medium leading-5 text-[#1B1C15]", valueClassName)}>
        {value}
      </span>
    </div>
  )
}

function CareRequestItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-start gap-3 text-[13px] leading-[18px] text-[#3E4946]">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#6E7A76]" aria-hidden="true" />
      <span>{text}</span>
    </li>
  )
}

function CareLogTimeline({ record }: { record: BoardingRecordListItem }) {
  const entries = getCareLogEntries(record)

  return (
    <div className="space-y-0 pl-2">
      {entries.map((entry, index) => (
        <div className="flex gap-6 pb-8 last:pb-0" key={entry.title}>
          <div className="relative flex shrink-0 flex-col items-center">
            <div className={cn("z-10 flex size-10 items-center justify-center rounded-full border-2 border-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]", entry.iconBoxClassName)}>
              <entry.icon className={cn("size-4", entry.iconClassName)} aria-hidden="true" />
            </div>
            {index < entries.length - 1 ? <div className="absolute bottom-[-32px] top-6 w-0.5 bg-[#E6E8DD]" /> : null}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-medium leading-4 text-[#1B1C15]">{entry.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-[13px] leading-[18px] text-[#3E4946]">
                  <Clock3 className="size-3" aria-hidden="true" />
                  {entry.timeText}
                </p>
              </div>
              <span className={cn("shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.22px]", entry.badgeClassName)}>
                {entry.badge}
              </span>
            </div>

            <div className="rounded-lg border border-[#E6E8DD] bg-[#FBFAEE] p-4 text-sm leading-5 text-[#1B1C15]">
              {entry.description}
            </div>

            {entry.showMedia ? (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <MediaPlaceholder label="Ăn uống" />
                <MediaPlaceholder label="Nghỉ ngơi" />
                <MediaPlaceholder label="Video" isVideo />
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function MediaPlaceholder({ isVideo = false, label }: { isVideo?: boolean; label: string }) {
  return (
    <div className="relative flex h-[81px] items-center justify-center overflow-hidden rounded-xl border border-[#BDC9C5] bg-[#DBDBCF]">
      <Camera className="size-5 text-[#6E7A76]" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      {isVideo ? (
        <span className="absolute flex size-10 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-[#005E53] shadow">
          ▶
        </span>
      ) : null}
    </div>
  )
}

function BoardingDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-full animate-pulse rounded bg-[#E4E3D7]" />
      <div className="h-28 w-full animate-pulse rounded-xl bg-white" />
      <section className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-48 animate-pulse rounded-xl bg-white" key={index} />
          ))}
        </div>
        <div className="h-[680px] animate-pulse rounded-xl bg-white" />
      </section>
    </div>
  )
}

function BoardingDetailError({ message }: { message: string }) {
  return (
    <section className="flex items-start gap-3 rounded-xl border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <h1 className="text-sm font-bold leading-5">Không thể tải chi tiết lưu trú</h1>
        <p className="mt-1 text-sm leading-5">{message}</p>
      </div>
    </section>
  )
}

function getCareLogEntries(record: BoardingRecordListItem) {
  const latestCareTime = record.activeCare?.lastUpdatedAt ?? record.plannedCheckOutAt

  return [
    ...(record.status === "checked_out"
      ? [
          {
            badge: "Hoàn tất",
            badgeClassName: "bg-[#E4E3D7] text-[#3E4946]",
            description: `${record.pet.petName} đã được trao trả cho chủ. Tình trạng lưu trú đã hoàn tất.`,
            icon: Check,
            iconBoxClassName: "bg-[#EAF5E8]",
            iconClassName: "text-[#2E7D32]",
            showMedia: false,
            timeText: formatDateTime(record.plannedCheckOutAt),
            title: "Trả thú cưng thành công",
          },
        ]
      : []),
    {
      badge: record.activeCare?.healthStatusLabel ?? "Bình thường",
      badgeClassName: getHealthBadgeClassName(record.activeCare?.healthStatus),
      description:
        record.status === "staying"
          ? `${record.pet.petName} đang được chăm sóc tại trung tâm. Sức khỏe hiện tại: ${record.activeCare?.healthStatusLabel ?? "chưa cập nhật"}.`
          : `${record.pet.petName} đang trong quy trình lưu trú theo trạng thái ${record.statusLabel.toLowerCase()}.`,
      icon: Camera,
      iconBoxClassName: "bg-[#00796B]",
      iconClassName: "text-white",
      showMedia: record.status === "staying" || record.status === "checked_out",
      timeText: formatDateTime(latestCareTime),
      title: "Cập nhật hàng ngày",
    },
    {
      badge: "Bắt đầu",
      badgeClassName: "bg-[#E4E3D7] text-[#3E4946]",
      description: `${record.pet.petName} đã được ghi nhận lịch lưu trú tại phòng ${record.room.roomTypeName}.`,
      icon: record.status === "pending" ? FileText : LogIn,
      iconBoxClassName: "bg-[#EFEEE2]",
      iconClassName: "text-[#6E7A76]",
      showMedia: false,
      timeText: formatDateTime(record.plannedCheckInAt),
      title: record.status === "pending" ? "Tạo yêu cầu lưu trú" : "Nhận phòng",
    },
  ]
}

function getHealthBadgeClassName(status: BoardingHealthStatus | undefined) {
  if (status === "urgent") return "bg-[#FEE2E2] text-[#B91C1C]"
  if (status === "attention") return "bg-[#FFF3D8] text-[#B45309]"
  if (status === "normal") return "bg-[#DFF3E3] text-[#2E7D32]"

  return "bg-[#DFF3E3] text-[#2E7D32]"
}

function formatDate(value: string | undefined): string {
  const date = parseDate(value)
  if (!date) return "Chưa cập nhật"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatTime(value: string | undefined): string {
  const date = parseDate(value)
  if (!date) return "Chưa cập nhật"

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatDateTime(value: string | undefined): string {
  const date = parseDate(value)
  if (!date) return "Chưa cập nhật"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`
}
