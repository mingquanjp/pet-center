"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  Edit3,
  FileText,
  HeartPulse,
  History,
  Info,
  Mars,
  Pill,
  PawPrint,
  RotateCcw,
  Scissors,
  Search,
  Stethoscope,
  Syringe,
  Venus,
  Weight,
} from "lucide-react"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { petsApi } from "../../api/pets.api"
import type { PetDetail } from "../../types/pet.types"

const tabs = [
  { id: "basic", label: "Hồ sơ cơ bản" },
  { id: "medical-history", label: "Lịch sử khám" },
  { id: "vaccination", label: "Sổ tiêm chủng" },
  { id: "spa-history", label: "Lịch sử spa" },
] as const

type PetDetailTab = (typeof tabs)[number]["id"]

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

const examinationRecords = [
  {
    title: "Khám sức khỏe định kỳ",
    date: "12/10/2023",
    time: "09:30 AM",
    type: "Khám định kỳ",
    doctor: "Bs. Trần Văn B",
    diagnosis: "Sức khỏe ổn định",
    conclusion:
      "Thú cưng phát triển bình thường, cân nặng ổn định. Đã tẩy giun định kỳ. Khuyến nghị duy trì chế độ ăn hiện tại.",
  },
  {
    title: "Khám da liễu",
    date: "20/07/2023",
    time: "15:00 PM",
    type: "Khám bệnh",
    doctor: "Bs. Lê Thu H",
    diagnosis: "Kích ứng da nhẹ",
    conclusion: "Theo dõi trong 7 ngày, vệ sinh vùng cổ và tránh tiếp xúc hóa chất tắm gội mạnh.",
  },
  {
    title: "Tái khám sau điều trị",
    date: "28/07/2023",
    time: "10:00 AM",
    type: "Tái khám",
    doctor: "Bs. Lê Thu H",
    diagnosis: "Da phục hồi tốt",
    conclusion: "Không cần điều trị thêm. Tiếp tục theo dõi và duy trì vệ sinh định kỳ.",
  },
]

const vaccinationFilters = [
  { id: "all", label: "Tất cả" },
  { id: "completed", label: "Đã hoàn thành" },
  { id: "due-soon", label: "Sắp đến hạn" },
  { id: "overdue", label: "Quá hạn" },
] as const

type VaccinationFilter = (typeof vaccinationFilters)[number]["id"]

const vaccinationRecords = [
  {
    id: "rabies-2023",
    name: "Vaccine Rabies (Dại)",
    shortName: "Vaccine Rabies",
    type: "Tiêm phòng dại",
    status: "due-soon",
    statusLabel: "Sắp đến hạn",
    performedDate: "10/06/2023",
    reminderDate: "10/06/2024",
    doctor: "Bs. Trần Văn B",
    note: "Cần theo dõi 24h sau tiêm.",
    reaction: "Không ghi nhận bất thường.",
    reminderNote: "Vui lòng đặt lịch trước 3-5 ngày",
    icon: Syringe,
  },
  {
    id: "care-2023",
    name: "Vaccine Care (5 trong 1)",
    shortName: "Vaccine Care",
    type: "Vaccine tổng hợp",
    status: "completed",
    statusLabel: "Đã hoàn thành",
    performedDate: "15/04/2023",
    reminderDate: "15/04/2024",
    doctor: "Bs. Nguyễn Thị A",
    note: "Không có dấu hiệu bất thường.",
    reaction: "Không ghi nhận bất thường.",
    reminderNote: "Nhắc lại theo chỉ định bác sĩ",
    icon: Syringe,
  },
  {
    id: "deworm-2023",
    name: "Tẩy giun định kỳ",
    shortName: "Tẩy giun định kỳ",
    type: "Phòng ký sinh trùng",
    status: "completed",
    statusLabel: "Đã hoàn thành",
    performedDate: "12/10/2023",
    reminderDate: "12/01/2024",
    doctor: "Bs. Lê Văn C",
    note: "Uống thuốc Nexgard.",
    reaction: "Không ghi nhận bất thường.",
    reminderNote: "Duy trì tẩy giun định kỳ mỗi 3 tháng",
    icon: Pill,
  },
  {
    id: "parvo-2023",
    name: "Vaccine Parvo",
    shortName: "Vaccine Parvo",
    type: "Tiêm phòng Parvo",
    status: "completed",
    statusLabel: "Đã hoàn thành",
    performedDate: "10/02/2023",
    reminderDate: "10/02/2024",
    doctor: "Bs. Trần Văn B",
    note: "Thú cưng khỏe mạnh.",
    reaction: "Không ghi nhận bất thường.",
    reminderNote: "Theo dõi lịch nhắc lại hàng năm",
    icon: Syringe,
  },
] satisfies Array<{
  id: string
  name: string
  shortName: string
  type: string
  status: VaccinationFilter
  statusLabel: string
  performedDate: string
  reminderDate: string
  doctor: string
  note: string
  reaction: string
  reminderNote: string
  icon: typeof Syringe
}>

const spaServiceTypeOptions = ["Tất cả", "Cắt tỉa tạo kiểu", "Tắm gội", "Chăm sóc móng"] as const
const spaTimeOptions = ["Tất cả thời gian", "3 tháng gần đây", "6 tháng gần đây", "Năm nay"] as const

type SpaServiceTypeFilter = (typeof spaServiceTypeOptions)[number]
type SpaTimeFilter = (typeof spaTimeOptions)[number]

const spaRecords = [
  {
    id: "spa-2023-09-25",
    title: "Cắt tỉa tạo kiểu",
    date: "25/09/2023",
    time: "14:00 PM",
    serviceType: "Cắt tỉa tạo kiểu",
    packageName: "Gói tạo kiểu Golden",
    includedServices: "Tắm sấy, cắt tỉa lông, vệ sinh tai, xịt dưỡng khử mùi.",
    staff: "Nguyễn Thị C",
  },
  {
    id: "spa-2023-08-10",
    title: "Tắm gội cơ bản",
    date: "10/08/2023",
    time: "09:30 AM",
    serviceType: "Tắm gội",
    packageName: "Tắm thảo mộc",
    includedServices: "Tắm sấy khử mùi, chải lông, vệ sinh tuyến hôi.",
    staff: "Trần Văn D",
  },
  {
    id: "spa-2023-07-15",
    title: "Chăm sóc móng",
    date: "15/07/2023",
    time: "16:15 PM",
    serviceType: "Chăm sóc móng",
    packageName: "Cắt mài móng",
    includedServices: "Cắt móng, mài dũa an toàn, dưỡng viền móng.",
    staff: "Nguyễn Thị C",
  },
] satisfies Array<{
  id: string
  title: string
  date: string
  time: string
  serviceType: Exclude<SpaServiceTypeFilter, "Tất cả">
  packageName: string
  includedServices: string
  staff: string
}>

export function OwnerPetDetailPage({ petId }: { petId: string }) {
  const [pet, setPet] = React.useState<PetDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<PetDetailTab>("basic")

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
        {tabs.map((tab) => (
          <button
            key={tab.id}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={cn(
              "label-md shrink-0 border-b-2 pb-3 font-semibold transition-colors",
              activeTab === tab.id
                ? "border-petcenter-primary text-petcenter-primary"
                : "border-transparent text-petcenter-text-secondary hover:text-petcenter-primary"
            )}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "basic" ? <BasicProfileTab GenderIcon={GenderIcon} pet={pet} /> : null}
      {activeTab === "medical-history" ? <MedicalHistoryTab petName={pet.petName} /> : null}
      {activeTab === "vaccination" ? <VaccinationTab petName={pet.petName} /> : null}
      {activeTab === "spa-history" ? <SpaHistoryTab petName={pet.petName} /> : null}
    </div>
  )
}

function BasicProfileTab({ GenderIcon, pet }: { GenderIcon: typeof Mars; pet: PetDetail }) {
  return (
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
  )
}

function MedicalHistoryTab({ petName }: { petName: string }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-card border border-petcenter-border-strong bg-white p-6 shadow-card">
        <h2 className="label-md mb-4 font-bold uppercase text-petcenter-text">Tóm tắt khám bệnh</h2>
        <div className="grid gap-6 md:grid-cols-3 md:divide-x md:divide-petcenter-border-strong">
          <SummaryMetric label="Tổng số lần khám" value={String(examinationRecords.length)} />
          <SummaryMetric label="Lần khám gần nhất" value={examinationRecords[0]?.date ?? "Chưa có dữ liệu"} />
          <SummaryMetric label="Bác sĩ gần đây" value={examinationRecords[0]?.doctor ?? "Chưa có dữ liệu"} />
        </div>
      </section>

      <section className="rounded-card border border-petcenter-border-strong bg-white p-6 shadow-card">
        <h2 className="label-md mb-4 font-bold uppercase text-petcenter-text md:hidden">Bộ lọc lịch sử</h2>
        <div className="grid items-end gap-4 md:grid-cols-[minmax(260px,2fr)_minmax(160px,1fr)_minmax(170px,1fr)_auto]">
          <label className="block">
            <span className="label-sm mb-1 block font-bold text-petcenter-text-secondary">Tìm kiếm</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
              <input
                className="body-sm h-10 w-full rounded-control border-0 bg-petcenter-sidebar pl-10 pr-3 text-petcenter-text outline-none transition focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20"
                placeholder="Tìm theo bác sĩ, chẩn đoán..."
                type="search"
              />
            </span>
          </label>

          <FilterSelect label="Loại khám" options={["Tất cả", "Khám định kỳ", "Khám bệnh", "Tái khám"]} />
          <FilterSelect label="Thời gian" options={["Tất cả thời gian", "3 tháng gần đây", "6 tháng gần đây", "Năm nay"]} />

          <button className="label-md inline-flex h-10 w-full items-center justify-center gap-2 rounded-control px-4 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5 md:w-auto">
            <RotateCcw className="h-4 w-4" />
            Đặt lại bộ lọc
          </button>
        </div>
      </section>

      <section className="w-full">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-petcenter-primary/10 text-petcenter-primary">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="heading-sm text-petcenter-text">Lịch sử khám bệnh</h2>
              <p className="body-sm text-petcenter-text-secondary">Theo dõi các lần khám, chẩn đoán và kết luận của {petName}.</p>
            </div>
          </div>

          <button className="label-md inline-flex w-fit items-center gap-2 font-semibold text-petcenter-primary transition hover:underline">
            Xuất lịch sử
            <Download className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {examinationRecords.map((record) => (
            <ExaminationRecordCard key={`${record.title}-${record.date}`} record={record} />
          ))}
        </div>
      </section>
    </div>
  )
}

function VaccinationTab({ petName }: { petName: string }) {
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<VaccinationFilter>("all")
  const [selectedRecord, setSelectedRecord] = React.useState<(typeof vaccinationRecords)[number] | null>(null)

  const filteredRecords = vaccinationRecords.filter((record) => {
    const matchesFilter = activeFilter === "all" || record.status === activeFilter
    const normalizedSearch = searchValue.trim().toLowerCase()
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [record.name, record.type, record.doctor, record.note].some((value) => value.toLowerCase().includes(normalizedSearch))

    return matchesFilter && matchesSearch
  })

  const latestRecord = vaccinationRecords[0]

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-petcenter-primary" />
            <h2 className="label-md font-bold text-petcenter-primary">Tóm tắt tiêm chủng</h2>
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:max-w-3xl lg:divide-x lg:divide-petcenter-border-strong">
            <SummaryInline label="Tổng số liều" value={`${vaccinationRecords.length} liều`} />
            <SummaryInline label="Mũi gần nhất" value={`${latestRecord.shortName} - ${latestRecord.performedDate}`} />
          </div>
        </div>
      </section>

      <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card lg:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-petcenter-primary/10 text-petcenter-primary">
              <Syringe className="h-7 w-7" />
            </div>
            <div>
              <h2 className="heading-sm text-petcenter-text">Sổ tiêm chủng</h2>
              <p className="body-md text-petcenter-text-secondary">Theo dõi lịch trình tiêm chủng và phòng bệnh của {petName}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block min-w-[220px] flex-1">
            <span className="sr-only">Tìm vaccine</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
            <input
              className="body-sm h-10 w-full rounded-control border-0 bg-petcenter-sidebar pl-10 pr-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-muted/70 focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Tìm vaccine..."
              type="search"
              value={searchValue}
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {vaccinationFilters.map((filter) => (
              <button
                key={filter.id}
                className={cn(
                  "label-sm h-8 shrink-0 rounded-control px-3 font-bold transition",
                  activeFilter === filter.id
                    ? "bg-petcenter-primary text-white"
                    : "bg-petcenter-sidebar text-petcenter-text-secondary hover:bg-petcenter-border"
                )}
                onClick={() => setActiveFilter(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <VaccinationRecordCard key={record.id} onViewDetails={() => setSelectedRecord(record)} record={record} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-petcenter-border-strong bg-petcenter-filter p-8 text-center">
            <Info className="mx-auto mb-3 h-8 w-8 text-petcenter-text-muted" />
            <h3 className="title-md text-petcenter-text">Không tìm thấy bản ghi</h3>
            <p className="body-md mt-1 text-petcenter-text-secondary">Thử đổi từ khóa hoặc bộ lọc tiêm chủng.</p>
          </div>
        )}
      </section>

      <VaccinationDetailDialog onOpenChange={(open) => !open && setSelectedRecord(null)} petName={petName} record={selectedRecord} />
    </div>
  )
}

function SpaHistoryTab({ petName }: { petName: string }) {
  const [searchValue, setSearchValue] = React.useState("")
  const [serviceTypeFilter, setServiceTypeFilter] = React.useState<SpaServiceTypeFilter>("Tất cả")
  const [timeFilter, setTimeFilter] = React.useState<SpaTimeFilter>("Tất cả thời gian")

  const filteredRecords = spaRecords.filter((record) => {
    const normalizedSearch = searchValue.trim().toLowerCase()
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [record.title, record.packageName, record.includedServices, record.staff].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    const matchesType = serviceTypeFilter === "Tất cả" || record.serviceType === serviceTypeFilter

    return matchesSearch && matchesType
  })

  const latestRecord = spaRecords[0]

  function resetFilters() {
    setSearchValue("")
    setServiceTypeFilter("Tất cả")
    setTimeFilter("Tất cả thời gian")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card">
        <div className="grid gap-6 md:grid-cols-3 md:divide-x md:divide-petcenter-border-strong">
          <SummaryMetric label="Tổng số lần sử dụng" value={String(spaRecords.length)} />
          <SummaryMetric label="Lần gần nhất" value={latestRecord?.date ?? "Chưa có dữ liệu"} />
          <SummaryMetric label="Nhân viên" value={latestRecord?.staff ?? "Chưa có dữ liệu"} />
        </div>
      </section>

      <section className="rounded-card border border-petcenter-border bg-white p-4 shadow-card">
        <div className="grid items-end gap-4 md:grid-cols-[minmax(260px,2fr)_minmax(160px,1fr)_minmax(170px,1fr)_auto]">
          <label className="block">
            <span className="label-sm mb-1 block font-bold text-petcenter-text-secondary">Tìm kiếm</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
              <input
                className="body-sm h-10 w-full rounded-control border-0 bg-petcenter-sidebar pl-10 pr-3 text-petcenter-text outline-none transition focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm theo dịch vụ, nhân viên..."
                type="search"
                value={searchValue}
              />
            </span>
          </label>

          <SpaHistorySelect
            label="Loại dịch vụ"
            onChange={(value) => setServiceTypeFilter(value as SpaServiceTypeFilter)}
            options={spaServiceTypeOptions}
            value={serviceTypeFilter}
          />
          <SpaHistorySelect
            label="Thời gian"
            onChange={(value) => setTimeFilter(value as SpaTimeFilter)}
            options={spaTimeOptions}
            value={timeFilter}
          />

          <button
            className="label-md inline-flex h-10 w-full items-center justify-center gap-2 rounded-control px-4 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5 md:w-auto"
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Đặt lại bộ lọc
          </button>
        </div>

        {timeFilter !== "Tất cả thời gian" ? (
          <p className="label-sm mt-3 text-petcenter-text-secondary">Bộ lọc thời gian đang được giữ cho dữ liệu API thật.</p>
        ) : null}
      </section>

      <section className="w-full">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-petcenter-primary/10 text-petcenter-primary">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="heading-sm text-petcenter-text">Lịch sử spa</h2>
              <p className="body-sm text-petcenter-text-secondary">Chi tiết các lần làm đẹp và chăm sóc của {petName}.</p>
            </div>
          </div>

          <button className="label-md inline-flex w-fit items-center gap-2 font-semibold text-petcenter-primary transition hover:underline">
            Xuất lịch sử
            <Download className="h-4 w-4" />
          </button>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <SpaRecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-petcenter-border-strong bg-petcenter-filter p-8 text-center">
            <Info className="mx-auto mb-3 h-8 w-8 text-petcenter-text-muted" />
            <h3 className="title-md text-petcenter-text">Không tìm thấy lịch sử spa</h3>
            <p className="body-md mt-1 text-petcenter-text-secondary">Thử đổi từ khóa hoặc bộ lọc dịch vụ.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function SpaHistorySelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: readonly string[]
  value: string
}) {
  return (
    <label className="block">
      <span className="label-sm mb-1 block font-bold text-petcenter-text-secondary">{label}</span>
      <select
        className="body-sm h-10 w-full rounded-control border-0 bg-petcenter-sidebar px-3 text-petcenter-text outline-none transition focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function SpaRecordCard({ record }: { record: (typeof spaRecords)[number] }) {
  return (
    <article className="rounded-card border border-petcenter-border bg-white p-6 shadow-card">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h3 className="title-md text-petcenter-text">{record.title}</h3>
            <span className="label-sm rounded-pill bg-petcenter-primary/10 px-2.5 py-1 font-semibold text-petcenter-primary">
              {record.serviceType}
            </span>
          </div>
          <p className="body-sm flex items-center gap-1.5 text-petcenter-text-secondary">
            <CalendarDays className="h-4 w-4" />
            {record.date} - {record.time}
          </p>
        </div>

        <div className="md:text-right">
          <p className="label-sm uppercase text-petcenter-text-secondary">Nhân viên thực hiện</p>
          <p className="body-md font-bold text-petcenter-text">{record.staff}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecordNote label="Gói dịch vụ" value={record.packageName} />
        <RecordNote label="Dịch vụ bao gồm" value={record.includedServices} />
      </div>
    </article>
  )
}

function SummaryInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:pl-8 first:lg:pl-0">
      <span className="body-md text-petcenter-text-secondary">{label}:</span>
      <strong className="body-md font-bold text-petcenter-text">{value}</strong>
    </div>
  )
}

function VaccinationRecordCard({
  onViewDetails,
  record,
}: {
  onViewDetails: () => void
  record: (typeof vaccinationRecords)[number]
}) {
  const Icon = record.icon

  return (
    <article className="flex flex-col gap-6 rounded-card border border-petcenter-border bg-white p-5 shadow-card lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-control",
              record.status === "due-soon"
                ? "bg-petcenter-warning-bg text-petcenter-warning-text"
                : "bg-petcenter-success-bg text-petcenter-success-text"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="body-lg font-semibold text-petcenter-text">{record.name}</h3>
              <VaccinationStatusBadge status={record.status} label={record.statusLabel} />
            </div>
          </div>
        </div>

        <button
          className="label-sm inline-flex h-10 w-full items-center justify-center rounded-control border border-petcenter-primary px-4 font-bold text-petcenter-primary transition hover:bg-petcenter-primary/5 md:w-auto"
          onClick={onViewDetails}
          type="button"
        >
          Xem chi tiết
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <VaccinationField label="Ngày thực hiện" value={record.performedDate} />
        <VaccinationField emphasis label="Ngày nhắc lại" value={record.reminderDate} />
        <VaccinationField label="Bác sĩ" value={record.doctor} />
        <VaccinationField italic label="Ghi chú" value={record.note} />
      </div>
    </article>
  )
}

function VaccinationField({ emphasis = false, italic = false, label, value }: { emphasis?: boolean; italic?: boolean; label: string; value: string }) {
  return (
    <div>
      <p className="label-md mb-1 text-petcenter-text-secondary">{label}</p>
      <p className={cn("body-md font-medium text-petcenter-text", emphasis && "text-petcenter-cta-active", italic && "italic")}>{value}</p>
    </div>
  )
}

function VaccinationStatusBadge({ label, status }: { label: string; status: VaccinationFilter }) {
  return (
    <span
      className={cn(
        "label-sm inline-flex h-7 items-center rounded-pill px-3 font-bold uppercase",
        status === "due-soon" && "bg-petcenter-warning-bg text-petcenter-warning-text",
        status === "completed" && "bg-petcenter-success-bg text-petcenter-success-text",
        status === "overdue" && "bg-petcenter-danger-bg text-petcenter-danger-text"
      )}
    >
      {label}
    </span>
  )
}

function VaccinationDetailDialog({
  onOpenChange,
  petName,
  record,
}: {
  onOpenChange: (open: boolean) => void
  petName: string
  record: (typeof vaccinationRecords)[number] | null
}) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-card border-petcenter-border bg-white p-0 shadow-modal" showCloseButton={false}>
        {record ? (
          <>
            <DialogHeader className="border-b border-petcenter-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="heading-sm text-petcenter-text">Chi tiết bản ghi tiêm chủng</DialogTitle>
                  <DialogDescription className="body-md mt-1 text-petcenter-text-secondary">
                    {record.shortName} • {petName}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-3">
                  <VaccinationStatusBadge status={record.status} label={record.statusLabel} />
                  <DialogClose className="rounded-full p-2 text-petcenter-text-secondary transition hover:bg-petcenter-sidebar" aria-label="Đóng">
                    <span className="text-lg leading-none">×</span>
                  </DialogClose>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 p-6">
              <DetailSection title="Thông tin tiêm chủng">
                <div className="grid gap-4 rounded-control border border-petcenter-border bg-petcenter-filter p-5 sm:grid-cols-2">
                  <DialogInfo label="Tên vaccine" value={record.shortName} />
                  <DialogInfo label="Loại" value={record.type} />
                  <DialogInfo label="Thú cưng" value={petName} />
                  <DialogInfo label="Trạng thái" value={record.statusLabel} valueClassName={record.status === "due-soon" ? "text-petcenter-warning-text" : "text-petcenter-success-text"} />
                  <DialogInfo label="Ngày thực hiện" value={record.performedDate} />
                  <DialogInfo label="Ngày nhắc lại" value={record.reminderDate} valueClassName="text-petcenter-cta-active" />
                  <DialogInfo className="sm:col-span-2" label="Bác sĩ thực hiện" value={record.doctor} />
                </div>
              </DetailSection>

              <DetailSection title="Ghi chú">
                <div className="rounded-control border border-petcenter-border bg-petcenter-filter p-4">
                  <p className="body-md italic text-petcenter-text">{record.note}</p>
                </div>
              </DetailSection>

              <DetailSection title="Phản ứng sau tiêm">
                <div className="flex items-center gap-2 text-petcenter-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="body-md font-medium">{record.reaction}</p>
                </div>
              </DetailSection>

              <DetailSection title="Kế hoạch nhắc lại">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="heading-sm font-bold text-petcenter-cta-active">{record.reminderDate}</div>
                  <div className="flex flex-col gap-1">
                    <VaccinationStatusBadge status={record.status} label={record.statusLabel} />
                    <p className="label-sm text-petcenter-text-secondary">{record.reminderNote}</p>
                  </div>
                </div>
              </DetailSection>
            </div>

            <DialogFooter className="m-0 rounded-none border-petcenter-border bg-white p-6">
              <DialogClose className="label-md inline-flex h-10 items-center justify-center rounded-control border border-petcenter-primary px-6 font-bold text-petcenter-primary transition hover:bg-petcenter-primary/5">
                Đóng
              </DialogClose>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DetailSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <h3 className="label-md mb-3 font-bold uppercase text-petcenter-text-secondary">{title}</h3>
      {children}
    </section>
  )
}

function DialogInfo({ className, label, value, valueClassName }: { className?: string; label: string; value: string; valueClassName?: string }) {
  return (
    <div className={className}>
      <p className="label-sm text-petcenter-text-secondary">{label}</p>
      <p className={cn("body-md font-medium text-petcenter-text", valueClassName)}>{value}</p>
    </div>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center md:items-start md:pl-6 md:text-left first:md:pl-0">
      <span className="body-md mb-1 text-petcenter-text-secondary">{label}</span>
      <strong className="heading-sm text-petcenter-text">{value}</strong>
    </div>
  )
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="label-sm mb-1 block font-bold text-petcenter-text-secondary">{label}</span>
      <select className="body-sm h-10 w-full rounded-control border-0 bg-petcenter-sidebar px-3 text-petcenter-text outline-none transition focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function ExaminationRecordCard({ record }: { record: (typeof examinationRecords)[number] }) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-petcenter-border-strong bg-white p-6 shadow-card">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h3 className="title-md text-petcenter-text">{record.title}</h3>
              <span className="label-sm rounded-pill bg-petcenter-primary/10 px-2.5 py-1 font-semibold text-petcenter-primary">
                {record.type}
              </span>
            </div>
            <p className="body-sm flex items-center gap-1.5 text-petcenter-text-secondary">
              <CalendarDays className="h-4 w-4" />
              {record.date} - {record.time}
            </p>
          </div>

          <RecordNote label="Chẩn đoán" value={record.diagnosis} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="lg:text-right">
            <p className="label-sm uppercase text-petcenter-text-secondary">Bác sĩ phụ trách</p>
            <p className="body-md font-bold text-petcenter-text">{record.doctor}</p>
          </div>

          <RecordNote label="Kết luận & Dặn dò" value={record.conclusion} />
        </div>
      </div>

      <div className="flex justify-end border-t border-petcenter-border pt-4">
        <button className="label-md inline-flex h-10 items-center justify-center rounded-control border border-petcenter-primary px-5 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5">
          Xem chi tiết
        </button>
      </div>
    </article>
  )
}

function RecordNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full rounded-control bg-petcenter-filter p-3">
      <p className="label-sm mb-1 font-bold uppercase text-petcenter-primary">{label}</p>
      <p className="body-md font-medium text-petcenter-text">{value}</p>
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
