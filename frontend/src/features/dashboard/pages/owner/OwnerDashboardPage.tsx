"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  AlertCircle,
  BellRing,
  CalendarDays,
  CalendarPlus,
  Clock3,
  FileText,
  HeartPulse,
  PawPrint,
  Plus,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from "lucide-react"

import { ownerDashboardApi } from "../../api/owner-dashboard.api"
import type {
  OwnerDashboard,
  OwnerDashboardActivity,
  OwnerDashboardAppointment,
  OwnerDashboardPet,
  OwnerDashboardReminder,
} from "../../types/owner-dashboard.types"

type StatCard = {
  label: string
  value: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconClassName: string
}

const activityIconByCategory: Record<OwnerDashboardActivity["activityCategory"], React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  medical: Stethoscope,
  vaccination: HeartPulse,
  grooming: Sparkles,
  boarding: PawPrint,
  invoice: FileText,
  payment: ReceiptText,
  profile: PawPrint,
}

const activityIconClassByCategory: Record<OwnerDashboardActivity["activityCategory"], string> = {
  medical: "bg-petcenter-success-bg text-petcenter-success-text",
  vaccination: "bg-petcenter-warning-bg text-petcenter-warning-text",
  grooming: "bg-petcenter-primary/10 text-petcenter-primary",
  boarding: "bg-petcenter-info-bg text-petcenter-info-text",
  invoice: "bg-petcenter-sidebar text-petcenter-text-secondary",
  payment: "bg-petcenter-cta/15 text-petcenter-cta-hover",
  profile: "bg-petcenter-primary/10 text-petcenter-primary",
}

const activityCategoryLabel: Record<OwnerDashboardActivity["activityCategory"], string> = {
  medical: "Khám bệnh",
  vaccination: "Tiêm phòng",
  grooming: "Spa",
  boarding: "Lưu trú",
  invoice: "Hóa đơn",
  payment: "Thanh toán",
  profile: "Hồ sơ",
}

const activityStatusLabel: Record<OwnerDashboardActivity["activityStatus"], string> = {
  scheduled: "Đã lên lịch",
  pending: "Đang chờ",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  rejected: "Từ chối",
  failed: "Thất bại",
}

const activityStatusClassName: Record<OwnerDashboardActivity["activityStatus"], string> = {
  scheduled: "bg-petcenter-info-bg text-petcenter-info-text",
  pending: "bg-petcenter-warning-bg text-petcenter-warning-text",
  confirmed: "bg-petcenter-success-bg text-petcenter-success-text",
  completed: "bg-petcenter-success-bg text-petcenter-success-text",
  cancelled: "bg-petcenter-sidebar text-petcenter-text-secondary",
  rejected: "bg-petcenter-danger-bg text-petcenter-danger-text",
  failed: "bg-petcenter-danger-bg text-petcenter-danger-text",
}

const activityFilterOptions: Array<{ label: string; value: "all" | OwnerDashboardActivity["activityCategory"] }> = [
  { label: "Tất cả", value: "all" },
  { label: "Khám bệnh", value: "medical" },
  { label: "Spa", value: "grooming" },
  { label: "Lưu trú", value: "boarding" },
  { label: "Hóa đơn", value: "invoice" },
]

export function OwnerDashboardPage() {
  const [dashboard, setDashboard] = React.useState<OwnerDashboard | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)

  const loadDashboard = React.useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await ownerDashboardApi.get(signal ? { signal } : {})

      if (!signal?.aborted) {
        setDashboard(data)
      }
    } catch (error) {
      if (!signal?.aborted) {
        setDashboard(null)
        setErrorMessage(error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard")
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  React.useEffect(() => {
    const abortController = new AbortController()

    void loadDashboard(abortController.signal)

    return () => abortController.abort()
  }, [loadDashboard])

  if (isLoading && !dashboard) {
    return <DashboardSkeleton />
  }

  if (errorMessage) {
    return <DashboardError message={errorMessage} onRetry={() => void loadDashboard()} />
  }

  if (!dashboard) {
    return null
  }

  const stats: StatCard[] = [
    {
      label: "Số thú cưng",
      value: dashboard.summary.petCount,
      icon: PawPrint,
      iconClassName: "bg-petcenter-primary/10 text-petcenter-primary",
    },
    {
      label: "Lịch hẹn sắp tới",
      value: dashboard.summary.upcomingAppointmentCount,
      icon: CalendarDays,
      iconClassName: "bg-petcenter-cta/15 text-petcenter-cta-hover",
    },
    {
      label: "Hóa đơn chưa thanh toán",
      value: dashboard.summary.unpaidInvoiceCount,
      icon: ReceiptText,
      iconClassName: "bg-petcenter-sidebar text-petcenter-text-secondary",
    },
    {
      label: "Thông báo mới",
      value: dashboard.summary.unreadNotificationCount,
      icon: BellRing,
      iconClassName: "bg-petcenter-danger-bg text-petcenter-danger-text",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-section">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="heading-lg text-petcenter-primary">Chào buổi sáng, {dashboard.ownerName}!</h1>
          <p className="body-md mt-2 text-petcenter-text-secondary">
            Dưới đây là tổng quan về thú cưng, lịch hẹn và dịch vụ của bạn hôm nay.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            className="label-md inline-flex h-10 items-center justify-center gap-2 rounded-pill border border-petcenter-primary px-4 font-semibold text-petcenter-primary transition-colors hover:bg-petcenter-primary/5"
            href="/owner/pets/add"
          >
            <Plus className="h-4 w-4" />
            Thêm hồ sơ thú cưng
          </Link>
          <Link
            className="label-md inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-petcenter-cta px-5 font-semibold text-white shadow-card transition-colors hover:bg-petcenter-cta-hover"
            href="/owner/appointments"
          >
            <CalendarPlus className="h-4 w-4" />
            Đặt lịch khám
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            className="flex h-32 flex-col justify-between rounded-card border border-petcenter-border bg-white p-4 shadow-card"
            key={stat.label}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="label-md text-petcenter-text-secondary">{stat.label}</p>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${stat.iconClassName}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="heading-lg text-petcenter-text">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-gutter xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-section">
          <section className="flex min-h-[340px] flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6 xl:h-[390px]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="heading-sm text-petcenter-text">Thú cưng của tôi</h2>
              <Link className="label-md font-semibold text-petcenter-primary hover:underline" href="/owner/pets">
                Xem tất cả
              </Link>
            </div>

            {dashboard.pets.length > 0 ? (
              <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
                {dashboard.pets.map((pet) => (
                  <PetCard key={pet.petId} pet={pet} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={PawPrint}
                title="Chưa có hồ sơ thú cưng"
                description="Khi bạn thêm hồ sơ thú cưng, thông tin tổng quan sẽ hiển thị tại đây."
              />
            )}
          </section>

          <section className="flex flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6 xl:min-h-[340px]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="heading-sm text-petcenter-text">Thay đổi gần đây</h2>
              <button
                className="label-md font-semibold text-petcenter-primary hover:underline"
                onClick={() => setIsHistoryOpen(true)}
                type="button"
              >
                Xem lịch sử
              </button>
            </div>

            {dashboard.recentActivities.length > 0 ? (
              <div className="space-y-2">
                {dashboard.recentActivities.map((activity) => (
                  <ActivityRow activity={activity} key={activity.activityLogId} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                compact
                icon={Sparkles}
                title="Chưa có thay đổi gần đây"
                description="Các cập nhật từ log hoạt động sẽ xuất hiện khi có dữ liệu."
              />
            )}
          </section>
        </div>

        <div className="flex flex-col gap-section">
          <section className="flex min-h-[340px] flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6 xl:h-[390px]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="heading-sm text-petcenter-text">Lịch hẹn sắp tới</h2>
              <Link className="label-md font-semibold text-petcenter-primary hover:underline" href="/owner/appointments">
                Chi tiết
              </Link>
            </div>

            {dashboard.upcomingAppointments.length > 0 ? (
              <div className="h-[270px] space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {dashboard.upcomingAppointments.map((appointment) => (
                  <UpcomingAppointment appointment={appointment} key={appointment.appointmentId} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={CalendarDays}
                title="Không có lịch hẹn sắp tới"
                description="Bạn có thể đặt thêm lịch khám khi cần."
              />
            )}
          </section>

          <section className="flex flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6 xl:min-h-[340px]">
            <h2 className="heading-sm text-petcenter-text">Nhắc nhở sức khỏe</h2>

            {dashboard.healthReminders.length > 0 ? (
              <div className="mt-5 space-y-4">
                {dashboard.healthReminders.map((reminder) => (
                  <HealthReminder key={reminder.id} reminder={reminder} />
                ))}
              </div>
            ) : (
              <EmptyPanel
                compact
                icon={HeartPulse}
                title="Chưa có nhắc nhở"
                description="Các mũi tiêm đến hạn và lịch tái khám sẽ hiển thị tại đây."
              />
            )}
          </section>
        </div>
      </section>

      <ActivityHistoryDialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
    </div>
  )
}

function PetCard({ pet }: { pet: OwnerDashboardPet }) {
  return (
    <article className="group flex min-w-0 flex-col gap-3 rounded-card border border-petcenter-border-strong bg-petcenter-filter p-3 transition-colors hover:border-petcenter-primary sm:flex-row sm:items-center">
      {pet.profileImageUrl ? (
        <Image
          alt={`Ảnh thú cưng ${pet.petName}`}
          className="h-16 w-16 shrink-0 rounded-full object-cover shadow-card"
          height={64}
          src={pet.profileImageUrl}
          width={64}
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-petcenter-sidebar text-petcenter-primary/40 shadow-card">
          <PawPrint className="h-7 w-7" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="title-md truncate text-petcenter-text">{pet.petName}</h3>
        <p className="body-md mt-1 text-petcenter-text-secondary">
          {[pet.speciesLabel, pet.breed, pet.ageLabel].filter(Boolean).join(" - ")}
        </p>
        <div className="mt-2 flex justify-start sm:justify-end">
          <Link className="label-md font-semibold text-petcenter-primary hover:underline" href={`/owner/pets/${encodeURIComponent(pet.petId)}`}>
            Xem hồ sơ
          </Link>
        </div>
      </div>
    </article>
  )
}

function ActivityRow({ activity }: { activity: OwnerDashboardActivity }) {
  const Icon = activityIconByCategory[activity.activityCategory]

  return (
    <div className="flex items-center gap-4 rounded-control p-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activityIconClassByCategory[activity.activityCategory]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="body-md block text-petcenter-text">{getActivityTitle(activity)}</span>
        <span className="label-md mt-0.5 block text-petcenter-text-secondary">{formatRelativeTime(activity.occurredAt)}</span>
      </span>
    </div>
  )
}

function ActivityHistoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activities, setActivities] = React.useState<OwnerDashboardActivity[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [activeCategory, setActiveCategory] = React.useState<"all" | OwnerDashboardActivity["activityCategory"]>("all")

  const filteredActivities = React.useMemo(() => {
    if (activeCategory === "all") return activities

    return activities.filter((activity) => activity.activityCategory === activeCategory)
  }, [activeCategory, activities])

  const groupedActivities = React.useMemo(() => groupActivitiesByDate(filteredActivities), [filteredActivities])

  React.useEffect(() => {
    if (!open) return

    const abortController = new AbortController()
    setActiveCategory("all")

    async function loadHistory() {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const result = await ownerDashboardApi.listActivityLogs(
          { page: 1, limit: 30 },
          { signal: abortController.signal }
        )

        if (!abortController.signal.aborted) {
          setActivities(result.activities)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setActivities([])
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải lịch sử thay đổi")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadHistory()

    return () => abortController.abort()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-card border border-petcenter-border bg-petcenter-card p-0 text-petcenter-text shadow-modal ring-0 sm:max-w-[820px]"
      >
        <DialogHeader className="border-b border-petcenter-border px-6 py-4">
          <DialogTitle className="heading-sm text-petcenter-text">Lịch sử thay đổi</DialogTitle>
          <DialogDescription className="body-md mt-1 text-petcenter-text-secondary">
            Các cập nhật gần đây được ghi nhận từ log hoạt động của thú cưng.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[min(620px,calc(100vh-13rem))] overflow-y-auto bg-petcenter-background/45 px-5 py-5 sm:px-6">
          {isLoading ? (
            <p className="body-md text-petcenter-text-secondary">Đang tải lịch sử thay đổi...</p>
          ) : errorMessage ? (
            <div className="rounded-control border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
              <p className="body-md font-semibold">Không thể tải lịch sử</p>
              <p className="body-sm mt-1">{errorMessage}</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {activityFilterOptions.map((option) => {
                  const isActive = activeCategory === option.value

                  return (
                    <button
                      className={cn(
                        "label-md rounded-pill border px-3 py-1.5 font-semibold transition-colors",
                        isActive
                          ? "border-petcenter-primary bg-petcenter-primary text-white"
                          : "border-petcenter-border-strong bg-white text-petcenter-text-secondary hover:border-petcenter-primary/40 hover:text-petcenter-primary"
                      )}
                      key={option.value}
                      onClick={() => setActiveCategory(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              {groupedActivities.length > 0 ? (
                <div className="space-y-5">
                  {groupedActivities.map((group) => (
                    <section className="space-y-2" key={group.label}>
                      <h3 className="label-sm uppercase text-petcenter-text-muted">{group.label}</h3>
                      <div className="overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card">
                        {group.activities.map((activity) => (
                          <ActivityHistoryItem activity={activity} key={activity.activityLogId} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-control border border-dashed border-petcenter-border-strong bg-white px-6 py-8 text-center">
                  <p className="body-md font-semibold text-petcenter-text">Không có thay đổi thuộc loại này</p>
                  <p className="body-sm mt-1 text-petcenter-text-secondary">Chọn loại khác để xem thêm lịch sử.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-control border border-dashed border-petcenter-border-strong bg-petcenter-filter px-6 py-10 text-center">
              <p className="title-md text-petcenter-text">Chưa có lịch sử thay đổi</p>
              <p className="body-md mt-1 text-petcenter-text-secondary">
                Khi có log hoạt động, danh sách sẽ hiển thị tại đây.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="m-0 rounded-none border-t border-petcenter-border bg-petcenter-filter px-6 py-4">
          <DialogClose asChild>
            <Button
              className="h-10 rounded-control border-petcenter-border-strong bg-petcenter-card px-8 text-petcenter-text hover:bg-petcenter-sidebar"
              type="button"
              variant="outline"
            >
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ActivityHistoryItem({ activity }: { activity: OwnerDashboardActivity }) {
  const Icon = activityIconByCategory[activity.activityCategory]

  return (
    <article className="border-b border-petcenter-border px-4 py-3 last:border-b-0">
      <div className="flex gap-3">
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activityIconClassByCategory[activity.activityCategory]}`}>
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="body-md font-semibold text-petcenter-text">{getActivityTitle(activity)}</h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="label-md text-petcenter-text-secondary">
                  {activity.petName}
                </span>
                <span className="h-1 w-1 rounded-full bg-petcenter-text-muted" />
                <span className="label-md text-petcenter-text-secondary">
                  {activityCategoryLabel[activity.activityCategory]}
                </span>
                <span className="h-1 w-1 rounded-full bg-petcenter-text-muted" />
                <span className="label-md text-petcenter-text-secondary">{formatTime(activity.occurredAt)}</span>
              </div>
            </div>

            <div className="shrink-0">
              <span
                className={cn(
                  "label-sm rounded-full px-2.5 py-1 font-bold uppercase",
                  activityStatusClassName[activity.activityStatus] ?? "bg-petcenter-sidebar text-petcenter-text-secondary"
                )}
              >
                {activityStatusLabel[activity.activityStatus]}
              </span>
            </div>
          </div>

          {activity.summary ? (
            <p className="body-sm mt-3 line-clamp-2 text-petcenter-text-secondary">{activity.summary}</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function UpcomingAppointment({ appointment }: { appointment: OwnerDashboardAppointment }) {
  const date = new Date(appointment.scheduledAt)
  const day = new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(date)
  const month = new Intl.DateTimeFormat("vi-VN", { month: "long" }).format(date)

  return (
    <article className="rounded-card border border-sky-200 bg-sky-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-card bg-sky-100 text-sky-700">
          <span className="text-xl font-bold leading-none">{day}</span>
          <span className="label-sm mt-0.5 text-center uppercase">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="body-lg truncate font-bold text-petcenter-text">{appointment.examTypeName}</h3>
          <p className="body-md mt-1 text-petcenter-text-secondary">Cho {appointment.petName}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="label-md inline-flex items-center gap-1.5 text-petcenter-text-secondary">
            <Clock3 className="h-4 w-4" />
            {formatTime(appointment.scheduledAt)}
          </span>
          <span className="label-sm rounded-pill bg-emerald-100 px-2.5 py-1 font-bold uppercase text-emerald-700">
            {appointment.appointmentStatusLabel}
          </span>
        </div>
      </div>
    </article>
  )
}

function HealthReminder({ reminder }: { reminder: OwnerDashboardReminder }) {
  const dueDateLabel = reminder.title.toLowerCase().includes("tiêm phòng") ? "Hạn tiêm phòng" : "Hạn tái khám"

  return (
    <div className="space-y-2.5 border-petcenter-border-strong first:border-t-0 first:pt-0 [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-4">
      <p className="body-md font-semibold text-petcenter-text">{reminder.title}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`label-sm inline-block rounded px-2 py-1 font-bold uppercase ${reminder.tone === "overdue" ? "bg-petcenter-danger-bg text-petcenter-danger-text" : "bg-petcenter-warning-bg text-petcenter-warning-text"}`}>
          {reminder.tone === "overdue" ? "Quá hạn" : "Cần đặt lịch"}
        </span>
        <span className="label-md text-petcenter-text-secondary">
          {dueDateLabel}: <span className="font-semibold">{formatDate(reminder.dueDate)}</span>
        </span>
      </div>
      <Link
        className="label-md flex h-9 w-full items-center justify-center rounded-control border border-petcenter-cta/25 bg-petcenter-cta/10 font-semibold text-petcenter-cta-hover transition-colors hover:bg-petcenter-cta/20"
        href={reminder.actionHref}
      >
        Đặt lịch ngay
      </Link>
    </div>
  )
}

function EmptyPanel({
  compact = false,
  description,
  icon: Icon,
  title,
}: {
  compact?: boolean
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
}) {
  return (
    <div className={`flex flex-1 flex-col items-center justify-center rounded-card border border-dashed border-petcenter-border-strong bg-petcenter-filter px-5 text-center ${compact ? "py-8" : "py-12"}`}>
      <Icon className="h-10 w-10 text-petcenter-primary/35" />
      <h3 className="title-md mt-3 text-petcenter-text">{title}</h3>
      <p className="body-sm mt-1 max-w-sm text-petcenter-text-secondary">{description}</p>
    </div>
  )
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mx-auto flex min-h-[420px] w-full max-w-3xl flex-col items-center justify-center rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg/40 px-6 py-12 text-center">
      <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
      <h1 className="heading-sm mt-4 text-petcenter-danger-text">Không thể tải dashboard</h1>
      <p className="body-md mt-2 text-petcenter-text-secondary">{message}</p>
      <button
        className="label-md mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-control bg-petcenter-primary px-4 font-semibold text-white transition-colors hover:bg-petcenter-primary-hover"
        onClick={onRetry}
        type="button"
      >
        <RefreshCw className="h-4 w-4" />
        Thử lại
      </button>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-section">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="h-10 w-80 rounded bg-petcenter-sidebar" />
          <div className="h-5 w-[420px] max-w-full rounded bg-petcenter-sidebar" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-44 rounded-pill bg-petcenter-sidebar" />
          <div className="h-10 w-36 rounded-pill bg-petcenter-sidebar" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-32 rounded-card border border-petcenter-border bg-white p-4 shadow-card" key={index}>
            <div className="h-4 w-28 rounded bg-petcenter-sidebar" />
            <div className="mt-10 h-9 w-12 rounded bg-petcenter-sidebar" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="h-[520px] rounded-card bg-white shadow-card" />
        <div className="h-[520px] rounded-card bg-white shadow-card" />
      </div>
    </div>
  )
}

function getActivityTitle(activity: OwnerDashboardActivity): string {
  if (activity.activityCategory === "grooming") {
    if (activity.activityStatus === "completed") return `Dịch vụ spa của ${activity.petName} đã hoàn tất`
    if (activity.activityStatus === "cancelled") return `Dịch vụ spa của ${activity.petName} đã bị hủy`
    if (activity.activityStatus === "confirmed") return `Dịch vụ spa của ${activity.petName} đã được xác nhận`
    return `Dịch vụ spa của ${activity.petName} đã được đặt`
  }

  if (activity.activityCategory === "medical") {
    if (activity.activityType === "medical_exam_recorded") return `Hồ sơ khám của ${activity.petName} đã có kết quả`
    return `Hồ sơ y tế của ${activity.petName} có cập nhật`
  }

  if (activity.activityCategory === "vaccination") {
    return `Lịch sử tiêm phòng của ${activity.petName} có cập nhật`
  }

  if (activity.activityCategory === "boarding") {
    return `Lưu trú của ${activity.petName} có cập nhật`
  }

  if (activity.activityCategory === "invoice") {
    return `Hóa đơn của ${activity.petName} có cập nhật`
  }

  if (activity.activityCategory === "payment") {
    return `Thanh toán của ${activity.petName} có cập nhật`
  }

  return activity.title || `Hồ sơ của ${activity.petName} có cập nhật`
}

function groupActivitiesByDate(activities: OwnerDashboardActivity[]): Array<{ label: string; activities: OwnerDashboardActivity[] }> {
  const groups = new Map<string, OwnerDashboardActivity[]>()

  activities.forEach((activity) => {
    const label = getActivityDateGroupLabel(activity.occurredAt)
    const currentActivities = groups.get(label) ?? []

    currentActivities.push(activity)
    groups.set(label, currentActivities)
  })

  return Array.from(groups.entries()).map(([label, groupedItems]) => ({
    label,
    activities: groupedItems,
  }))
}

function getActivityDateGroupLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Không rõ ngày"

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Hôm nay"
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua"

  return formatDate(value)
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return ""

  const diffMs = Date.now() - timestamp
  if (diffMs < -60000) return formatDate(value)
  if (Math.abs(diffMs) < 60000) return "Vừa xong"

  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 60) return `${diffMinutes} phút trước`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`

  return formatDate(value)
}
