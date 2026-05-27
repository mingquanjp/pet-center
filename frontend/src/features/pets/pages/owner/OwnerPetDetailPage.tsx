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
  Eye,
  History,
  Info,
  LoaderCircle,
  Mars,
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
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { includesSearchText, normalizeSearchText } from "@/lib/search"
import { cn } from "@/lib/utils"
import { petsApi } from "../../api/pets.api"
import type { PetActivityLog, PetDetail, PetMedicalExam, PetVaccination, PetVaccinationStatus } from "../../types/pet.types"

const tabs = [
  { id: "basic", label: "Hồ sơ cơ bản" },
  { id: "medical-history", label: "Lịch sử khám" },
  { id: "vaccination", label: "Sổ tiêm chủng" },
  { id: "spa-history", label: "Lịch sử spa" },
] as const

type PetDetailTab = (typeof tabs)[number]["id"]

const medicalExamTypeOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Khám tổng quát", value: "general_checkup" },
  { label: "Tiêm phòng", value: "vaccination" },
  { label: "Xét nghiệm", value: "lab_test" },
  { label: "Tái khám", value: "recheck" },
] as const

const medicalTimeOptions = [
  { label: "Tất cả thời gian", value: "all" },
  { label: "3 tháng gần đây", value: "3m" },
  { label: "6 tháng gần đây", value: "6m" },
  { label: "Năm nay", value: "year" },
] as const

type MedicalExamTypeFilter = (typeof medicalExamTypeOptions)[number]["value"]
type MedicalTimeFilter = (typeof medicalTimeOptions)[number]["value"]

const vaccinationFilters = [
  { id: "all", label: "Tất cả" },
  { id: "completed", label: "Đã hoàn thành" },
  { id: "due-soon", label: "Sắp đến hạn" },
  { id: "overdue", label: "Quá hạn" },
] as const

type VaccinationFilter = (typeof vaccinationFilters)[number]["id"]

function getVaccinationStatusLabel(status: PetVaccinationStatus) {
  return {
    completed: "Đã hoàn thành",
    "due-soon": "Sắp đến hạn",
    overdue: "Quá hạn",
  }[status]
}

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
  },
  {
    id: "spa-2023-08-10",
    title: "Tắm gội cơ bản",
    date: "10/08/2023",
    time: "09:30 AM",
    serviceType: "Tắm gội",
    packageName: "Tắm thảo mộc",
    includedServices: "Tắm sấy khử mùi, chải lông, vệ sinh tuyến hôi.",
  },
  {
    id: "spa-2023-07-15",
    title: "Chăm sóc móng",
    date: "15/07/2023",
    time: "16:15 PM",
    serviceType: "Chăm sóc móng",
    packageName: "Cắt mài móng",
    includedServices: "Cắt móng, mài dũa an toàn, dưỡng viền móng.",
  },
] satisfies Array<{
  id: string
  title: string
  date: string
  time: string
  serviceType: Exclude<SpaServiceTypeFilter, "Tất cả">
  packageName: string
  includedServices: string
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
      {activeTab === "medical-history" ? <MedicalHistoryTab petId={pet.petId} petName={pet.petName} /> : null}
      {activeTab === "vaccination" ? <VaccinationTab petId={pet.petId} petName={pet.petName} /> : null}
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
        </div>

        <div className="relative ml-1.5">
          <div className="absolute bottom-0 left-[5.5px] top-0 w-px bg-petcenter-border-strong" />
          {pet.recentActivities.length > 0 ? (
            <div className="space-y-10">
              {pet.recentActivities.map((item) => (
                <ActivityItem key={item.activityLogId} activity={item} />
              ))}
            </div>
          ) : (
            <EmptyFilterState description="Chưa có hoạt động nào được ghi nhận cho thú cưng này." title="Chưa có hoạt động gần đây" />
          )}
        </div>
      </section>
    </div>
  )
}

function MedicalHistoryTab({ petId, petName }: { petId: string; petName: string }) {
  const [records, setRecords] = React.useState<PetMedicalExam[]>([])
  const [totalRecords, setTotalRecords] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [searchValue, setSearchValue] = React.useState("")
  const [examTypeFilter, setExamTypeFilter] = React.useState<MedicalExamTypeFilter>("all")
  const [timeFilter, setTimeFilter] = React.useState<MedicalTimeFilter>("all")
  const debouncedSearchValue = useDebouncedValue(searchValue, 300)
  const isSearchSettling = normalizeSearchText(searchValue) !== normalizeSearchText(debouncedSearchValue) || isLoading
  const latestRecord = records[0]
  const dateRange = React.useMemo(() => getMedicalDateRange(timeFilter), [timeFilter])

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadMedicalExams() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await petsApi.listMedicalExams(
          petId,
          {
            q: debouncedSearchValue.trim() || undefined,
            examType: examTypeFilter,
            from: dateRange.from,
            to: dateRange.to,
            page: 1,
            limit: 50,
          },
          { signal: abortController.signal }
        )

        if (!abortController.signal.aborted) {
          setRecords(result.exams)
          setTotalRecords(result.pagination.total)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setRecords([])
          setTotalRecords(0)
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải lịch sử khám")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadMedicalExams()

    return () => {
      abortController.abort()
    }
  }, [dateRange.from, dateRange.to, debouncedSearchValue, examTypeFilter, petId])

  function resetFilters() {
    setSearchValue("")
    setExamTypeFilter("all")
    setTimeFilter("all")
  }

  function exportMedicalHistory() {
    const generatedAt = new Date()
    const rows = [
      ["Thú cưng", petName],
      ["Ngày xuất", formatDateTime(generatedAt.toISOString())],
      ["Bộ lọc loại khám", medicalExamTypeOptions.find((option) => option.value === examTypeFilter)?.label ?? "Tất cả"],
      ["Bộ lọc thời gian", medicalTimeOptions.find((option) => option.value === timeFilter)?.label ?? "Tất cả thời gian"],
      ["Từ khóa", searchValue.trim() || "Không có"],
      [],
      ["Mã phiếu", "Ngày khám", "Loại khám", "Bác sĩ", "Trạng thái", "Chẩn đoán", "Kết luận", "Có toa thuốc", "Tái khám"],
      ...records.map((record) => [
        record.examId,
        formatDate(record.examDate),
        record.examTypeName,
        record.veterinarianName,
        getExamStatusLabel(record.examStatus),
        record.diagnosis || "",
        record.conclusion || record.healthNote || "",
        record.hasPrescription ? "Có" : "Không",
        record.hasFollowUp ? formatDate(record.followUpDate) : "",
      ]),
    ]

    downloadTextFile(`lich-su-kham-${toSafeFilename(petName)}-${formatFileDate(generatedAt)}.csv`, toCsv(rows), "text/csv;charset=utf-8")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-card border border-petcenter-border-strong bg-white p-6 shadow-card">
        <h2 className="label-md mb-4 font-bold uppercase text-petcenter-text">Tóm tắt khám bệnh</h2>
        <div className="grid gap-6 md:grid-cols-3 md:divide-x md:divide-petcenter-border-strong">
          <SummaryMetric label="Tổng số lần khám" value={isLoading ? "Đang tải..." : String(totalRecords)} />
          <SummaryMetric label="Lần khám gần nhất" value={latestRecord ? formatDate(latestRecord.examDate) : "Chưa có dữ liệu"} />
          <SummaryMetric label="Bác sĩ gần đây" value={latestRecord?.veterinarianName ?? "Chưa có dữ liệu"} />
        </div>
      </section>

      <section className="rounded-card border border-petcenter-border-strong bg-white p-6 shadow-card">
        <h2 className="label-md mb-4 font-bold uppercase text-petcenter-text md:hidden">Bộ lọc lịch sử</h2>
        <div className="grid items-end gap-4 md:grid-cols-[minmax(260px,2fr)_minmax(160px,1fr)_minmax(170px,1fr)_auto]">
          <label className="block">
            <span className="label-sm mb-1 block font-bold text-petcenter-text-secondary">Tìm kiếm</span>
            <span className="relative block">
              {isSearchSettling ? (
                <LoaderCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-petcenter-primary" />
              ) : (
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
              )}
              <input
                className="body-sm h-10 w-full rounded-control border-0 bg-petcenter-sidebar pl-10 pr-3 text-petcenter-text outline-none transition focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm theo bác sĩ, chẩn đoán..."
                type="search"
                value={searchValue}
              />
            </span>
          </label>

          <FilterSelect
            label="Loại khám"
            onChange={(value) => setExamTypeFilter(value as MedicalExamTypeFilter)}
            options={medicalExamTypeOptions}
            value={examTypeFilter}
          />
          <FilterSelect
            label="Thời gian"
            onChange={(value) => setTimeFilter(value as MedicalTimeFilter)}
            options={medicalTimeOptions}
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
        <SearchProgressBar isActive={isSearchSettling} />
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

          <button
            className="label-md inline-flex w-fit items-center gap-2 font-semibold text-petcenter-primary transition hover:underline disabled:cursor-not-allowed disabled:text-petcenter-text-muted disabled:no-underline"
            disabled={isLoading || records.length === 0}
            onClick={exportMedicalHistory}
            type="button"
          >
            Xuất lịch sử
            <Download className="h-4 w-4" />
          </button>
        </div>

        {errorMessage ? (
          <EmptyFilterState description={errorMessage} title="Không thể tải lịch sử khám" />
        ) : null}

        {!errorMessage && isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-card border border-petcenter-border-strong bg-white shadow-card" />
            ))}
          </div>
        ) : null}

        {!errorMessage && !isLoading && records.length > 0 ? (
          <div className={cn("space-y-4 transition-opacity duration-200", isSearchSettling && "opacity-80")}>
            {records.map((record) => (
              <ExaminationRecordCard key={record.examId} record={record} />
            ))}
          </div>
        ) : null}

        {!errorMessage && !isLoading && records.length === 0 ? (
          <EmptyFilterState
            description="Thử đổi từ khóa tìm kiếm lịch sử khám."
            title="Không tìm thấy lịch sử khám"
          />
        ) : null}
      </section>
    </div>
  )
}

function VaccinationTab({ petId, petName }: { petId: string; petName: string }) {
  const [records, setRecords] = React.useState<PetVaccination[]>([])
  const [overviewTotalRecords, setOverviewTotalRecords] = React.useState(0)
  const [latestOverviewRecord, setLatestOverviewRecord] = React.useState<PetVaccination | null>(null)
  const [isOverviewLoading, setIsOverviewLoading] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<VaccinationFilter>("all")
  const [selectedRecord, setSelectedRecord] = React.useState<PetVaccination | null>(null)
  const debouncedSearchValue = useDebouncedValue(searchValue, 300)
  const isSearchSettling = normalizeSearchText(searchValue) !== normalizeSearchText(debouncedSearchValue) || isLoading

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadVaccinationOverview() {
      try {
        setIsOverviewLoading(true)

        const result = await petsApi.listVaccinations(petId, { page: 1, limit: 1 }, { signal: abortController.signal })

        if (!abortController.signal.aborted) {
          setLatestOverviewRecord(result.vaccinations[0] ?? null)
          setOverviewTotalRecords(result.pagination.total)
        }
      } catch {
        if (!abortController.signal.aborted) {
          setLatestOverviewRecord(null)
          setOverviewTotalRecords(0)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsOverviewLoading(false)
        }
      }
    }

    void loadVaccinationOverview()

    return () => {
      abortController.abort()
    }
  }, [petId])

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadVaccinations() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await petsApi.listVaccinations(
          petId,
          {
            q: debouncedSearchValue.trim() || undefined,
            status: activeFilter,
            page: 1,
            limit: 50,
          },
          { signal: abortController.signal }
        )

        if (!abortController.signal.aborted) {
          setRecords(result.vaccinations)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setRecords([])
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải sổ tiêm chủng")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadVaccinations()

    return () => {
      abortController.abort()
    }
  }, [activeFilter, debouncedSearchValue, petId])

  const latestReminderDate = latestOverviewRecord ? formatDate(latestOverviewRecord.nextReminderDate) : "Chưa có dữ liệu"

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-petcenter-primary" />
            <h2 className="label-md font-bold text-petcenter-primary">Tổng quan tiêm chủng</h2>
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-3 lg:max-w-4xl lg:divide-x lg:divide-petcenter-border-strong">
            <SummaryInline label="Tổng số liều" value={isOverviewLoading ? "Đang tải..." : `${overviewTotalRecords} liều`} />
            <SummaryInline label="Mũi gần nhất" value={latestOverviewRecord ? `${latestOverviewRecord.vaccineName} - ${formatDate(latestOverviewRecord.vaccinationDate)}` : "Chưa có dữ liệu"} />
            <SummaryInline label="Nhắc lại tự động" value={latestReminderDate} />
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
            {isSearchSettling ? (
              <LoaderCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-petcenter-primary" />
            ) : (
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
            )}
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
        <SearchProgressBar isActive={isSearchSettling} />

        {errorMessage ? (
          <EmptyFilterState description={errorMessage} title="Không thể tải sổ tiêm chủng" />
        ) : null}

        {!errorMessage && isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-card border border-petcenter-border bg-white shadow-card" />
            ))}
          </div>
        ) : null}

        {!errorMessage && !isLoading && records.length > 0 ? (
          <div className={cn("space-y-4 transition-opacity duration-200", isSearchSettling && "opacity-80")}>
            {records.map((record) => (
              <VaccinationRecordCard key={record.vaccinationId} onViewDetails={() => setSelectedRecord(record)} record={record} />
            ))}
          </div>
        ) : null}

        {!errorMessage && !isLoading && records.length === 0 ? (
          <EmptyFilterState description="Thử đổi từ khóa hoặc bộ lọc tiêm chủng." title="Không tìm thấy bản ghi" />
        ) : null}
      </section>

      <VaccinationDetailDialog onOpenChange={(open) => !open && setSelectedRecord(null)} petName={petName} record={selectedRecord} />
    </div>
  )
}

function SpaHistoryTab({ petName }: { petName: string }) {
  const [searchValue, setSearchValue] = React.useState("")
  const [serviceTypeFilter, setServiceTypeFilter] = React.useState<SpaServiceTypeFilter>("Tất cả")
  const [timeFilter, setTimeFilter] = React.useState<SpaTimeFilter>("Tất cả thời gian")
  const debouncedSearchValue = useDebouncedValue(searchValue, 300)
  const isSearchSettling = normalizeSearchText(searchValue) !== normalizeSearchText(debouncedSearchValue)

  const filteredRecords = spaRecords.filter((record) => {
    const normalizedSearch = normalizeSearchText(debouncedSearchValue)
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [record.title, record.packageName, record.includedServices].some((value) =>
        includesSearchText(value, normalizedSearch)
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
          <SummaryMetric label="Dịch vụ gần nhất" value={latestRecord?.serviceType ?? "Chưa có dữ liệu"} />
        </div>
      </section>

      <section className="rounded-card border border-petcenter-border bg-white p-4 shadow-card">
        <div className="grid items-end gap-4 md:grid-cols-[minmax(260px,2fr)_minmax(160px,1fr)_minmax(170px,1fr)_auto]">
          <label className="block">
            <span className="label-sm mb-1 block font-bold text-petcenter-text-secondary">Tìm kiếm</span>
            <span className="relative block">
              {isSearchSettling ? (
                <LoaderCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-petcenter-primary" />
              ) : (
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
              )}
              <input
                className="body-sm h-10 w-full rounded-control border-0 bg-petcenter-sidebar pl-10 pr-3 text-petcenter-text outline-none transition focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm theo dịch vụ, gói chăm sóc..."
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
        <SearchProgressBar isActive={isSearchSettling} />
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
          <div className={cn("space-y-4 transition-opacity duration-200", isSearchSettling && "opacity-80")}>
            {filteredRecords.map((record) => (
              <SpaRecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <EmptyFilterState description="Thử đổi từ khóa hoặc bộ lọc dịch vụ." title="Không tìm thấy lịch sử spa" />
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

      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecordNote label="Gói dịch vụ" value={record.packageName} />
        <RecordNote label="Dịch vụ bao gồm" value={record.includedServices} />
      </div>
    </article>
  )
}

function SearchProgressBar({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        "mt-3 h-0.5 overflow-hidden rounded-full bg-petcenter-border transition-opacity duration-200",
        isActive ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="h-full w-1/3 animate-[search-progress_1.1s_ease-in-out_infinite] rounded-full bg-petcenter-primary" />
    </div>
  )
}

function EmptyFilterState({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-card border border-dashed border-petcenter-border-strong bg-petcenter-filter p-8 text-center">
      <Info className="mx-auto mb-3 h-8 w-8 text-petcenter-text-muted" />
      <h3 className="title-md text-petcenter-text">{title}</h3>
      <p className="body-md mt-1 text-petcenter-text-secondary">{description}</p>
    </div>
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
  record: PetVaccination
}) {
  const Icon = Syringe
  const status = record.status
  const statusLabel = getVaccinationStatusLabel(status)
  const reminderDate = formatDate(record.nextReminderDate)

  return (
    <article className="flex flex-col gap-6 rounded-card border border-petcenter-border bg-white p-5 shadow-card lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-control",
              status === "due-soon" && "bg-petcenter-warning-bg text-petcenter-warning-text",
              status === "completed" && "bg-petcenter-success-bg text-petcenter-success-text",
              status === "overdue" && "bg-petcenter-danger-bg text-petcenter-danger-text"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="body-lg font-semibold text-petcenter-text">{record.vaccineName}</h3>
              <VaccinationStatusBadge status={status} label={statusLabel} />
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
        <VaccinationField label="Ngày thực hiện" value={formatDate(record.vaccinationDate)} />
        <VaccinationField emphasis label="Ngày nhắc lại" value={reminderDate} />
        <VaccinationField label="Bác sĩ" value={record.veterinarianName ?? "Chưa cập nhật"} />
        <VaccinationField italic label="Ghi chú" value={record.note ?? "Chưa cập nhật"} />
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

function VaccinationStatusBadge({ label, status }: { label: string; status: PetVaccinationStatus }) {
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
  record: PetVaccination | null
}) {
  const status = record ? record.status : null
  const statusLabel = status ? getVaccinationStatusLabel(status) : ""
  const reminderDate = record ? formatDate(record.nextReminderDate) : ""

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
                    {record.vaccineName} • {petName}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-3">
                  {status ? <VaccinationStatusBadge status={status} label={statusLabel} /> : null}
                  <DialogClose className="rounded-full p-2 text-petcenter-text-secondary transition hover:bg-petcenter-sidebar" aria-label="Đóng">
                    <span className="text-lg leading-none">×</span>
                  </DialogClose>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 p-6">
              <DetailSection title="Thông tin tiêm chủng">
                <div className="grid gap-4 rounded-control border border-petcenter-border bg-petcenter-filter p-5 sm:grid-cols-2">
                  <DialogInfo label="Tên vaccine" value={record.vaccineName} />
                  <DialogInfo label="Loại" value="Tiêm chủng" />
                  <DialogInfo label="Thú cưng" value={petName} />
                  <DialogInfo label="Trạng thái" value={statusLabel} valueClassName={status === "due-soon" ? "text-petcenter-warning-text" : status === "overdue" ? "text-petcenter-danger-text" : "text-petcenter-success-text"} />
                  <DialogInfo label="Ngày thực hiện" value={formatDate(record.vaccinationDate)} />
                  <DialogInfo label="Ngày nhắc lại" value={reminderDate} valueClassName="text-petcenter-cta-active" />
                  <DialogInfo className="sm:col-span-2" label="Bác sĩ thực hiện" value={record.veterinarianName ?? "Chưa cập nhật"} />
                </div>
              </DetailSection>

              <DetailSection title="Ghi chú">
                <div className="rounded-control border border-petcenter-border bg-petcenter-filter p-4">
                  <p className="body-md italic text-petcenter-text">{record.note ?? "Chưa cập nhật"}</p>
                </div>
              </DetailSection>

              <DetailSection title="Phản ứng sau tiêm">
                <div className="flex items-center gap-2 text-petcenter-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="body-md font-medium">Chưa ghi nhận phản ứng bất thường</p>
                </div>
              </DetailSection>

              <DetailSection title="Kế hoạch nhắc lại">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="heading-sm font-bold text-petcenter-cta-active">{reminderDate}</div>
                  <div className="flex flex-col gap-1">
                    {status ? <VaccinationStatusBadge status={status} label={statusLabel} /> : null}
                    <p className="label-sm text-petcenter-text-secondary">Hệ thống tự nhắc lại sau 1 năm từ ngày thực hiện.</p>
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

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: readonly { label: string; value: string }[]
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ExaminationRecordCard({ record }: { record: PetMedicalExam }) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-petcenter-border-strong bg-white p-6 shadow-card">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h3 className="title-md text-petcenter-text">{record.examTypeName}</h3>
              <span className="label-sm rounded-pill bg-petcenter-primary/10 px-2.5 py-1 font-semibold text-petcenter-primary">
                {getExamStatusLabel(record.examStatus)}
              </span>
            </div>
            <p className="body-sm flex items-center gap-1.5 text-petcenter-text-secondary">
              <CalendarDays className="h-4 w-4" />
              {formatDate(record.examDate)}
            </p>
          </div>

          <RecordNote label="Chẩn đoán" value={record.diagnosis || "Chưa cập nhật"} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="lg:text-right">
            <p className="label-sm uppercase text-petcenter-text-secondary">Bác sĩ phụ trách</p>
            <p className="body-md font-bold text-petcenter-text">{record.veterinarianName}</p>
          </div>

          <RecordNote label="Kết luận & Dặn dò" value={record.conclusion || record.healthNote || "Chưa cập nhật"} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-petcenter-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {record.hasPrescription ? (
            <span className="label-sm rounded bg-petcenter-primary/10 px-2 py-1 font-semibold text-petcenter-primary">Có toa thuốc</span>
          ) : null}
          {record.hasFollowUp ? (
            <span className="label-sm rounded bg-petcenter-warning-bg px-2 py-1 font-semibold text-petcenter-warning-text">
              Tái khám: {formatDate(record.followUpDate)}
            </span>
          ) : null}
        </div>

        <Link
          className="label-md inline-flex h-9 items-center justify-center gap-2 rounded-control border border-petcenter-primary px-4 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5"
          href={`/owner/pets/${encodeURIComponent(record.petId)}/medical-exams/${encodeURIComponent(record.examId)}`}
        >
          <Eye className="h-4 w-4" />
          Xem chi tiết
        </Link>
      </div>
    </article>
  )
}

function getExamStatusLabel(status: PetMedicalExam["examStatus"]) {
  return {
    result_recorded: "Đã có kết quả",
    prescribed: "Có toa thuốc",
    follow_up_required: "Cần tái khám",
  }[status]
}

function getMedicalDateRange(filter: MedicalTimeFilter): { from?: string; to?: string } {
  if (filter === "all") return {}

  const now = new Date()
  const to = formatIsoDate(now)
  const fromDate = new Date(now)

  if (filter === "3m") {
    fromDate.setMonth(fromDate.getMonth() - 3)
  }

  if (filter === "6m") {
    fromDate.setMonth(fromDate.getMonth() - 6)
  }

  if (filter === "year") {
    fromDate.setMonth(0, 1)
  }

  return {
    from: formatIsoDate(fromDate),
    to,
  }
}

function formatIsoDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value)
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

function ActivityItem({ activity }: { activity: PetActivityLog }) {
  const activityDate = formatDateTime(activity.occurredAt)

  return (
    <article className="relative pl-8">
      <span
        className={cn(
          "absolute left-0 top-1.5 z-10 h-3 w-3 rounded-full",
          activity.activityCategory === "medical" && "bg-petcenter-primary",
          activity.activityCategory === "vaccination" && "bg-petcenter-success-text",
          activity.activityCategory === "grooming" && "bg-petcenter-cta",
          activity.activityCategory === "boarding" && "bg-petcenter-info-text",
          activity.activityCategory === "invoice" && "bg-petcenter-border-strong",
          activity.activityCategory === "payment" && "bg-petcenter-success-text",
          activity.activityCategory === "profile" && "bg-petcenter-text-muted"
        )}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="title-md flex items-center gap-2 text-petcenter-text">
            {renderActivityIcon(activity.activityCategory)}
            {activity.title}
          </h3>
          <span className="label-md w-fit rounded-pill bg-petcenter-filter px-3 py-1 text-petcenter-text-secondary">
            {activityDate}
          </span>
        </div>
        {activity.actorName ? <p className="body-md text-petcenter-text-secondary">Người thực hiện: {activity.actorName}</p> : null}
        <div className="rounded-control border border-petcenter-border bg-petcenter-filter p-4">
          <p className="body-md text-petcenter-text">{activity.summary || "Hoạt động đã được ghi nhận trong hệ thống."}</p>
          {activity.activityStatus ? (
            <div className="mt-3">
              <span className="label-sm inline-flex items-center gap-1 rounded bg-petcenter-primary/10 px-2 py-1 font-semibold text-petcenter-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {getActivityStatusLabel(activity.activityStatus)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function renderActivityIcon(category: PetActivityLog["activityCategory"]) {
  const className = "h-5 w-5 text-petcenter-primary"

  switch (category) {
    case "medical":
      return <Stethoscope className={className} />
    case "vaccination":
      return <Syringe className={className} />
    case "grooming":
      return <Scissors className={className} />
    case "boarding":
      return <CalendarDays className={className} />
    case "invoice":
      return <ClipboardList className={className} />
    case "payment":
      return <CheckCircle2 className={className} />
    case "profile":
      return <PawPrint className={className} />
  }
}

function getActivityStatusLabel(status: PetActivityLog["activityStatus"]) {
  return {
    scheduled: "Đã lên lịch",
    pending: "Đang chờ",
    confirmed: "Đã xác nhận",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
    rejected: "Đã từ chối",
    failed: "Thất bại",
  }[status]
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

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function toCsv(rows: Array<Array<string | number | null | undefined>>) {
  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")}`
}

function escapeCsvCell(value: string | number | null | undefined) {
  const normalizedValue = value === null || value === undefined ? "" : String(value)

  return `"${normalizedValue.replaceAll('"', '""')}"`
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function toSafeFilename(value: string) {
  return normalizeSearchText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "thu-cung"
}

function formatFileDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value)
}

