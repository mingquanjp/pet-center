"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  Camera,
  Check,
  Clock3,
  ClipboardList,
  FileText,
  History,
  Home,
  LogIn,
  PawPrint,
  Play,
  RotateCcw,
  Utensils,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { boardingApi } from "../../api/boarding.api"
import type {
  BoardingCareLogAlertLevel,
  BoardingCareLogAttachment,
  BoardingCareLogType,
  BoardingRecordDetail,
  BoardingRecordStatus,
} from "../../types/boarding.types"
import { OwnerBoardingCancelDialog } from "../../components/owner/OwnerBoardingCancelDialog"

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
  cancelled: {
    className: "bg-[#FDE2E4] text-[#C62828]",
    dotClassName: "bg-[#C62828]",
    label: "Đã hủy",
  },
  rejected: {
    className: "bg-[#FDE2E4] text-[#C62828]",
    dotClassName: "bg-[#C62828]",
    label: "Từ chối",
  },
}

export function OwnerBoardingDetailPage({ boardingRecordId }: OwnerBoardingDetailPageProps) {
  const [record, setRecord] = React.useState<BoardingRecordDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false)
  const [isCanceling, setIsCanceling] = React.useState(false)

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
  const canRebookRoom = record.status === "checked_out" || record.status === "cancelled" || record.status === "rejected"

  return (
    <div className="space-y-8 p-0">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] leading-[18px] text-[#3E4946]" aria-label="Breadcrumb">
          <Link href="/owner/boarding" className="transition hover:text-[#005E53]">
            Lưu trú
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
          {record.status === "pending" && record.payment.paymentStatus === "unpaid" ? (
            <Button
              variant="outline"
              className="h-9 rounded-lg border-[#C62828] bg-white px-4 text-xs font-medium text-[#C62828] hover:bg-[#FDE2E4] hover:text-[#C62828]"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Hủy lịch
            </Button>
          ) : null}
          {canRebookRoom ? (
            <Button asChild className="h-9 rounded-lg bg-[#005E53] px-4 text-xs font-medium text-white hover:bg-[#004C43]">
              <Link href="/owner/boarding/booking">
                <RotateCcw className="mr-2 size-4" aria-hidden="true" />
                Đặt lại phòng này
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <InfoCard icon={CalendarCheck} title="Thông tin lưu trú">
            <div className="grid grid-cols-2 gap-4 pt-1">
              <DateBlock label="Ngày nhận" value={formatDate(record.stay.plannedCheckInAt)} subValue={formatTime(record.stay.plannedCheckInAt)} />
              <DateBlock label="Ngày trả" value={formatDate(record.stay.plannedCheckOutAt)} subValue={formatTime(record.stay.plannedCheckOutAt)} />
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
                <p className="text-[13px] leading-[18px] text-[#3E4946]">
                  {record.pet.speciesLabel}
                  {record.pet.weightKg !== null ? ` • ${formatWeight(record.pet.weightKg)}` : ""}
                </p>
                <span className="mt-1 inline-flex rounded bg-[#EFEEE2] px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.22px] text-[#3E4946]">
                  ID: {record.pet.petId}
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard icon={ClipboardList} iconClassName="text-[#F59E0B]" title="Yêu cầu chăm sóc">
            {record.careRequest ? (
              <ul className="space-y-3 pt-1">
                <CareRequestItem icon={Utensils} text={record.careRequest} />
              </ul>
            ) : (
              <p className="text-[13px] leading-[18px] text-[#3E4946]">Chưa có yêu cầu chăm sóc đặc biệt.</p>
            )}
          </InfoCard>
        </aside>

        <CareLogTimeline record={record} />
      </section>

      <OwnerBoardingCancelDialog
        isOpen={isCancelDialogOpen}
        isPending={isCanceling}
        onOpenChange={setIsCancelDialogOpen}
        onSubmit={async () => {
          setIsCanceling(true)
          try {
            await boardingApi.cancelRecord(record.boardingRecordId)
            setRecord((prev) => (prev ? { ...prev, status: "cancelled" } : null))
            setIsCancelDialogOpen(false)
            toast.success("Hủy lưu trú thành công")
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Không thể hủy lịch lưu trú"
            toast.error(errorMessage)
          } finally {
            setIsCanceling(false)
          }
        }}
      />
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

function CareLogTimeline({ record }: { record: BoardingRecordDetail }) {
  const entries = [...record.careLogs].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  )
  const [previewMedia, setPreviewMedia] = React.useState<BoardingCareLogAttachment | null>(null)

  return (
    <section className="min-h-[600px] overflow-hidden rounded-2xl border border-petcenter-border bg-petcenter-card shadow-card">
      <div className="border-b border-petcenter-border/40 bg-petcenter-background/30 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-petcenter-info-bg text-petcenter-info-text shadow-sm">
            <History className="size-5" aria-hidden="true" />
          </span>
          <h2 className="title-md text-petcenter-text">Nhật ký lưu trú</h2>
        </div>
      </div>

      <div className="p-6">
        {entries.length > 0 ? (
          <>
            <div className="relative">
              {entries.map((entry, index) => {
                const isLast = index === entries.length - 1
                const Icon = getCareLogIcon(entry.logType)

                return (
                  <div className="relative pb-8 pl-14 last:pb-0" key={entry.logId}>
                    {!isLast ? (
                      <div className="absolute bottom-0 left-5 top-10 w-0.5 bg-[#E5E7EB]" aria-hidden="true" />
                    ) : null}

                    <span className={cn("absolute left-0 top-0 z-10 flex size-10 items-center justify-center rounded-full", getCareLogCircleClassName(entry.logType))}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>

                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold leading-5 text-petcenter-text">{entry.title}</h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[13px] text-petcenter-text-secondary">
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {formatDateTime(entry.occurredAt)}
                        </div>
                      </div>
                      <span className={cn("w-fit whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] font-semibold", getHealthBadgeClassName(entry.alertLevel))}>
                        {entry.alertLabel}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-[#F1EFE2]/70 bg-[#F9F8F3] p-4 text-[14.5px] leading-relaxed text-[#374151]">
                      <p>{entry.note}</p>
                      {entry.attachments.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {entry.attachments.map((attachment) => (
                            <MediaAttachment
                              attachment={attachment}
                              key={attachment.url}
                              onPreview={() =>
                                setPreviewMedia(attachment.type === "file" ? { ...attachment, type: "image" } : attachment)
                              }
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-petcenter-text-muted opacity-50" aria-hidden="true" />
            <p className="text-sm font-medium italic text-petcenter-text-secondary">Chưa có nhật ký lưu trú.</p>
            <p className="mt-1 text-xs text-petcenter-text-muted">
              Các mốc xử lý và cập nhật chăm sóc sẽ hiển thị tại đây.
            </p>
          </div>
        )}
      </div>

      <Dialog open={Boolean(previewMedia)} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent
          showCloseButton={false}
          className="flex h-fit max-h-[95vh] w-fit max-w-[95vw] items-center justify-center overflow-hidden border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-[95vw]"
        >
          <DialogTitle className="sr-only">Xem chi tiết tệp đính kèm</DialogTitle>
          {previewMedia?.type === "video" ? (
            <video src={previewMedia.url} className="max-h-[95vh] max-w-full rounded-md object-contain" controls autoPlay />
          ) : previewMedia?.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewMedia.url} alt="Phóng to ảnh nhật ký chăm sóc" className="max-h-[95vh] max-w-full rounded-md object-contain" />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function MediaAttachment({
  attachment,
  onPreview,
}: {
  attachment: BoardingCareLogAttachment
  onPreview: () => void
}) {
  const [imagePreviewFailed, setImagePreviewFailed] = React.useState(false)

  if (attachment.type === "file" && imagePreviewFailed) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="flex h-16 w-24 items-center justify-center rounded-control border border-petcenter-border/40 bg-petcenter-background shadow-sm transition hover:border-petcenter-primary/60"
      >
        <FileText className="size-5 text-petcenter-text-secondary" aria-hidden="true" />
        <span className="sr-only">Mở tệp nhật ký chăm sóc</span>
      </a>
    )
  }

  return (
    <button
      className="group relative h-16 w-24 overflow-hidden rounded-control border border-petcenter-border/40 bg-petcenter-background shadow-sm transition hover:border-petcenter-primary/60"
      onClick={onPreview}
      type="button"
    >
      {attachment.type === "video" ? (
        <>
          <video src={attachment.url} muted preload="metadata" playsInline className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/95 text-petcenter-primary shadow-md transition-transform group-hover:scale-110">
              <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
            </span>
          </span>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.url}
          alt="Ảnh nhật ký chăm sóc"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImagePreviewFailed(true)}
        />
      )}
      <span className="sr-only">{attachment.type === "video" ? "Xem video nhật ký chăm sóc" : "Xem ảnh nhật ký chăm sóc"}</span>
    </button>
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

function getHealthBadgeClassName(status: BoardingCareLogAlertLevel | undefined) {
  if (status === "urgent") return "bg-[#FEE2E2] text-[#B91C1C]"
  if (status === "attention") return "bg-[#FFF3D8] text-[#B45309]"
  if (status === "normal") return "bg-[#DFF3E3] text-[#2E7D32]"

  return "bg-[#E4E3D7] text-[#3E4946]"
}

function getCareLogIcon(type: BoardingCareLogType): LucideIcon {
  if (type === "check_in") return LogIn
  if (type === "daily_update") return Camera
  if (type === "check_out") return Check

  return FileText
}

function getCareLogCircleClassName(type: BoardingCareLogType): string {
  if (type === "daily_update") return "bg-[#008577] text-white"
  if (type === "check_out") return "bg-[#E6F3E6] text-[#2E7D32]"
  if (type === "check_in") return "bg-[#F1EFE2] text-[#52615D]"

  return "bg-[#F1EFE2] text-[#52615D]"
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

function formatWeight(value: number): string {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value)} kg`
}
