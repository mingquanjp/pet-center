"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  Pencil,
  FileText,
  HeartPulse,
  History,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingState } from "@/components/ui/loading-state"

import { doctorExaminationsApi } from "../../api/doctor-examinations.api"
import {
  CompleteDoctorExaminationPayload,
  DoctorExaminationDetail,
  DoctorExaminationField,
  DoctorPrescriptionItem,
} from "../../types/examination.types"
import { DoctorExaminationStatusBadge } from "../../components/doctor/DoctorExaminationStatusBadge"
import {
  clinicalExamFields,
  DoctorExamFieldConfig,
  examTypeFieldConfig,
  examTypeSectionTitle,
} from "../../constants/doctor-examination-form.config"

interface Props {
  appointmentId: string
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
})

const fieldInputClass =
  "w-full rounded-control border border-petcenter-border-strong bg-white px-3 py-2 text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary disabled:bg-petcenter-background disabled:text-petcenter-text-secondary"

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateTime(value?: string) {
  if (!value) return "Chưa cập nhật"
  const date = new Date(value)
  return `${timeFormatter.format(date)} - ${dateFormatter.format(date)}`
}

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật"
  return dateFormatter.format(new Date(value))
}

function getPetInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getFieldInitialValue(field: DoctorExaminationField) {
  if (field.value?.number !== undefined && field.value.number !== null) return String(field.value.number)
  if (field.value?.date) return field.value.date
  if (field.value?.fileUrl) return field.value.fileUrl
  if (field.value?.text) return field.value.text
  return ""
}

function fieldValueLabel(config: DoctorExamFieldConfig, value: string) {
  if (!value) return "Chưa cập nhật"
  return config.options?.find((option) => option.value === value)?.label ?? value
}

function buildFieldValue(field: DoctorExaminationField, value: string) {
  if (!value) return null

  if (field.type === "number") {
    const numberValue = Number(value)
    return Number.isFinite(numberValue)
      ? { fieldDefinitionId: field.id, valueNumber: numberValue }
      : null
  }

  if (field.type === "date") {
    return { fieldDefinitionId: field.id, valueDate: value }
  }

  if (field.type === "file") {
    return { fieldDefinitionId: field.id, fileUrl: value }
  }

  return { fieldDefinitionId: field.id, valueText: value }
}

function Section({
  title,
  icon: Icon,
  subtitle,
  children,
}: {
  title: string
  icon?: typeof Stethoscope
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="title-md flex items-center gap-2 text-petcenter-text">
          {Icon ? <Icon className="h-5 w-5 text-petcenter-primary" /> : null}
          {title}
        </h3>
        {subtitle ? <p className="body-sm mt-1 text-petcenter-text-secondary">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="label-md mb-1 text-petcenter-text-secondary">{label}</p>
      <p className="body-md font-medium text-petcenter-text">{value || "Chưa cập nhật"}</p>
    </div>
  )
}

function FormField({
  config,
  value,
  error,
  disabled,
  onChange,
}: {
  config: DoctorExamFieldConfig
  value: string
  error?: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  const inputId = `exam-field-${config.name}`
  const input =
    config.type === "text" ? (
      <textarea
        className={fieldInputClass}
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={config.placeholder}
        rows={3}
        value={value}
      />
    ) : config.type === "select" ? (
      <select
        className={fieldInputClass}
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Chọn {config.label.toLowerCase()}...</option>
        {(config.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        className={fieldInputClass}
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={config.type === "file" ? "Dán URL tệp kết quả..." : config.placeholder}
        step={config.type === "number" ? "0.1" : undefined}
        type={config.type === "file" ? "url" : config.type}
        value={value}
      />
    )

  return (
    <label className={config.fullWidth ? "md:col-span-2" : ""} htmlFor={inputId}>
      <span className="label-md mb-1 block font-medium text-petcenter-text">
        {config.label} {config.required ? <span className="text-petcenter-danger-text">*</span> : null}
      </span>
      <div className={config.unit ? "flex items-center gap-2" : ""}>
        {input}
        {config.unit ? <span className="body-sm w-10 text-petcenter-text-secondary">{config.unit}</span> : null}
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{error}</p> : null}
    </label>
  )
}

function buildInitialFieldValues(detail: DoctorExaminationDetail) {
  const values = Object.fromEntries(detail.fields.map((field) => [field.name, getFieldInitialValue(field)]))

  if (detail.examType.code === "VACCINATION" && detail.vaccination) {
    values.vaccineName ||= detail.vaccination.vaccineName
    values.vaccinationDate ||= detail.vaccination.vaccinationDate
    values.vaccinationNote ||= detail.vaccination.note ?? ""
  }

  if (detail.examType.code === "VACCINATION") {
    values.vaccinationDate ||= todayInputValue()
  }

  if (detail.examType.code === "LAB_TEST") {
    values.labPerformedDate ||= todayInputValue()
    values.labResultStatus ||= "pending"
  }

  return values
}

function emptyPrescriptionItem(): DoctorPrescriptionItem {
  return {
    medicineId: "",
    quantity: 1,
    dosage: "",
    frequency: "",
    duration: "",
    usageInstruction: "",
    note: "",
  }
}

export function DoctorExaminationDetailPage({ appointmentId }: Props) {
  const router = useRouter()
  const [detail, setDetail] = useState<DoctorExaminationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [diagnosis, setDiagnosis] = useState("")
  const [conclusion, setConclusion] = useState("")
  const [healthNote, setHealthNote] = useState("")
  const [prescriptionItems, setPrescriptionItems] = useState<DoctorPrescriptionItem[]>([])
  const [needsFollowUp, setNeedsFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState("")
  const [followUpReason, setFollowUpReason] = useState("")
  const [followUpOwnerNote, setFollowUpOwnerNote] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [prescriptionDraft, setPrescriptionDraft] = useState<DoctorPrescriptionItem>(emptyPrescriptionItem())
  const [prescriptionDraftErrors, setPrescriptionDraftErrors] = useState<Record<string, string>>({})
  const [editingPrescriptionIndex, setEditingPrescriptionIndex] = useState<number | null>(null)
  const [deletingPrescriptionIndex, setDeletingPrescriptionIndex] = useState<number | null>(null)

  const applyDetailState = (result: DoctorExaminationDetail) => {
    setDetail(result)
    setDiagnosis(result.diagnosis || "")
    setConclusion(result.conclusion || "")
    setHealthNote(result.healthNote || "")
    setFieldValues(buildInitialFieldValues(result))
    setPrescriptionItems(result.prescription?.items.length ? result.prescription.items : [])
    setNeedsFollowUp(Boolean(result.followUp))
    setFollowUpDate(result.followUp?.followUpDate || "")
    setFollowUpReason(result.followUp?.reason || "")
    setFollowUpOwnerNote(result.followUp?.ownerNote || "")
    setValidationErrors({})
    setPrescriptionDraftErrors({})
  }

  useEffect(() => {
    let ignore = false

    async function loadDetail() {
      try {
        setIsLoading(true)
        setError("")
        const result = await doctorExaminationsApi.getDoctorExaminationDetail(appointmentId)
        if (!ignore) applyDetailState(result)
      } catch {
        if (!ignore) setError("Không thể tải phiếu khám")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void loadDetail()

    return () => {
      ignore = true
    }
  }, [appointmentId])

  const isReadOnly = detail?.status === "COMPLETED" || detail?.status === "FOLLOW_UP"
  const isWaiting = detail?.status === "WAITING"
  const scheduledAt = useMemo(() => (detail ? new Date(detail.scheduledAt) : null), [detail])

  const fieldByName = useMemo(() => {
    return new Map(detail?.fields.map((field) => [field.name, field]) ?? [])
  }, [detail])

  const typeFields = detail ? examTypeFieldConfig[detail.examType.code] : []
  const configuredFields = [...clinicalExamFields, ...typeFields]

  const validateForm = () => {
    if (!detail) return false

    const nextErrors: Record<string, string> = {}
    const labStatus = fieldValues.labResultStatus

    for (const config of configuredFields) {
      const isRequired =
        config.required ||
        (detail.examType.code === "LAB_TEST" &&
          labStatus === "available" &&
          (config.name === "labResultText" || config.name === "labDoctorComment"))

      if (isRequired && !fieldValues[config.name]?.trim()) {
        nextErrors[config.name] = "Trường này là bắt buộc"
      }
    }

    if (!diagnosis.trim()) nextErrors.diagnosis = "Vui lòng nhập chẩn đoán chính"
    if (!conclusion.trim()) nextErrors.conclusion = "Vui lòng nhập kết luận của bác sĩ"

    prescriptionItems.forEach((item, index) => {
      const hasAnyValue = Object.values(item).some((value) => String(value ?? "").trim())
      if (!hasAnyValue) return

      if (!item.medicineId) nextErrors[`prescription.${index}.medicineId`] = "Vui lòng chọn thuốc"
      if (!item.quantity || item.quantity <= 0) nextErrors[`prescription.${index}.quantity`] = "Nhập số lượng"
      if (!item.dosage.trim()) nextErrors[`prescription.${index}.dosage`] = "Nhập liều dùng"
      if (!item.frequency.trim()) nextErrors[`prescription.${index}.frequency`] = "Nhập tần suất"
      if (!item.duration.trim()) nextErrors[`prescription.${index}.duration`] = "Nhập thời gian"
      if (!item.usageInstruction.trim()) nextErrors[`prescription.${index}.usageInstruction`] = "Nhập hướng dẫn"
    })

    if (needsFollowUp) {
      if (!followUpDate) nextErrors.followUpDate = "Vui lòng chọn ngày tái khám"
      if (!followUpReason.trim()) nextErrors.followUpReason = "Vui lòng nhập lý do tái khám"
    }

    setValidationErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildPayload = (includeCompletionData: boolean): CompleteDoctorExaminationPayload => {
    if (!detail) {
      return { diagnosis: "", conclusion: "" }
    }

    const fieldValuesPayload = configuredFields
      .map((config) => {
        const field = fieldByName.get(config.name)
        return field ? buildFieldValue(field, fieldValues[config.name] || "") : null
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value))

    return {
      diagnosis,
      conclusion,
      healthNote,
      fieldValues: fieldValuesPayload,
      prescriptionItems: includeCompletionData
        ? prescriptionItems.filter((item) => item.medicineId && item.dosage && item.frequency && item.duration && item.usageInstruction)
        : undefined,
      vaccination:
        includeCompletionData && detail.examType.code === "VACCINATION"
          ? {
              vaccineName: fieldValues.vaccineName || "",
              vaccinationDate: fieldValues.vaccinationDate || todayInputValue(),
              note: fieldValues.vaccinationNote || undefined,
            }
          : undefined,
      followUp:
        includeCompletionData && needsFollowUp
          ? {
              followUpDate,
              reason: followUpReason,
              ownerNote: followUpOwnerNote || undefined,
            }
          : undefined,
    }
  }

  const handleStart = async () => {
    const result = await doctorExaminationsApi.startDoctorExamination(appointmentId)
    applyDetailState(result)
  }

  const handleSaveDraft = async () => {
    if (!detail) return

    try {
      setIsSubmitting(true)
      const payload = buildPayload(false)
      const result = await doctorExaminationsApi.saveDraftDoctorExamination(appointmentId, {
        diagnosis: payload.diagnosis,
        conclusion: payload.conclusion,
        healthNote: payload.healthNote,
        fieldValues: payload.fieldValues,
      })
      applyDetailState(result)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPrescriptionDialog = () => {
    setPrescriptionDraft(emptyPrescriptionItem())
    setPrescriptionDraftErrors({})
    setEditingPrescriptionIndex(null)
    setIsPrescriptionDialogOpen(true)
  }

  const openEditPrescriptionDialog = (index: number) => {
    setPrescriptionDraft(prescriptionItems[index] ?? emptyPrescriptionItem())
    setPrescriptionDraftErrors({})
    setEditingPrescriptionIndex(index)
    setIsPrescriptionDialogOpen(true)
  }

  const validatePrescriptionDraft = () => {
    const nextErrors: Record<string, string> = {}

    if (!prescriptionDraft.medicineId) nextErrors.medicineId = "Vui lòng chọn thuốc"
    if (!prescriptionDraft.quantity || prescriptionDraft.quantity <= 0) nextErrors.quantity = "Nhập số lượng"
    if (!prescriptionDraft.dosage.trim()) nextErrors.dosage = "Nhập liều dùng"
    if (!prescriptionDraft.frequency.trim()) nextErrors.frequency = "Nhập tần suất"
    if (!prescriptionDraft.duration.trim()) nextErrors.duration = "Nhập thời gian"
    if (!prescriptionDraft.usageInstruction.trim()) nextErrors.usageInstruction = "Nhập hướng dẫn sử dụng"

    setPrescriptionDraftErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleAddPrescriptionItem = () => {
    if (!detail || !validatePrescriptionDraft()) return

    const medicine = detail.medicines.find((option) => option.id === prescriptionDraft.medicineId)
    const nextItem = {
        ...prescriptionDraft,
        medicineName: medicine?.name,
        note: prescriptionDraft.note?.trim() || undefined,
    }

    setPrescriptionItems((current) => {
      if (editingPrescriptionIndex === null) {
        return [...current, nextItem]
      }

      return current.map((item, index) => (index === editingPrescriptionIndex ? nextItem : item))
    })
    setIsPrescriptionDialogOpen(false)
    setPrescriptionDraft(emptyPrescriptionItem())
    setPrescriptionDraftErrors({})
    setEditingPrescriptionIndex(null)
    toast.success(editingPrescriptionIndex === null ? "Đã thêm thuốc thành công" : "Đã cập nhật thuốc thành công")
  }

  const handleConfirmDeletePrescriptionItem = () => {
    if (deletingPrescriptionIndex === null) return

    setPrescriptionItems((current) => current.filter((_, rowIndex) => rowIndex !== deletingPrescriptionIndex))
    setDeletingPrescriptionIndex(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detail || !validateForm()) return

    try {
      setIsSubmitting(true)
      const result = await doctorExaminationsApi.completeDoctorExamination(appointmentId, buildPayload(true))
      applyDetailState(result)
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-10">
        <LoadingState title="Đang tải phiếu khám..." description="Vui lòng đợi trong giây lát." />
      </div>
    )
  }

  if (!detail || error) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <p className="font-semibold text-petcenter-text">{error || "Không tìm thấy phiếu khám"}</p>
        <Link href="/doctor/examinations">
          <Button className="mt-4 rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover">
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-petcenter-text-secondary">
            <Link className="hover:text-petcenter-primary" href="/doctor/examinations">
              Phiếu khám
            </Link>
            <span className="text-petcenter-text-muted">&gt;</span>
            <span className="font-bold text-petcenter-text">{detail.examinationCode}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <h2 className="heading-lg text-petcenter-text">
            {isReadOnly ? "Chi tiết phiếu khám" : "Cập nhật kết quả khám"}
          </h2>
          <DoctorExaminationStatusBadge status={detail.status} />
          </div>
          <p className="body-md mt-1 text-petcenter-text-secondary">
            {detail.examinationCode} · {detail.pet.name}
          </p>
        </div>

        <Link href="/doctor/examinations">
          <Button
            className="h-11 rounded-control border-petcenter-primary bg-transparent px-5 font-semibold text-petcenter-primary hover:bg-petcenter-primary hover:text-white"
            type="button"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <aside className="grid grid-cols-1 items-start gap-6">
          <Section title="Thông tin phiếu và thú cưng" icon={FileText}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.35fr)_minmax(190px,0.9fr)_minmax(240px,1.05fr)_minmax(220px,0.95fr)]">
              <div className="flex min-w-0 items-start gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-petcenter-filter text-petcenter-primary">
                  {detail.pet.imageUrl ? (
                    <Image
                      src={detail.pet.imageUrl}
                      alt={detail.pet.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                      {getPetInitials(detail.pet.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="title-md truncate text-petcenter-text">{detail.pet.name}</h3>
                  <p className="body-sm mt-1 text-petcenter-text-secondary">Mã thú cưng: {detail.pet.id}</p>
                  <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                    {detail.pet.species}
                    {detail.pet.breed ? ` · ${detail.pet.breed}` : ""}
                    {detail.pet.ageText ? ` · ${detail.pet.ageText}` : ""}
                  </p>
                  <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                    {detail.pet.gender || "Chưa rõ giới tính"}
                    {detail.pet.weightText ? ` · ${detail.pet.weightText}` : ""}
                  </p>
                </div>
              </div>

              <div className="grid content-start gap-3">
                <ReadOnlyField label="Mã phiếu khám" value={detail.examinationCode} />
                <ReadOnlyField label="Ngày giờ khám" value={scheduledAt ? formatDateTime(detail.scheduledAt) : undefined} />
              </div>

              <div className="grid content-start gap-3">
                <ReadOnlyField label="Bác sĩ phụ trách" value={detail.doctor?.fullName || "BS. Nguyễn Văn A"} />
                <div>
                  <p className="label-md mb-1 text-petcenter-text-secondary">Chủ nuôi</p>
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-petcenter-text">
                    <User className="h-4 w-4 shrink-0 text-petcenter-text-secondary" />
                    <span className="truncate">{detail.owner.fullName}</span>
                  </div>
                  <p className="body-sm mt-1 truncate text-petcenter-text-secondary">{detail.owner.phoneNumber || "Chưa có SĐT"}</p>
                  {detail.owner.email ? <p className="body-sm truncate text-petcenter-text-secondary">{detail.owner.email}</p> : null}
                </div>
              </div>

              <div className="grid content-start gap-3">
                <div>
                  <p className="label-md mb-1 text-petcenter-text-secondary">Trạng thái phiếu</p>
                  <DoctorExaminationStatusBadge status={detail.status} />
                </div>
                <div>
                  <p className="label-md mb-1 text-petcenter-text-secondary">Loại khám trong phiếu</p>
                  <span className="inline-flex rounded-full bg-petcenter-success-bg px-4 py-1.5 text-sm font-semibold text-petcenter-primary">
                    {detail.examType.name}
                  </span>
                </div>
              </div>

              <div className="border-t border-petcenter-border pt-4 md:col-span-2 xl:col-span-4">
                <div className="rounded-control border border-petcenter-border bg-white px-4 py-3">
                  <p className="label-md mb-2 font-semibold text-petcenter-text-secondary">
                    Triệu chứng ghi nhận ban đầu
                  </p>
                  <p className="body-md text-petcenter-text">{detail.symptomDescription || "Chưa có triệu chứng ban đầu"}</p>
                  {detail.internalNote ? (
                    <p className="body-sm mt-2 text-petcenter-text-secondary">Ghi chú nội bộ: {detail.internalNote}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </Section>

        </aside>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {isWaiting ? (
            <Section title="Phiếu khám đang chờ" icon={Stethoscope}>
              <p className="body-md text-petcenter-text-secondary">
                Bấm bắt đầu khám để chuyển phiếu sang trạng thái đang khám và mở form nhập kết quả.
              </p>
              <Button
                className="mt-4 rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
                onClick={handleStart}
                type="button"
              >
                Bắt đầu khám
              </Button>
            </Section>
          ) : null}

          <Section title="Khám lâm sàng" icon={Stethoscope}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {clinicalExamFields.map((config) =>
                isReadOnly ? (
                  <ReadOnlyField
                    key={config.name}
                    label={config.label}
                    value={`${fieldValueLabel(config, fieldValues[config.name] || "")}${fieldValues[config.name] && config.unit ? ` ${config.unit}` : ""}`}
                  />
                ) : (
                  <FormField
                    key={config.name}
                    config={config}
                    disabled={Boolean(isWaiting)}
                    error={validationErrors[config.name]}
                    onChange={(value) => setFieldValues((current) => ({ ...current, [config.name]: value }))}
                    value={fieldValues[config.name] || ""}
                  />
                )
              )}
            </div>
          </Section>

          {detail.examType.code === "RECHECK" && detail.recheckContext ? (
            <Section title="Thông tin tái khám trước đó" icon={History}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ReadOnlyField label="Phiếu khám trước đó" value={detail.recheckContext.previousExaminationCode} />
                <ReadOnlyField label="Chẩn đoán lần trước" value={detail.recheckContext.previousDiagnosis} />
                <ReadOnlyField label="Lý do tái khám" value={detail.recheckContext.followUpReason} />
              </div>
            </Section>
          ) : null}

          <Section
            title="Kết quả theo loại khám"
            icon={HeartPulse}
            subtitle={`Nhập thông tin chuyên môn tương ứng với loại khám của phiếu: ${examTypeSectionTitle[detail.examType.code]}.`}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {typeFields.map((config) =>
                isReadOnly ? (
                  <ReadOnlyField
                    key={config.name}
                    label={config.label}
                    value={fieldValueLabel(config, fieldValues[config.name] || "")}
                  />
                ) : (
                  <FormField
                    key={config.name}
                    config={config}
                    disabled={Boolean(isWaiting)}
                    error={validationErrors[config.name]}
                    onChange={(value) => setFieldValues((current) => ({ ...current, [config.name]: value }))}
                    value={fieldValues[config.name] || ""}
                  />
                )
              )}
            </div>
          </Section>

          <Section title="Chẩn đoán & Kết luận" icon={ClipboardCheck}>
            <div className="space-y-4">
              {isReadOnly ? (
                <>
                  <ReadOnlyField label="Chẩn đoán chính" value={diagnosis} />
                  <ReadOnlyField label="Kết luận của bác sĩ" value={conclusion} />
                  <ReadOnlyField label="Ghi chú chuyên môn" value={healthNote} />
                </>
              ) : (
                <>
                  <label>
                    <span className="label-md mb-1 block font-medium text-petcenter-text">
                      Chẩn đoán chính <span className="text-petcenter-danger-text">*</span>
                    </span>
                    <textarea
                      className={fieldInputClass}
                      disabled={Boolean(isWaiting)}
                      onChange={(event) => setDiagnosis(event.target.value)}
                      placeholder="Nhập chẩn đoán chính..."
                      rows={3}
                      value={diagnosis}
                    />
                    {validationErrors.diagnosis ? <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{validationErrors.diagnosis}</p> : null}
                  </label>
                  <label>
                    <span className="label-md mb-1 block font-medium text-petcenter-text">
                      Kết luận của bác sĩ <span className="text-petcenter-danger-text">*</span>
                    </span>
                    <textarea
                      className={fieldInputClass}
                      disabled={Boolean(isWaiting)}
                      onChange={(event) => setConclusion(event.target.value)}
                      placeholder="Nhập kết luận sau khi tổng hợp kết quả khám..."
                      rows={3}
                      value={conclusion}
                    />
                    {validationErrors.conclusion ? <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{validationErrors.conclusion}</p> : null}
                  </label>
                  <label>
                    <span className="label-md mb-1 block font-medium text-petcenter-text">Ghi chú chuyên môn</span>
                    <textarea
                      className={fieldInputClass}
                      disabled={Boolean(isWaiting)}
                      onChange={(event) => setHealthNote(event.target.value)}
                      placeholder="Nhập lưu ý chuyên môn, dặn dò hoặc hướng theo dõi..."
                      rows={2}
                      value={healthNote}
                    />
                  </label>
                </>
              )}
            </div>
          </Section>

          <Section title={isReadOnly ? "Đơn thuốc đã kê" : "Đơn thuốc điều trị"} icon={Pill}>
            {isReadOnly ? (
              detail.prescription?.items.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-petcenter-filter text-petcenter-text-secondary">
                      <tr>
                        <th className="px-3 py-3">Thuốc</th>
                        <th className="px-3 py-3">Số lượng</th>
                        <th className="px-3 py-3">Liều dùng</th>
                        <th className="px-3 py-3">Tần suất</th>
                        <th className="px-3 py-3">Thời gian</th>
                        <th className="px-3 py-3">Hướng dẫn</th>
                        <th className="px-3 py-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.prescription.items.map((item) => (
                        <tr key={item.id ?? item.medicineId} className="border-b border-petcenter-border">
                          <td className="px-3 py-3 font-semibold">{item.medicineName}</td>
                          <td className="px-3 py-3">{item.quantity ?? "Chưa cập nhật"}</td>
                          <td className="px-3 py-3">{item.dosage}</td>
                          <td className="px-3 py-3">{item.frequency}</td>
                          <td className="px-3 py-3">{item.duration}</td>
                          <td className="px-3 py-3">{item.usageInstruction}</td>
                          <td className="px-3 py-3">{item.note || "Không có"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="body-md text-petcenter-text-secondary">Không có đơn thuốc trong phiếu khám này.</p>
              )
            ) : (
              <div className="space-y-4">
                {prescriptionItems.length > 0 ? (
                  <div className="overflow-x-auto rounded-control border border-petcenter-border">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-petcenter-filter text-petcenter-text-secondary">
                        <tr>
                          <th className="px-3 py-3">Thuốc</th>
                          <th className="px-3 py-3">Số lượng</th>
                          <th className="px-3 py-3">Liều dùng</th>
                          <th className="px-3 py-3">Tần suất</th>
                          <th className="px-3 py-3">Thời gian</th>
                          <th className="px-3 py-3">Hướng dẫn</th>
                          <th className="px-3 py-3">Ghi chú</th>
                          <th className="px-3 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptionItems.map((item, index) => (
                          <tr key={`${item.medicineId}-${index}`} className="border-t border-petcenter-border">
                            <td className="px-3 py-3 font-semibold text-petcenter-text">
                              {item.medicineName || detail.medicines.find((medicine) => medicine.id === item.medicineId)?.name}
                            </td>
                            <td className="px-3 py-3">{item.quantity}</td>
                            <td className="px-3 py-3">{item.dosage}</td>
                            <td className="px-3 py-3">{item.frequency}</td>
                            <td className="px-3 py-3">{item.duration}</td>
                            <td className="px-3 py-3">{item.usageInstruction}</td>
                            <td className="px-3 py-3">{item.note || "Không có"}</td>
                            <td className="px-3 py-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  className="h-9 rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                                  onClick={() => openEditPrescriptionDialog(index)}
                                  type="button"
                                  variant="outline"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              <Button
                                className="h-9 rounded-control border-petcenter-border bg-white text-petcenter-danger-text hover:bg-petcenter-background"
                                onClick={() => setDeletingPrescriptionIndex(index)}
                                type="button"
                                variant="outline"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="body-md text-petcenter-text-secondary">Chưa có dòng thuốc nào trong đơn.</p>
                )}
                <Button
                  className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                  disabled={Boolean(isWaiting)}
                  onClick={openPrescriptionDialog}
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Thêm dòng thuốc
                </Button>
              </div>
            )}
          </Section>

          <Dialog
            open={isPrescriptionDialogOpen}
            onOpenChange={(open) => {
              setIsPrescriptionDialogOpen(open)
              if (!open) {
                setEditingPrescriptionIndex(null)
                setPrescriptionDraftErrors({})
              }
            }}
          >
            <DialogContent className="max-w-3xl rounded-2xl bg-white p-6 text-petcenter-text">
              <DialogHeader>
                <DialogTitle className="title-md text-petcenter-text">
                  {editingPrescriptionIndex === null ? "Thêm dòng thuốc" : "Sửa dòng thuốc"}
                </DialogTitle>
                <DialogDescription className="body-sm text-petcenter-text-secondary">
                  Chọn thuốc từ danh mục và nhập hướng dẫn sử dụng cho chủ nuôi.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="label-md mb-1 block font-medium text-petcenter-text">
                    Thuốc <span className="text-petcenter-danger-text">*</span>
                  </span>
                  <select
                    className={fieldInputClass}
                    onChange={(event) => {
                      const medicineId = event.target.value
                      const medicine = detail.medicines.find((option) => option.id === medicineId)
                      setPrescriptionDraft((current) => ({
                        ...current,
                        medicineId,
                        medicineName: medicine?.name,
                      }))
                    }}
                    value={prescriptionDraft.medicineId}
                  >
                    <option value="">Chọn thuốc...</option>
                    {detail.medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name} ({medicine.unit})
                      </option>
                    ))}
                  </select>
                  {prescriptionDraftErrors.medicineId ? (
                    <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors.medicineId}</p>
                  ) : null}
                </label>

                <label>
                  <span className="label-md mb-1 block font-medium text-petcenter-text">
                    Số lượng <span className="text-petcenter-danger-text">*</span>
                  </span>
                  <input
                    className={fieldInputClass}
                    min={1}
                    onChange={(event) =>
                      setPrescriptionDraft((current) => ({ ...current, quantity: Number(event.target.value) }))
                    }
                    type="number"
                    value={prescriptionDraft.quantity ?? ""}
                  />
                  {prescriptionDraftErrors.quantity ? (
                    <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors.quantity}</p>
                  ) : null}
                </label>

                {[
                  ["dosage", "Liều dùng", "Ví dụ: 1 viên/lần"],
                  ["frequency", "Tần suất", "Ví dụ: 2 lần/ngày"],
                  ["duration", "Thời gian", "Ví dụ: 5 ngày"],
                  ["usageInstruction", "Hướng dẫn sử dụng", "Ví dụ: Cho uống sau ăn"],
                  ["note", "Ghi chú", "Ghi chú thêm nếu có"],
                ].map(([key, label, placeholder]) => (
                  <label key={key} className={key === "usageInstruction" || key === "note" ? "md:col-span-2" : ""}>
                    <span className="label-md mb-1 block font-medium text-petcenter-text">
                      {label} {key !== "note" ? <span className="text-petcenter-danger-text">*</span> : null}
                    </span>
                    <input
                      className={fieldInputClass}
                      onChange={(event) =>
                        setPrescriptionDraft((current) => ({ ...current, [key]: event.target.value }))
                      }
                      placeholder={placeholder}
                      type="text"
                      value={String(prescriptionDraft[key as keyof DoctorPrescriptionItem] ?? "")}
                    />
                    {prescriptionDraftErrors[key] ? (
                      <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors[key]}</p>
                    ) : null}
                  </label>
                ))}
              </div>

              <DialogFooter className="-mx-6 -mb-6 mt-2 rounded-b-2xl bg-petcenter-background px-6">
                <Button
                  className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                  onClick={() => setIsPrescriptionDialogOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Hủy
                </Button>
                <Button
                  className="rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
                  onClick={handleAddPrescriptionItem}
                  type="button"
                >
                  {editingPrescriptionIndex === null ? "Thêm vào đơn" : "Lưu thay đổi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deletingPrescriptionIndex !== null} onOpenChange={(open) => !open && setDeletingPrescriptionIndex(null)}>
            <DialogContent className="max-w-md rounded-2xl bg-white p-6 text-petcenter-text">
              <DialogHeader>
                <DialogTitle className="title-md text-petcenter-text">Xóa dòng thuốc</DialogTitle>
                <DialogDescription className="body-sm text-petcenter-text-secondary">
                  Bạn có chắc chắn muốn xóa dòng thuốc này khỏi đơn thuốc không?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="-mx-6 -mb-6 mt-2 rounded-b-2xl bg-petcenter-background px-6">
                <Button
                  className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                  onClick={() => setDeletingPrescriptionIndex(null)}
                  type="button"
                  variant="outline"
                >
                  Hủy
                </Button>
                <Button
                  className="rounded-control bg-petcenter-danger-text text-white hover:bg-petcenter-danger-text/90"
                  onClick={handleConfirmDeletePrescriptionItem}
                  type="button"
                >
                  Xóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Section title="Chỉ định tái khám" icon={CalendarClock}>
            {isReadOnly ? (
              detail.followUp ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <ReadOnlyField label="Ngày tái khám dự kiến" value={formatDate(detail.followUp.followUpDate)} />
                  <ReadOnlyField label="Lý do tái khám" value={detail.followUp.reason} />
                  <ReadOnlyField label="Ghi chú cho chủ nuôi" value={detail.followUp.ownerNote} />
                </div>
              ) : (
                <p className="body-md text-petcenter-text-secondary">Không có chỉ định tái khám.</p>
              )
            ) : (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-petcenter-text">
                  <input
                    checked={needsFollowUp}
                    className="h-4 w-4 accent-petcenter-primary"
                    disabled={Boolean(isWaiting)}
                    onChange={(event) => setNeedsFollowUp(event.target.checked)}
                    type="checkbox"
                  />
                  Cần tái khám
                </label>

                {needsFollowUp ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label>
                      <span className="label-md mb-1 block font-medium text-petcenter-text">
                        Ngày tái khám dự kiến <span className="text-petcenter-danger-text">*</span>
                      </span>
                      <input className={fieldInputClass} min={todayInputValue()} onChange={(event) => setFollowUpDate(event.target.value)} type="date" value={followUpDate} />
                      {validationErrors.followUpDate ? <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{validationErrors.followUpDate}</p> : null}
                    </label>
                    <label className="md:col-span-2">
                      <span className="label-md mb-1 block font-medium text-petcenter-text">
                        Lý do tái khám <span className="text-petcenter-danger-text">*</span>
                      </span>
                      <textarea
                        className={fieldInputClass}
                        onChange={(event) => setFollowUpReason(event.target.value)}
                        placeholder="Ví dụ: Kiểm tra lại tình trạng da sau 7 ngày..."
                        rows={3}
                        value={followUpReason}
                      />
                      {validationErrors.followUpReason ? <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{validationErrors.followUpReason}</p> : null}
                    </label>
                    <label className="md:col-span-2">
                      <span className="label-md mb-1 block font-medium text-petcenter-text">Ghi chú cho chủ nuôi</span>
                      <textarea className={fieldInputClass} onChange={(event) => setFollowUpOwnerNote(event.target.value)} rows={2} value={followUpOwnerNote} />
                    </label>
                  </div>
                ) : null}
              </div>
            )}
          </Section>

          <div className="flex flex-wrap justify-end gap-3 border-t border-petcenter-border pt-4">
            <Link className="hidden" href="/doctor/examinations">
              <Button
                className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                type="button"
                variant="outline"
              >
                {isReadOnly ? "Đóng / Quay lại" : "Quay lại danh sách"}
              </Button>
            </Link>
            {isReadOnly ? (
              <>
                <Link href="/doctor/medical-records">
                  <Button className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background" type="button" variant="outline">
                    Xem bệnh án
                  </Button>
                </Link>
                {detail.prescription ? (
                  <Link href="/doctor/prescriptions">
                    <Button className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background" type="button" variant="outline">
                      Xem đơn thuốc
                    </Button>
                  </Link>
                ) : null}
                <Link href="/doctor/medical-records">
                  <Button className="rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover" type="button">
                    Xem lịch sử khám
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                  disabled={isSubmitting || Boolean(isWaiting)}
                  onClick={handleSaveDraft}
                  type="button"
                  variant="outline"
                >
                  Lưu nháp
                </Button>
                <Button
                  className="rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
                  disabled={isSubmitting || Boolean(isWaiting)}
                  type="submit"
                >
                  {isSubmitting ? "Đang lưu..." : "Hoàn tất khám & Kê đơn"}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
