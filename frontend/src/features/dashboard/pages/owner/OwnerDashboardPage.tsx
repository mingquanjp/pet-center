"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  BellRing,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
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

export function OwnerDashboardPage() {
  const [dashboard, setDashboard] = React.useState<OwnerDashboard | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

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

      <section className="grid grid-cols-1 items-start gap-gutter xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-section">
          <section className="flex min-h-[340px] flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6">
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

          <section className="rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="heading-sm text-petcenter-text">Dịch vụ gần đây</h2>
              <Link className="label-md font-semibold text-petcenter-primary hover:underline" href="/owner/spa">
                Xem lịch sử dịch vụ
              </Link>
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
                title="Chưa có hoạt động gần đây"
                description="Các dịch vụ, thanh toán và cập nhật hồ sơ sẽ xuất hiện khi có dữ liệu."
              />
            )}
          </section>
        </div>

        <div className="flex flex-col gap-section">
          <section className="flex min-h-[340px] flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="heading-sm text-petcenter-text">Lịch hẹn sắp tới</h2>
              <Link className="label-md font-semibold text-petcenter-primary hover:underline" href="/owner/appointments">
                Chi tiết
              </Link>
            </div>

            {dashboard.upcomingAppointment ? (
              <UpcomingAppointment appointment={dashboard.upcomingAppointment} />
            ) : (
              <EmptyPanel
                icon={CalendarDays}
                title="Không có lịch hẹn sắp tới"
                description="Bạn có thể đặt thêm lịch khám khi cần."
              />
            )}
          </section>

          <section className="rounded-card border border-petcenter-border bg-white p-5 shadow-card sm:p-6">
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
    <Link
      className="flex items-center gap-4 rounded-control p-3 transition-colors hover:bg-petcenter-sidebar"
      href={getActivityHref(activity)}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activityIconClassByCategory[activity.activityCategory]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="body-md block text-petcenter-text">{activity.title}</span>
        <span className="label-md mt-0.5 block text-petcenter-text-secondary">{formatRelativeTime(activity.occurredAt)}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-petcenter-text-muted" />
    </Link>
  )
}

function UpcomingAppointment({ appointment }: { appointment: NonNullable<OwnerDashboard["upcomingAppointment"]> }) {
  const date = new Date(appointment.scheduledAt)
  const day = new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(date)
  const month = new Intl.DateTimeFormat("vi-VN", { month: "long" }).format(date)

  return (
    <article className="rounded-card border border-sky-200 bg-sky-50 p-5">
      <div className="flex gap-4">
        <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-card bg-sky-100 text-sky-700">
          <span className="text-[28px] font-bold leading-none">{day}</span>
          <span className="label-sm mt-1 text-center uppercase">{month}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="body-lg font-bold text-petcenter-text">{appointment.examTypeName}</h3>
          <p className="body-md mt-1 text-petcenter-text-secondary">Cho {appointment.petName}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="label-md inline-flex items-center gap-1.5 text-petcenter-text-secondary">
          <Clock3 className="h-4 w-4" />
          {formatTime(appointment.scheduledAt)}
        </span>
        <span className="label-sm rounded-pill bg-emerald-100 px-3 py-1 font-bold uppercase text-emerald-700">
          {appointment.appointmentStatusLabel}
        </span>
      </div>
    </article>
  )
}

function HealthReminder({ reminder }: { reminder: OwnerDashboardReminder }) {
  return (
    <div className="space-y-2.5 border-petcenter-border-strong first:border-t-0 first:pt-0 [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-4">
      <p className="body-md font-semibold text-petcenter-text">{reminder.title}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`label-sm inline-block rounded px-2 py-1 font-bold uppercase ${reminder.tone === "overdue" ? "bg-petcenter-danger-bg text-petcenter-danger-text" : "bg-petcenter-warning-bg text-petcenter-warning-text"}`}>
          {reminder.tone === "overdue" ? "Quá hạn" : "Sắp đến hạn"}
        </span>
        <span className="label-md text-petcenter-text-secondary">{formatDate(reminder.dueDate)}</span>
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

function getActivityHref(activity: OwnerDashboardActivity): string {
  if (activity.activityCategory === "grooming") return "/owner/spa"
  if (activity.activityCategory === "boarding") return "/owner/boarding"
  if (activity.activityCategory === "invoice" || activity.activityCategory === "payment") return "/owner/invoices"

  return `/owner/pets/${encodeURIComponent(activity.petId)}`
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

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime()
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) return `${diffMinutes} phút trước`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`

  return formatDate(value)
}
