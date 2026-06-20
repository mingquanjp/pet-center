"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  ExternalLink,
  Pencil,
  FileText,
  HeartPulse,
  History,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
  UploadCloud,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { LoadingState } from "@/components/ui/loading-state"
import { getMedicineUnitLabel } from "@/features/medicines/utils/medicine-format"
import type { MedicineUnit } from "@/features/medicines/types/medicine.types"
import { uploadsApi } from "@/features/uploads/api/uploads.api"
import { cn } from "@/lib/utils"

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

function formatPrescriptionQuantity(quantity?: number | string | null, unit?: string | null) {
  if (quantity === undefined || quantity === null || quantity === "") return "-"
  return unit ? `${quantity} ${formatMedicineUnit(unit)}` : String(quantity)
}

function formatMedicineUnit(unit?: string | null) {
  if (!unit) return ""

  return getMedicineUnitLabel(unit as MedicineUnit)
}

type PrescriptionDurationUnit = "ngày" | "tuần" | "tháng" | "năm"
type PrescriptionFrequencyUnit = "lần/ngày" | "lần/tuần" | "lần/tháng" | "lần/năm"

type PrescriptionDraftValues = {
  quantity: string
  dosage: string
  frequency: string
  frequencyUnit: PrescriptionFrequencyUnit
  duration: string
  durationUnit: PrescriptionDurationUnit
}

function emptyPrescriptionDraftValues(): PrescriptionDraftValues {
  return {
    quantity: "1",
    dosage: "",
    frequency: "",
    frequencyUnit: "lần/ngày",
    duration: "",
    durationUnit: "ngày",
  }
}

function getDosageSuffix(unit?: string | null) {
  if (!unit) return "đơn vị/lần"
  if (unit === "packet") return "gói/lần"
  if (unit === "bottle") return "ml/lần"
  if (unit === "tube") return "lần"
  return "viên/lần"
}

function parseNumericValue(value?: string | null) {
  return value?.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(",", ".") ?? ""
}

function parsePrescriptionDraftValues(item: DoctorPrescriptionItem): PrescriptionDraftValues {
  return {
    quantity: item.quantity === undefined || item.quantity === null ? "" : String(item.quantity),
    dosage: parseNumericValue(item.dosage),
    frequency: parseNumericValue(item.frequency),
    frequencyUnit: item.frequency.toLowerCase().includes("năm")
      ? "lần/năm"
      : item.frequency.toLowerCase().includes("tháng")
        ? "lần/tháng"
        : item.frequency.toLowerCase().includes("tuần")
          ? "lần/tuần"
          : "lần/ngày",
    duration: parseNumericValue(item.duration),
    durationUnit: item.duration.toLowerCase().includes("năm")
      ? "năm"
      : item.duration.toLowerCase().includes("tháng")
        ? "tháng"
        : item.duration.toLowerCase().includes("tuần")
          ? "tuần"
          : "ngày",
  }
}

function buildDosage(value: string, _unit?: string | null) {
  return value.trim()
}

function buildFrequency(value: string, unit: PrescriptionFrequencyUnit) {
  return `${value} ${unit}`
}

function buildDuration(value: string, unit: PrescriptionDurationUnit) {
  return `${value} ${unit}`
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

function ReadOnlyField({ label, value, fullWidth }: { label: string; value?: string | number | null; fullWidth?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors hover:border-[#CBD5E1]", fullWidth && "md:col-span-full")}>
      <p className="mb-1 text-[13px] font-medium text-[#64748B]">{label}</p>
      <p className="text-[15px] font-semibold text-[#0F172A] whitespace-pre-wrap">{value || "Chưa cập nhật"}</p>
    </div>
  )
}

async function openUploadedFile(fileUrl: string) {
  const fileWindow = window.open("about:blank", "_blank")

  try {
    const viewUrl = await uploadsApi.getFileViewUrl(fileUrl)
    if (fileWindow) {
      fileWindow.location.href = viewUrl
    } else {
      window.location.href = viewUrl
    }
  } catch (error) {
    fileWindow?.close()
    toast.error(error instanceof Error ? error.message : "Không thể mở tệp")
  }
}

function ReadOnlyExamField({
  config,
  value,
}: {
  config: DoctorExamFieldConfig
  value: string
}) {
  if (config.type !== "file") {
    return <ReadOnlyField label={config.label} value={fieldValueLabel(config, value)} fullWidth={config.fullWidth} />
  }

  return (
    <div className={config.fullWidth ? "md:col-span-full" : ""}>
      <p className="label-md mb-1 text-petcenter-text-secondary">{config.label}</p>
      {value ? (
        <button
          className="inline-flex items-center gap-2 font-medium text-petcenter-primary hover:underline"
          onClick={() => void openUploadedFile(value)}
          type="button"
        >
          <FileText className="h-4 w-4" />
          Xem tệp đã tải lên
          <ExternalLink className="h-4 w-4" />
        </button>
      ) : (
        <p className="body-md font-medium text-petcenter-text">Chưa cập nhật</p>
      )}
    </div>
  )
}

function getUploadedFileName(url: string) {
  try {
    const filename = new URL(url).pathname.split("/").pop()
    return filename ? decodeURIComponent(filename) : "Tệp kết quả đã tải lên"
  } catch {
    return "Tệp kết quả đã tải lên"
  }
}

function ExamFileUpload({
  value,
  disabled,
  isUploading,
  onChange,
  onFileUpload,
}: {
  value: string
  disabled: boolean
  isUploading?: boolean
  onChange: (value: string) => void
  onFileUpload?: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const selectFile = (files?: FileList | null) => {
    const file = files?.[0]
    if (file) onFileUpload?.(file)
  }

  const cancelUploadedFile = () => {
    onChange("")
    setIsCancelDialogOpen(false)
    toast.success("Đã hủy tài liệu đính kèm")
  }

  return (
    <div className="space-y-3">
      <button
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
          "disabled:cursor-not-allowed disabled:opacity-60",
          isDragging
            ? "border-[#0D9488] bg-[#0D9488]/5"
            : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#0D9488]/50 hover:bg-[#F1F5F9]"
        )}
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          selectFile(event.dataTransfer.files)
        }}
        type="button"
      >
        <input
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*,video/*"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => {
            selectFile(event.target.files)
            event.target.value = ""
          }}
          ref={inputRef}
          type="file"
        />
        <div className="mb-3 rounded-full border border-[#E2E8F0] bg-white p-3 shadow-sm">
          <UploadCloud className="h-6 w-6 text-[#0D9488]" />
        </div>
        <span className="text-[15px] font-semibold text-[#0F172A]">
          {isUploading ? "Đang tải tệp lên..." : "Kéo thả tài liệu hoặc click để tải lên"}
        </span>
        <span className="mt-1 text-[13px] font-medium text-[#64748B]">
          Hỗ trợ PDF, Word, Excel, PowerPoint, ảnh và video. Tối đa 100MB.
        </span>
      </button>

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <FileText className="h-6 w-6 text-[#0D9488]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-[#0F172A]">{getUploadedFileName(value)}</p>
            <p className="text-[13px] font-medium text-[#64748B]">Tệp kết quả đã tải lên</p>
          </div>
          <Button
            className="h-8 w-8 rounded-full text-[#64748B] hover:bg-[#F0FDFA] hover:text-[#0D9488]"
            onClick={() => void openUploadedFile(value)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Mở tệp</span>
          </Button>
          <Button
            className="h-8 w-8 rounded-full text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
            disabled={disabled || isUploading}
            onClick={() => setIsCancelDialogOpen(true)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Xóa tệp</span>
          </Button>
        </div>
      ) : null}

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy tài liệu đính kèm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy tài liệu này khỏi phiếu khám không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              className="bg-petcenter-danger-text text-white hover:bg-petcenter-danger-text/90"
              onClick={cancelUploadedFile}
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FormField({
  config,
  value,
  error,
  disabled,
  isUploading,
  onChange,
  onFileUpload,
}: {
  config: DoctorExamFieldConfig
  value: string
  error?: string
  disabled: boolean
  isUploading?: boolean
  onChange: (value: string) => void
  onFileUpload?: (file: File) => void
}) {
  const inputId = `exam-field-${config.name}`
  const input =
    config.type === "text" && !config.singleLine ? (
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
        <option value="" disabled hidden>Chọn {config.label.toLowerCase()}...</option>
        {(config.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : config.type === "file" ? (
      <ExamFileUpload
        disabled={disabled}
        isUploading={isUploading}
        onChange={onChange}
        onFileUpload={onFileUpload}
        value={value}
      />
    ) : (
      <input
        className={fieldInputClass}
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={config.placeholder}
        step={config.type === "number" ? "0.1" : undefined}
        type={config.type}
        value={value}
      />
    )

  return (
    <div className={cn("group", config.fullWidth ? "md:col-span-full" : "")}>
      <label htmlFor={inputId} className="mb-1.5 flex items-center text-[14px] font-semibold text-[#1E293B] group-focus-within:text-[#0D9488] transition-colors">
        {config.label} {config.required ? <span className="text-petcenter-danger-text">*</span> : null}
      </label>
      <div className={config.unit ? "flex items-center gap-2" : ""}>
        {input}
        {config.unit ? <span className="body-sm w-10 text-petcenter-text-secondary">{config.unit}</span> : null}
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{error}</p> : null}
    </div>
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
  const searchParams = useSearchParams()
  const [detail, setDetail] = useState<DoctorExaminationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFieldName, setUploadingFieldName] = useState<string | null>(null)
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
  const [dispenseMedicine, setDispenseMedicine] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [prescriptionDraft, setPrescriptionDraft] = useState<DoctorPrescriptionItem>(emptyPrescriptionItem())
  const [prescriptionDraftValues, setPrescriptionDraftValues] = useState<PrescriptionDraftValues>(emptyPrescriptionDraftValues())
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
  const returnTo = searchParams.get("returnTo")
  const backHref = returnTo?.startsWith("/doctor/") ? returnTo : "/doctor/examinations"
  const backLabel = backHref.startsWith("/doctor/medical-records/") ? "Quay lại bệnh án" : "Quay lại danh sách"

  const fieldByName = useMemo(() => {
    return new Map(detail?.fields.map((field) => [field.name, field]) ?? [])
  }, [detail])

  const typeFields = detail ? examTypeFieldConfig[detail.examType.code] : []
  const configuredFields = [...clinicalExamFields, ...typeFields]

  const validateForm = () => {
    if (!detail) return false

    const nextErrors: Record<string, string> = {}
    for (const config of configuredFields) {
      if (config.required && !fieldValues[config.name]?.trim()) {
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

    const firstError = Object.values(nextErrors)[0]
    if (firstError) {
      toast.error(firstError)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return false
    }

    return true
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
      dispenseMedicine: includeCompletionData ? dispenseMedicine : undefined,
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

  const handleFileUpload = async (fieldName: string, file: File) => {
    try {
      setUploadingFieldName(fieldName)
      const uploadedFile = await uploadsApi.uploadFile(file)
      setFieldValues((current) => ({ ...current, [fieldName]: uploadedFile.secureUrl }))
      setValidationErrors((current) => ({ ...current, [fieldName]: "" }))
      toast.success("Tải tệp lên thành công")
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Không thể tải tệp lên")
    } finally {
      setUploadingFieldName(null)
    }
  }

  const handleSaveDraft = async () => {
    if (!detail) return
    if (uploadingFieldName) {
      toast.error("Vui lòng chờ tải tệp hoàn tất")
      return
    }

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
      toast.success("Lưu nháp thành công")
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Không thể lưu nháp")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPrescriptionDialog = () => {
    setPrescriptionDraft(emptyPrescriptionItem())
    setPrescriptionDraftValues(emptyPrescriptionDraftValues())
    setPrescriptionDraftErrors({})
    setEditingPrescriptionIndex(null)
    setIsPrescriptionDialogOpen(true)
  }

  const openEditPrescriptionDialog = (index: number) => {
    const item = prescriptionItems[index] ?? emptyPrescriptionItem()
    setPrescriptionDraft(item)
    setPrescriptionDraftValues(parsePrescriptionDraftValues(item))
    setPrescriptionDraftErrors({})
    setEditingPrescriptionIndex(index)
    setIsPrescriptionDialogOpen(true)
  }

  const validatePrescriptionDraft = () => {
    const nextErrors: Record<string, string> = {}

    if (!prescriptionDraft.medicineId) nextErrors.medicineId = "Vui lòng chọn thuốc"
    if (!Number.isInteger(Number(prescriptionDraftValues.quantity)) || Number(prescriptionDraftValues.quantity) <= 0) {
      nextErrors.quantity = "Số lượng phải là số nguyên lớn hơn 0"
    }
    if (!prescriptionDraftValues.dosage.trim()) nextErrors.dosage = "Nhập liều dùng"
    if (!Number.isInteger(Number(prescriptionDraftValues.frequency)) || Number(prescriptionDraftValues.frequency) <= 0) {
      nextErrors.frequency = "Tần suất phải là số nguyên lớn hơn 0"
    }
    if (!Number.isInteger(Number(prescriptionDraftValues.duration)) || Number(prescriptionDraftValues.duration) <= 0) {
      nextErrors.duration = "Thời gian phải là số nguyên lớn hơn 0"
    }
    if (!prescriptionDraft.usageInstruction.trim()) nextErrors.usageInstruction = "Nhập hướng dẫn sử dụng"

    setPrescriptionDraftErrors(nextErrors)

    const firstError = Object.values(nextErrors)[0]
    if (firstError) {
      toast.error(firstError)
      return false
    }

    return true
  }

  const handleAddPrescriptionItem = () => {
    if (!detail) {
      toast.error("Không thể thêm thuốc vì phiếu khám chưa tải xong")
      return
    }

    if (!validatePrescriptionDraft()) return

    const medicine = detail.medicines.find((option) => option.id === prescriptionDraft.medicineId)
    const nextItem = {
      ...prescriptionDraft,
      medicineName: medicine?.name,
      medicineUnit: medicine?.unit,
      quantity: Number(prescriptionDraftValues.quantity),
      dosage: buildDosage(prescriptionDraftValues.dosage, medicine?.unit),
      frequency: buildFrequency(prescriptionDraftValues.frequency, prescriptionDraftValues.frequencyUnit),
      duration: buildDuration(prescriptionDraftValues.duration, prescriptionDraftValues.durationUnit),
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
    setPrescriptionDraftValues(emptyPrescriptionDraftValues())
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
    if (!detail) {
      toast.error("Không thể hoàn tất khám vì phiếu khám chưa tải xong")
      return
    }
    if (uploadingFieldName) {
      toast.error("Vui lòng chờ tải tệp hoàn tất")
      return
    }

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      const hasPrescription = prescriptionItems.some((item) => item.medicineId)
      const result = await doctorExaminationsApi.completeDoctorExamination(appointmentId, buildPayload(true))
      applyDetailState(result)
      router.refresh()
      toast.success(hasPrescription ? "Hoàn tất khám và kê đơn thành công" : "Hoàn tất khám thành công")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Không thể hoàn tất khám")
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
        <Link href={backHref}>
          <Button className="mt-4 rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover">
            {backLabel}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/doctor/examinations" className="hover:text-petcenter-primary">
                    Phiếu khám
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold text-petcenter-text">{detail.examinationCode}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="heading-lg text-petcenter-text">
              {isReadOnly ? "Chi tiết phiếu khám" : "Cập nhật kết quả khám"}
            </h2>
            <DoctorExaminationStatusBadge status={detail.status} />
          </div>

        </div>

        <Link href={backHref}>
          <Button
            className="h-11 rounded-control border-petcenter-primary bg-transparent px-5 font-semibold text-petcenter-primary hover:bg-petcenter-primary hover:text-white"
            type="button"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <aside className="grid grid-cols-1 items-start gap-6">
          <Section title="Thông tin phiếu và thú cưng" icon={FileText}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] p-4 transition-all hover:border-[#0D9488] hover:shadow-md">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-[#F1F5F9]">
                    {detail.pet.imageUrl ? (
                      <Image
                        src={detail.pet.imageUrl}
                        alt={detail.pet.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#F8FAFC] text-[20px] font-bold text-[#0D9488]">
                        {getPetInitials(detail.pet.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[18px] font-bold text-[#0F172A]">{detail.pet.name}</h3>
                      <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[12px] font-bold text-[#64748B]">
                        #{detail.pet.id}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[14px] font-medium text-[#64748B]">
                      <span>{detail.pet.species}</span>
                      {detail.pet.breed ? <span className="text-[#CBD5E1]">•</span> : null}
                      {detail.pet.breed ? <span>{detail.pet.breed}</span> : null}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[14px] font-medium text-[#64748B]">
                      <span>
                        {detail.pet.gender
                          ? detail.pet.gender.toLowerCase() === "male"
                            ? "Đực"
                            : detail.pet.gender.toLowerCase() === "female"
                              ? "Cái"
                              : detail.pet.gender
                          : "Chưa rõ giới tính"}
                      </span>
                      {detail.pet.ageText ? <span className="text-[#CBD5E1]">•</span> : null}
                      {detail.pet.ageText ? <span>{detail.pet.ageText}</span> : null}
                      {detail.pet.weightText ? <span className="text-[#CBD5E1]">•</span> : null}
                      {detail.pet.weightText ? <span>{detail.pet.weightText}</span> : null}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-[#E2E8F0] p-4 transition-all hover:border-[#0D9488] hover:shadow-md">
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#94A3B8]">Thông tin chủ nuôi</p>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0FDFA] text-[#0D9488]">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-bold text-[#0F172A]">{detail.owner.fullName}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-medium text-[#64748B]">
                        <span>{detail.owner.phoneNumber || "Chưa có SĐT"}</span>
                        {detail.owner.email ? <span className="hidden text-[#CBD5E1] sm:inline">•</span> : null}
                        {detail.owner.email ? <span className="truncate">{detail.owner.email}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ReadOnlyField label="Mã phiếu khám" value={detail.examinationCode} />
                <ReadOnlyField label="Ngày giờ khám" value={detail.scheduledAt ? formatDateTime(detail.scheduledAt) : undefined} />
                <ReadOnlyField label="Bác sĩ phụ trách" value={detail.doctor?.fullName || "Chưa phân công"} />
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors hover:border-[#CBD5E1]">
                  <p className="mb-2 text-[13px] font-medium text-[#64748B]">Trạng thái & Loại khám</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <DoctorExaminationStatusBadge status={detail.status} />
                    <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[12px] font-bold text-[#2563EB]">
                      {detail.examType.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-petcenter-warning-text/20 bg-petcenter-warning-bg p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-lg bg-petcenter-warning-text/10 p-1.5 text-petcenter-warning-text">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-petcenter-warning-text">Triệu chứng ghi nhận ban đầu</p>
                    <p className="mt-1 whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-petcenter-warning-text/90">
                      {detail.symptomDescription || "Chưa có triệu chứng ban đầu"}
                    </p>
                    {detail.internalNote ? (
                      <div className="mt-3 border-t border-petcenter-warning-text/20 pt-3">
                        <p className="text-[13px] font-bold uppercase tracking-wider text-petcenter-warning-text/80">Ghi chú nội bộ</p>
                        <p className="mt-1 text-[14px] font-medium italic text-petcenter-warning-text/90">{detail.internalNote}</p>
                      </div>
                    ) : null}
                  </div>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {clinicalExamFields.map((config) =>
                isReadOnly ? (
                  <ReadOnlyField
                    key={config.name}
                    fullWidth={config.fullWidth}
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
                  <ReadOnlyExamField
                    key={config.name}
                    config={config}
                    value={fieldValues[config.name] || ""}
                  />
                ) : (
                  <FormField
                    key={config.name}
                    config={config}
                    disabled={Boolean(isWaiting)}
                    error={validationErrors[config.name]}
                    isUploading={uploadingFieldName === config.name}
                    onChange={(value) => setFieldValues((current) => ({ ...current, [config.name]: value }))}
                    onFileUpload={(file) => void handleFileUpload(config.name, file)}
                    value={fieldValues[config.name] || ""}
                  />
                )
              )}
            </div>
          </Section>

          <Section title="Chẩn đoán & Kết luận" icon={ClipboardCheck}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isReadOnly ? (
                <>
                  <ReadOnlyField label="Chẩn đoán chính" value={diagnosis} />
                  <ReadOnlyField label="Kết luận của bác sĩ" value={conclusion} />
                  <ReadOnlyField label="Ghi chú chuyên môn" value={healthNote} fullWidth />
                </>
              ) : (
                <>
                  <div className="group">
                    <label className="mb-1.5 flex items-center text-[14px] font-semibold text-[#1E293B] group-focus-within:text-[#0D9488] transition-colors">
                      Chẩn đoán chính <span className="ml-1 text-[#EF4444]">*</span>
                    </label>
                    <textarea
                      className={cn(fieldInputClass, "resize-y")}
                      disabled={Boolean(isWaiting)}
                      onChange={(event) => setDiagnosis(event.target.value)}
                      placeholder="Nhập chẩn đoán chính..."
                      rows={3}
                      value={diagnosis}
                    />
                    {validationErrors.diagnosis ? (
                      <p className="mt-1.5 flex items-center gap-1 text-[13px] font-medium text-[#EF4444] animate-in fade-in slide-in-from-top-1">
                        {validationErrors.diagnosis}
                      </p>
                    ) : null}
                  </div>
                  <div className="group">
                    <label className="mb-1.5 flex items-center text-[14px] font-semibold text-[#1E293B] group-focus-within:text-[#0D9488] transition-colors">
                      Kết luận của bác sĩ <span className="ml-1 text-[#EF4444]">*</span>
                    </label>
                    <textarea
                      className={cn(fieldInputClass, "resize-y")}
                      disabled={Boolean(isWaiting)}
                      onChange={(event) => setConclusion(event.target.value)}
                      placeholder="Nhập kết luận sau khi tổng hợp kết quả khám..."
                      rows={3}
                      value={conclusion}
                    />
                    {validationErrors.conclusion ? (
                      <p className="mt-1.5 flex items-center gap-1 text-[13px] font-medium text-[#EF4444] animate-in fade-in slide-in-from-top-1">
                        {validationErrors.conclusion}
                      </p>
                    ) : null}
                  </div>
                  <div className="group md:col-span-2">
                    <label className="mb-1.5 flex items-center text-[14px] font-semibold text-[#1E293B] group-focus-within:text-[#0D9488] transition-colors">
                      Ghi chú chuyên môn
                    </label>
                    <textarea
                      className={cn(fieldInputClass, "resize-y")}
                      disabled={Boolean(isWaiting)}
                      onChange={(event) => setHealthNote(event.target.value)}
                      placeholder="Nhập lưu ý chuyên môn, dặn dò hoặc hướng theo dõi..."
                      rows={3}
                      value={healthNote}
                    />
                  </div>
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
                          <td className="px-3 py-3">{formatPrescriptionQuantity(item.quantity, item.medicineUnit)}</td>
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
                          <th className="w-32 px-3 py-3 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptionItems.map((item, index) => (
                          <tr key={`${item.medicineId}-${index}`} className="border-t border-petcenter-border">
                            <td className="px-3 py-3 font-semibold text-petcenter-text">
                              {item.medicineName || detail.medicines.find((medicine) => medicine.id === item.medicineId)?.name}
                            </td>
                            <td className="px-3 py-3">
                              {formatPrescriptionQuantity(
                                item.quantity,
                                item.medicineUnit || detail.medicines.find((medicine) => medicine.id === item.medicineId)?.unit
                              )}
                            </td>
                            <td className="px-3 py-3">{item.dosage}</td>
                            <td className="px-3 py-3">{item.frequency}</td>
                            <td className="px-3 py-3">{item.duration}</td>
                            <td className="px-3 py-3">{item.usageInstruction}</td>
                            <td className="px-3 py-3">{item.note || "Không có"}</td>
                            <td className="w-32 px-3 py-3 text-center align-middle">
                              <div className="flex justify-center gap-2">
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
                <div className="flex flex-col gap-4">
                  <Button
                    className="w-fit rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                    disabled={Boolean(isWaiting)}
                    onClick={openPrescriptionDialog}
                    type="button"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm dòng thuốc
                  </Button>

                  {prescriptionItems.length > 0 && (
                    <label className="flex items-center gap-2 rounded-lg border border-petcenter-border bg-petcenter-background p-3 hover:cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-petcenter-border text-petcenter-primary focus:ring-petcenter-primary disabled:cursor-not-allowed"
                        checked={dispenseMedicine}
                        onChange={(e) => setDispenseMedicine(e.target.checked)}
                        disabled={Boolean(isWaiting)}
                      />
                      <span className="text-sm font-medium text-petcenter-text">
                        Kê đơn và xuất thuốc tại trung tâm (Bao gồm tiền thuốc vào hóa đơn)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </Section>

          <Dialog
            open={isPrescriptionDialogOpen}
            onOpenChange={(open) => {
              setIsPrescriptionDialogOpen(open)
              if (!open) {
                setEditingPrescriptionIndex(null)
                setPrescriptionDraftValues(emptyPrescriptionDraftValues())
                setPrescriptionDraftErrors({})
              }
            }}
          >
            <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white p-6 text-petcenter-text w-[calc(100%-2rem)]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-petcenter-text">
                  {editingPrescriptionIndex === null ? "Thêm dòng thuốc" : "Sửa dòng thuốc"}
                </DialogTitle>
                <DialogDescription className="body-sm text-petcenter-text-secondary">
                  Chọn thuốc từ danh mục và nhập hướng dẫn sử dụng cho chủ nuôi.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="text-[15px] mb-1 block font-semibold text-petcenter-text">
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
                    <option value="" disabled hidden>Chọn thuốc...</option>
                    {detail.medicines.map((medicine) => (
                      <option
                        key={medicine.id}
                        value={medicine.id}
                        disabled={medicine.stockQuantity <= 0}
                      >
                        {medicine.name} ({formatMedicineUnit(medicine.unit)}) - Tồn kho: {medicine.stockQuantity}
                      </option>
                    ))}
                  </select>
                  {prescriptionDraftErrors.medicineId ? (
                    <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors.medicineId}</p>
                  ) : null}
                </label>

                <label>
                  <span className="text-[15px] mb-1 block font-semibold text-petcenter-text">
                    Số lượng <span className="text-petcenter-danger-text">*</span>
                  </span>
                  <input
                    className={fieldInputClass}
                    min={1}
                    onChange={(event) =>
                      setPrescriptionDraftValues((current) => ({ ...current, quantity: event.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault()
                    }}
                    type="number"
                    value={prescriptionDraftValues.quantity}
                  />
                  {prescriptionDraftErrors.quantity ? (
                    <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors.quantity}</p>
                  ) : null}
                </label>

                <label>
                  <span className="text-[15px] mb-1 block font-semibold text-petcenter-text">
                    Liều dùng <span className="text-petcenter-danger-text">*</span>
                  </span>
                  <input
                    className={fieldInputClass}
                    onChange={(event) => setPrescriptionDraftValues((current) => ({ ...current, dosage: event.target.value }))}
                    placeholder="VD: 1 viên/ lần, bôi mỏng..."
                    type="text"
                    value={prescriptionDraftValues.dosage}
                  />
                  {prescriptionDraftErrors.dosage ? (
                    <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors.dosage}</p>
                  ) : null}
                </label>

                <label>
                  <span className="text-[15px] mb-1 block font-semibold text-petcenter-text">
                    Tần suất <span className="text-petcenter-danger-text">*</span>
                  </span>
                  <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-control border border-petcenter-border-strong bg-white focus-within:border-petcenter-primary focus-within:ring-1 focus-within:ring-petcenter-primary">
                    <input
                      className="min-w-0 bg-transparent px-3 py-2 text-sm outline-none"
                      min="1"
                      onChange={(event) => setPrescriptionDraftValues((current) => ({ ...current, frequency: event.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault()
                      }}
                      placeholder="Nhập số"
                      step="1"
                      type="number"
                      value={prescriptionDraftValues.frequency}
                    />
                    <select
                      className="border-l border-petcenter-border bg-petcenter-background px-3 py-2 text-sm font-medium text-petcenter-text-secondary outline-none focus-within:text-petcenter-text"
                      onChange={(event) =>
                        setPrescriptionDraftValues((current) => ({
                          ...current,
                          frequencyUnit: event.target.value as PrescriptionFrequencyUnit,
                        }))
                      }
                      value={prescriptionDraftValues.frequencyUnit}
                    >
                      <option value="lần/ngày">lần/ngày</option>
                      <option value="lần/tuần">lần/tuần</option>
                      <option value="lần/tháng">lần/tháng</option>
                      <option value="lần/năm">lần/năm</option>
                    </select>
                  </div>
                  {prescriptionDraftErrors.frequency ? (
                    <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors.frequency}</p>
                  ) : null}
                </label>

                <label>
                  <span className="text-[15px] mb-1 block font-semibold text-petcenter-text">
                    Thời gian <span className="text-petcenter-danger-text">*</span>
                  </span>
                  <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-control border border-petcenter-border-strong bg-white focus-within:border-petcenter-primary focus-within:ring-1 focus-within:ring-petcenter-primary">
                    <input
                      className="min-w-0 bg-transparent px-3 py-2 text-sm outline-none"
                      min="1"
                      onChange={(event) => setPrescriptionDraftValues((current) => ({ ...current, duration: event.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault()
                      }}
                      placeholder="Nhập số"
                      step="1"
                      type="number"
                      value={prescriptionDraftValues.duration}
                    />
                    <select
                      className="border-l border-petcenter-border bg-petcenter-background px-3 text-sm font-medium text-petcenter-text-secondary outline-none"
                      onChange={(event) =>
                        setPrescriptionDraftValues((current) => ({
                          ...current,
                          durationUnit: event.target.value as PrescriptionDurationUnit,
                        }))
                      }
                      value={prescriptionDraftValues.durationUnit}
                    >
                      <option value="ngày">Ngày</option>
                      <option value="tuần">Tuần</option>
                      <option value="tháng">Tháng</option>
                      <option value="năm">Năm</option>
                    </select>
                  </div>
                  {prescriptionDraftErrors.duration ? (
                    <p className="mt-1 text-xs font-medium text-petcenter-danger-text">{prescriptionDraftErrors.duration}</p>
                  ) : null}
                </label>

                {[
                  ["usageInstruction", "Hướng dẫn sử dụng", "Ví dụ: Cho uống sau ăn"],
                  ["note", "Ghi chú", "Ghi chú thêm nếu có"],
                ].map(([key, label, placeholder]) => (
                  <label key={key} className="md:col-span-2">
                    <span className="text-[15px] mb-1 block font-semibold text-petcenter-text">
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
            <Link className="hidden" href={backHref}>
              <Button
                className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                type="button"
                variant="outline"
              >
                {backLabel}
              </Button>
            </Link>
            {isReadOnly ? (
              !returnTo && (
                <Link
                  href={`/doctor/medical-records/${detail.pet.id}?returnTo=${encodeURIComponent(`/doctor/examinations/${appointmentId}`)}`}
                >
                  <Button className="rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover" type="button">
                    Xem bệnh án
                  </Button>
                </Link>
              )
            ) : (
              <>
                <Button
                  className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                  disabled={isSubmitting || Boolean(isWaiting) || Boolean(uploadingFieldName)}
                  onClick={handleSaveDraft}
                  type="button"
                  variant="outline"
                >
                  Lưu nháp
                </Button>
                <Button
                  className="rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
                  disabled={isSubmitting || Boolean(isWaiting) || Boolean(uploadingFieldName)}
                  type="submit"
                >
                  {uploadingFieldName ? "Đang tải tệp..." : isSubmitting ? "Đang lưu..." : "Hoàn tất khám & Kê đơn"}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
