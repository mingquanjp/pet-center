"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Edit3,
  FileText,
  HeartPulse,
  History,
  Mars,
  PawPrint,
  Scissors,
  Syringe,
  Venus,
  Weight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { petsApi } from "../../api/pets.api"
import type { PetDetail } from "../../types/pet.types"

const tabs = ["Hồ sơ cơ bản", "Lịch sử khám", "Sổ tiêm chủng", "Lịch sử spa", "Lịch sử lưu trú"]

const recentActivities = [
  {
    title: "Khám sức khỏe định kỳ",
    meta: "Bác sĩ: Bs. Trần Văn B",
    date: "12/10/2023 - 09:30",
    description:
      "Thú cưng phát triển bình thường, cân nặng ổn định. Đã tẩy giun định kỳ. Khuyến nghị duy trì chế độ ăn hiện tại.",
    icon: HeartPulse,
    tone: "primary",
    tag: "Toa thuốc",
    tagIcon: FileText,
  },
  {
    title: "Dịch vụ spa và cắt tỉa",
    meta: "Nhân viên: Nguyễn Thị C",
    date: "25/09/2023 - 14:00",
    description: "Gội tắm thảo dược và tỉa lông. Thú cưng hợp tác tốt trong quá trình chăm sóc.",
    icon: Scissors,
    tone: "warning",
  },
  {
    title: "Tiêm vaccine Rabies",
    meta: "Bác sĩ: Bs. Trần Văn B",
    date: "10/06/2023 - 10:15",
    description: "Tiêm phòng dại mũi nhắc lại hằng năm. Cần theo dõi phản ứng trong 24 giờ sau tiêm.",
    icon: Syringe,
    tone: "muted",
    tag: "Đã hoàn thành",
    tagIcon: CheckCircle2,
  },
]
const recentActivitiesPreview = recentActivities.slice(0, 3)

export function OwnerPetDetailPage({ petId }: { petId: string }) {
  const [pet, setPet] = React.useState<PetDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadPet() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await petsApi.get(petId)

        if (!abortController.signal.aborted) {
          setPet(result)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setPet(null)
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải hồ sơ thú cưng")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadPet()

    return () => {
      abortController.abort()
    }
  }, [petId])

  if (isLoading) {
    return <PetDetailSkeleton />
  }

  if (errorMessage || !pet) {
    return <ErrorState message={errorMessage ?? "Không tìm thấy hồ sơ thú cưng"} />
  }

  const GenderIcon = pet.gender === "female" ? Venus : Mars
  const subtitle = [pet.speciesLabel, pet.breed].filter(Boolean).join(" / ")

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-gutter">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav className="label-md flex flex-wrap items-center gap-2 text-petcenter-text-secondary">
          <Link className="transition-colors hover:text-petcenter-primary" href="/owner/pets">
            Thú cưng
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link className="transition-colors hover:text-petcenter-primary" href="/owner/pets">
            Danh sách thú cưng
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-petcenter-text">{pet.petName}</span>
        </nav>

        <Link
          className="label-md inline-flex h-10 w-full items-center justify-center gap-2 rounded-control border border-petcenter-primary px-4 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5 sm:w-auto"
          href="/owner/pets"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>

      <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative mx-auto h-32 w-32 shrink-0 lg:mx-0">
            {pet.profileImageUrl ? (
              <div
                aria-label={`Ảnh thú cưng ${pet.petName}`}
                className="h-full w-full rounded-full border-4 border-petcenter-primary bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${pet.profileImageUrl})` }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-petcenter-primary bg-petcenter-sidebar">
                <PawPrint className="h-14 w-14 text-petcenter-primary/40" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <h1 className="heading-md text-petcenter-text">{pet.petName}</h1>
            </div>

            <p className="body-md mt-2 flex items-center justify-center gap-2 text-petcenter-text-secondary lg:justify-start">
              <PawPrint className="h-4 w-4" />
              {subtitle || pet.speciesLabel} • {pet.ageLabel}
            </p>

            <button
              className="label-md mt-4 inline-flex h-10 items-center gap-2 rounded-control border border-petcenter-border-strong bg-petcenter-sidebar px-4 text-petcenter-text-secondary transition hover:bg-petcenter-filter"
              type="button"
            >
              Đang xem: <span className="font-semibold text-petcenter-text">{pet.petName}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <button className="label-md inline-flex h-11 items-center justify-center gap-2 rounded-control border border-petcenter-primary px-5 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5">
              <Edit3 className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </button>
            <button className="label-md inline-flex h-11 items-center justify-center gap-2 rounded-control bg-petcenter-cta px-5 font-semibold text-white shadow-card transition hover:bg-petcenter-cta-hover">
              <CalendarPlus className="h-4 w-4" />
              Đặt lịch khám
            </button>
          </div>
        </div>
      </section>

      <nav className="flex gap-8 overflow-x-auto border-b border-petcenter-border-strong" aria-label="Tab hồ sơ thú cưng">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={cn(
              "label-md shrink-0 border-b-2 pb-3 font-semibold transition-colors",
              index === 0
                ? "border-petcenter-primary text-petcenter-primary"
                : "border-transparent text-petcenter-text-secondary hover:text-petcenter-primary"
            )}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="flex flex-col gap-gutter lg:col-span-5">
          <InfoCard pet={pet} />
          <StatsCard GenderIcon={GenderIcon} pet={pet} />
        </div>

        <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card lg:col-span-7">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-petcenter-primary" />
              <h2 className="heading-sm text-petcenter-text">Hoạt động gần đây</h2>
            </div>
            <button className="label-md inline-flex items-center gap-1 font-semibold text-petcenter-primary hover:underline">
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative ml-1.5">
            <div className="absolute bottom-0 left-[5.5px] top-0 w-px bg-petcenter-border-strong" />
            <div className="space-y-10">
              {recentActivitiesPreview.map((item) => (
                <ActivityItem key={item.title} activity={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function InfoCard({ pet }: { pet: PetDetail }) {
  return (
    <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card">
      <SectionTitle icon={ClipboardList} title="Chi tiết thú cưng" />
      <div className="space-y-1">
        <DetailRow label="Tên thú cưng" value={pet.petName} />
        <DetailRow label="Giống loài" value={[pet.speciesLabel, pet.breed].filter(Boolean).join(" / ")} />
        <DetailRow label="Giới tính" value={pet.genderLabel} />
        <DetailRow label="Ngày sinh" value={formatDate(pet.birthDate)} />
        <div className="pt-3">
          <p className="body-md text-petcenter-text-secondary">Đặc điểm nhận dạng</p>
          <p className="body-md mt-2 rounded-control bg-petcenter-filter p-3 italic text-petcenter-text">
            {pet.identifyingMarks || "Chưa cập nhật"}
          </p>
        </div>
      </div>
    </section>
  )
}

function StatsCard({ GenderIcon, pet }: { GenderIcon: typeof Mars; pet: PetDetail }) {
  const stats = [
    { label: "Tuổi", value: pet.ageLabel, icon: Activity },
    { label: "Giới tính", value: pet.genderLabel, icon: GenderIcon },
    { label: "Cân nặng", value: pet.weightKg ? `${pet.weightKg} kg` : "Chưa cập nhật", icon: Weight },
    { label: "Màu lông", value: pet.furColor || "Chưa cập nhật", icon: PawPrint },
  ]

  return (
    <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card">
      <SectionTitle icon={Activity} title="Chỉ số cơ bản" />
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className="rounded-control bg-petcenter-sidebar p-4 text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-petcenter-primary" />
              <p className="label-md mb-1 text-petcenter-text-secondary">{stat.label}</p>
              <p className="title-md break-words text-petcenter-primary">{stat.value}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ActivityItem({ activity }: { activity: (typeof recentActivities)[number] }) {
  const Icon = activity.icon
  const TagIcon = activity.tagIcon

  return (
    <article className="relative pl-8">
      <span
        className={cn(
          "absolute left-0 top-1.5 z-10 h-3 w-3 rounded-full",
          activity.tone === "primary" && "bg-petcenter-primary",
          activity.tone === "warning" && "bg-petcenter-cta",
          activity.tone === "muted" && "bg-petcenter-border-strong"
        )}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="title-md flex items-center gap-2 text-petcenter-text">
            <Icon className="h-5 w-5 text-petcenter-primary" />
            {activity.title}
          </h3>
          <span className="label-md w-fit rounded-pill bg-petcenter-filter px-3 py-1 text-petcenter-text-secondary">
            {activity.date}
          </span>
        </div>
        <p className="body-md text-petcenter-text-secondary">{activity.meta}</p>
        <div className="rounded-control border border-petcenter-border bg-petcenter-filter p-4">
          <p className="body-md text-petcenter-text">{activity.description}</p>
          {activity.tag ? (
            <div className="mt-3">
              <span className="label-sm inline-flex items-center gap-1 rounded bg-petcenter-primary/10 px-2 py-1 font-semibold text-petcenter-primary">
                {TagIcon ? <TagIcon className="h-3.5 w-3.5" /> : null}
                {activity.tag}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: typeof ClipboardList; title: string }) {
  return (
    <h2 className="label-md mb-4 flex items-center gap-2 font-bold uppercase text-petcenter-primary">
      <Icon className="h-5 w-5" />
      {title}
    </h2>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-petcenter-border/70 py-3 last:border-b-0">
      <span className="body-md text-petcenter-text-secondary">{label}</span>
      <span className="body-md max-w-[55%] text-right font-semibold text-petcenter-text">{value || "Chưa cập nhật"}</span>
    </div>
  )
}

function PetDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl animate-pulse flex-col gap-gutter">
      <div className="h-10 w-64 rounded bg-petcenter-sidebar" />
      <section className="h-56 rounded-card border border-petcenter-border bg-white shadow-card" />
      <div className="h-11 rounded bg-petcenter-sidebar" />
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="space-y-gutter lg:col-span-5">
          <div className="h-80 rounded-card bg-white shadow-card" />
          <div className="h-64 rounded-card bg-white shadow-card" />
        </div>
        <div className="h-[620px] rounded-card bg-white shadow-card lg:col-span-7" />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="mx-auto flex w-full max-w-3xl items-start gap-3 rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h1 className="label-md font-semibold">Không thể tải hồ sơ thú cưng</h1>
        <p className="body-md mt-1">{message}</p>
        <Link className="label-md mt-4 inline-flex font-semibold text-petcenter-danger-text underline" href="/owner/pets">
          Quay lại danh sách thú cưng
        </Link>
      </div>
    </section>
  )
}

function formatDate(value: string | null) {
  if (!value) return "Chưa cập nhật"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
