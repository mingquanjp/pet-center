"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  FileText,
  HeartPulse,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"

import { doctorExaminationsApi } from "../../api/doctor-examinations.api"
import {
  CompleteDoctorExaminationPayload,
  DoctorExaminationDetail,
  DoctorExaminationField,
} from "../../types/examination.types"
import { DoctorExaminationStatusBadge } from "../../components/doctor/DoctorExaminationStatusBadge"

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

const selectOptionsByFieldName: Record<string, Array<{ value: string; label: string }>> = {
  body_condition: [
    { value: "good", label: "Tốt" },
    { value: "average", label: "Trung bình" },
    { value: "monitoring", label: "Cần theo dõi" },
  ],
  sample_type: [
    { value: "blood", label: "Máu" },
    { value: "urine", label: "Nước tiểu" },
    { value: "skin", label: "Da/lông" },
    { value: "imaging", label: "Chẩn đoán hình ảnh" },
  ],
  appetite: [
    { value: "excellent", label: "Ăn uống tốt" },
    { value: "stable", label: "Ổn định" },
    { value: "poor", label: "Kém" },
  ],
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

function FieldInput({
  field,
  value,
  disabled,
  onChange,
}: {
  field: DoctorExaminationField
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  const baseClass =
    "w-full rounded-control border border-petcenter-border-strong bg-white px-3 py-2 text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary disabled:bg-petcenter-background disabled:text-petcenter-text-secondary"

  if (field.type === "text") {
    return (
      <textarea
        className={baseClass}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Nhập ${field.label.toLowerCase()}...`}
        rows={field.name.includes("note") || field.name.includes("summary") ? 3 : 2}
        value={value}
      />
    )
  }

  if (field.type === "select") {
    const options = selectOptionsByFieldName[field.name] ?? [
      { value: "yes", label: "Có" },
      { value: "no", label: "Không" },
      { value: "other", label: "Khác" },
    ]

    return (
      <select className={baseClass} disabled={disabled} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">Chọn {field.label.toLowerCase()}...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      className={baseClass}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.type === "file" ? "Dán URL tệp kết quả..." : undefined}
      step={field.type === "number" ? "0.1" : undefined}
      type={field.type === "file" ? "url" : field.type}
      value={value}
    />
  )
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

  useEffect(() => {
    let ignore = false

    async function loadDetail() {
      try {
        setIsLoading(true)
        setError("")
        const result = await doctorExaminationsApi.getDoctorExaminationDetail(appointmentId)
        if (ignore) return

        setDetail(result)
        setDiagnosis(result.diagnosis || "")
        setConclusion(result.conclusion || "")
        setHealthNote(result.healthNote || "")
        setFieldValues(
          Object.fromEntries(result.fields.map((field) => [field.id, getFieldInitialValue(field)]))
        )
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
  const scheduledAt = useMemo(() => (detail ? new Date(detail.scheduledAt) : null), [detail])

  const handleStart = async () => {
    const result = await doctorExaminationsApi.startDoctorExamination(appointmentId)
    setDetail(result)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detail) return

    const payload: CompleteDoctorExaminationPayload = {
      diagnosis,
      conclusion,
      healthNote,
      fieldValues: detail.fields
        .map((field) => buildFieldValue(field, fieldValues[field.id] || ""))
        .filter((value): value is NonNullable<typeof value> => Boolean(value)),
    }

    try {
      setIsSubmitting(true)
      const result = await doctorExaminationsApi.completeDoctorExamination(appointmentId, payload)
      setDetail(result)
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
            <Link className="inline-flex items-center gap-1 hover:text-petcenter-primary" href="/doctor/examinations">
              <ArrowLeft className="h-4 w-4" />
              Phiếu khám
            </Link>
            <span>/</span>
            <span className="text-petcenter-primary">{detail.examinationCode}</span>
          </div>
          <h2 className="heading-lg text-petcenter-text">Cập nhật kết quả khám</h2>
          <p className="body-md mt-1 text-petcenter-text-secondary">
            Ghi nhận kết quả khám cho {detail.pet.name} theo loại {detail.examType.name.toLowerCase()}.
          </p>
        </div>

        <DoctorExaminationStatusBadge status={detail.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="flex flex-col gap-6 xl:col-span-4">
          <section className="rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-6 flex items-start gap-4 border-b border-petcenter-border pb-6">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-petcenter-filter text-petcenter-primary">
                {detail.pet.imageUrl ? (
                  <Image
                    src={detail.pet.imageUrl}
                    alt={detail.pet.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                    {getPetInitials(detail.pet.name)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="title-md text-petcenter-text">{detail.pet.name}</h3>
                <p className="body-sm mt-1 text-petcenter-text-secondary">
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

            <div className="space-y-4">
              <div>
                <p className="label-md mb-1 text-petcenter-text-secondary">Chủ nuôi</p>
                <div className="flex items-center gap-2 text-sm font-medium text-petcenter-text">
                  <User className="h-4 w-4 text-petcenter-text-secondary" />
                  {detail.owner.fullName} {detail.owner.phoneNumber ? `(${detail.owner.phoneNumber})` : ""}
                </div>
              </div>

              <div>
                <p className="label-md mb-1 text-petcenter-text-secondary">Thời gian khám</p>
                <div className="flex items-center gap-2 text-sm font-medium text-petcenter-text">
                  <CalendarClock className="h-4 w-4 text-petcenter-text-secondary" />
                  {scheduledAt ? `${timeFormatter.format(scheduledAt)} - ${dateFormatter.format(scheduledAt)}` : ""}
                </div>
              </div>

              {detail.symptomDescription ? (
                <div className="rounded-control bg-petcenter-filter p-4">
                  <p className="label-md mb-2 font-semibold text-petcenter-text-secondary">
                    Triệu chứng ghi nhận ban đầu
                  </p>
                  <p className="body-md text-petcenter-text">{detail.symptomDescription}</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="title-md mb-3 flex items-center gap-2 text-petcenter-text">
              <FileText className="h-5 w-5 text-petcenter-primary" />
              Loại khám trong phiếu
            </h3>
            <span className="inline-flex rounded-full bg-petcenter-success-bg px-4 py-1.5 text-sm font-semibold text-petcenter-primary">
              {detail.examType.name}
            </span>
          </section>
        </aside>

        <form className="space-y-6 xl:col-span-8" onSubmit={handleSubmit}>
          {detail.status === "WAITING" ? (
            <section className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="title-md text-petcenter-text">Phiếu khám đang chờ</h3>
              <p className="body-md mt-1 text-petcenter-text-secondary">
                Bấm bắt đầu khám để chuyển phiếu sang trạng thái đang khám và mở form nhập kết quả.
              </p>
              <Button
                className="mt-4 rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
                onClick={handleStart}
                type="button"
              >
                Bắt đầu khám
              </Button>
            </section>
          ) : null}

          <section className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="title-md mb-4 flex items-center gap-2 text-petcenter-text">
              <HeartPulse className="h-5 w-5 text-petcenter-primary" />
              Kết quả theo loại khám
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {detail.fields.map((field) => (
                <label
                  key={field.id}
                  className={field.type === "text" || field.type === "file" ? "md:col-span-2" : ""}
                >
                  <span className="label-md mb-1 block font-medium text-petcenter-text">
                    {field.label} {field.isRequired ? <span className="text-petcenter-danger-text">*</span> : null}
                  </span>
                  <FieldInput
                    disabled={Boolean(isReadOnly)}
                    field={field}
                    onChange={(value) => setFieldValues((current) => ({ ...current, [field.id]: value }))}
                    value={fieldValues[field.id] || ""}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="title-md mb-4 flex items-center gap-2 text-petcenter-text">
              <ClipboardCheck className="h-5 w-5 text-petcenter-primary" />
              Chẩn đoán và kết luận
            </h3>
            <div className="space-y-4">
              <label>
                <span className="label-md mb-1 block font-medium text-petcenter-text">
                  Chẩn đoán chính <span className="text-petcenter-danger-text">*</span>
                </span>
                <textarea
                  className="w-full rounded-control border border-petcenter-border-strong bg-white px-3 py-2 text-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary disabled:bg-petcenter-background"
                  disabled={Boolean(isReadOnly)}
                  onChange={(event) => setDiagnosis(event.target.value)}
                  required
                  rows={3}
                  value={diagnosis}
                />
              </label>
              <label>
                <span className="label-md mb-1 block font-medium text-petcenter-text">
                  Kết luận của bác sĩ <span className="text-petcenter-danger-text">*</span>
                </span>
                <textarea
                  className="w-full rounded-control border border-petcenter-border-strong bg-white px-3 py-2 text-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary disabled:bg-petcenter-background"
                  disabled={Boolean(isReadOnly)}
                  onChange={(event) => setConclusion(event.target.value)}
                  required
                  rows={3}
                  value={conclusion}
                />
              </label>
              <label>
                <span className="label-md mb-1 block font-medium text-petcenter-text">Ghi chú chuyên môn</span>
                <textarea
                  className="w-full rounded-control border border-petcenter-border-strong bg-white px-3 py-2 text-sm focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary disabled:bg-petcenter-background"
                  disabled={Boolean(isReadOnly)}
                  onChange={(event) => setHealthNote(event.target.value)}
                  rows={2}
                  value={healthNote}
                />
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-petcenter-border pt-4">
            <Link href="/doctor/examinations">
              <Button
                className="rounded-control border-petcenter-border bg-white text-petcenter-primary hover:bg-petcenter-background"
                type="button"
                variant="outline"
              >
                Quay lại danh sách
              </Button>
            </Link>
            {!isReadOnly && detail.status !== "WAITING" ? (
              <Button
                className="rounded-control bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Đang lưu..." : "Hoàn tất khám"}
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}
