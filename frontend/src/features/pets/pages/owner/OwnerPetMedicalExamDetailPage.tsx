"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Download,
  FileText,
  ImageIcon,
  Info,
  Microscope,
  PawPrint,
  Printer,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { getMedicineUnitLabel } from "@/features/medicines/utils/medicine-format"
import type { MedicineUnit } from "@/features/medicines/types/medicine.types"
import { petsApi } from "../../api/pets.api"
import type { PetMedicalExamDetail, PetMedicalExamFieldValue } from "../../types/pet.types"

const formatPrescriptionQuantity = (quantity: string | null, unit?: string | null) => {
  if (!quantity) return "-"
  return unit ? `${quantity} ${getMedicineUnitLabel(unit as MedicineUnit)}` : quantity
}

export function OwnerPetMedicalExamDetailPage({ examId, petId }: { examId: string; petId: string }) {
  const [exam, setExam] = React.useState<PetMedicalExamDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadExam() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await petsApi.getMedicalExam(petId, examId, { signal: abortController.signal })

        if (!abortController.signal.aborted) {
          setExam(result)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setExam(null)
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải chi tiết phiếu khám")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadExam()

    return () => {
      abortController.abort()
    }
  }, [examId, petId])

  if (isLoading) {
    return <ExamDetailSkeleton />
  }

  if (errorMessage || !exam) {
    return <ErrorState message={errorMessage ?? "Không tìm thấy phiếu khám"} petId={petId} />
  }

  const petSubtitle = [exam.pet.speciesLabel, exam.pet.breed].filter(Boolean).join(" / ")

  function printExam() {
    if (!exam) return
    const currentExam = exam
    printHtmlDocument(`Phiếu khám ${currentExam.examId}`, buildExamPrintHtml(currentExam))
  }

  function downloadPrescription() {
    const currentExam = exam
    const currentPrescription = currentExam?.prescription
    if (!currentExam || !currentPrescription) return

    const generatedAt = new Date()

    exportPrescriptionExcel({
      exam: currentExam,
      generatedAt,
      prescription: currentPrescription,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <nav className="label-md flex flex-wrap items-center gap-2 text-petcenter-text-secondary" aria-label="Breadcrumb">
        <Link className="transition-colors hover:text-petcenter-primary" href="/owner/pets">
          Thú cưng
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link className="transition-colors hover:text-petcenter-primary" href="/owner/pets">
          Danh sách thú cưng
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link className="transition-colors hover:text-petcenter-primary" href={`/owner/pets/${encodeURIComponent(petId)}`}>
          {exam.pet.petName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-petcenter-text">Chi tiết phiếu khám</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-lg text-petcenter-text">Chi tiết phiếu khám</h1>
            <span className="label-sm inline-flex rounded-pill bg-petcenter-success-bg px-3 py-1 font-semibold text-petcenter-success-text">
              {getExamStatusLabel(exam.examStatus)}
            </span>
          </div>
          <p className="body-lg mt-2 text-petcenter-text-secondary">
            {exam.examId} • {exam.pet.petName}
          </p>
        </div>

        <button
          className="label-md inline-flex h-10 w-full items-center justify-center gap-2 rounded-control border border-petcenter-primary px-4 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5 sm:w-auto"
          onClick={printExam}
          type="button"
        >
          <Printer className="h-4 w-4" />
          In phiếu khám
        </button>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <aside className="flex flex-col gap-gutter lg:col-span-4">
          <InfoCard icon={FileText} title="Thông tin phiếu khám">
            <InfoRow label="Mã phiếu" value={exam.examId} />
            <InfoRow label="Ngày khám" value={formatDate(exam.examDate)} />
            <InfoRow label="Giờ khám" value={formatTime(exam.scheduledAt)} />
            <InfoRow label="Loại khám" value={exam.examTypeName} />
            <InfoRow label="Trạng thái" value={getExamStatusLabel(exam.examStatus)} valueClassName="text-petcenter-primary" />
          </InfoCard>

          <InfoCard icon={PawPrint} title="Thông tin thú cưng">
            <div className="mb-4 flex items-center gap-4">
              {exam.pet.profileImageUrl ? (
                <div
                  aria-label={`Ảnh thú cưng ${exam.pet.petName}`}
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-petcenter-border bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${exam.pet.profileImageUrl})` }}
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-petcenter-border bg-petcenter-sidebar">
                  <PawPrint className="h-7 w-7 text-petcenter-primary/40" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="heading-sm truncate text-petcenter-text">{exam.pet.petName}</h2>
                <p className="label-md text-petcenter-text-secondary">{petSubtitle || exam.pet.speciesLabel}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-control border border-petcenter-border bg-petcenter-filter p-3">
              <InfoTile label="Tuổi" value={exam.pet.ageLabel} />
              <InfoTile label="Giới tính" value={exam.pet.genderLabel} />
            </div>
          </InfoCard>

          <InfoCard icon={Stethoscope} title="Bác sĩ phụ trách">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-petcenter-sidebar">
                <UserRound className="h-6 w-6 text-petcenter-text-muted" />
              </div>
              <div className="min-w-0">
                <p className="title-md text-petcenter-text">{exam.veterinarianName}</p>
                <p className="body-sm mt-1 text-petcenter-text-secondary">{exam.examTypeName}</p>
                <div className="mt-3 rounded-control border border-petcenter-border bg-petcenter-filter p-3">
                  <p className="label-sm mb-1 text-petcenter-text-secondary">Ghi chú</p>
                  <p className="body-sm text-petcenter-text">{exam.healthNote || "Chưa có ghi chú thêm"}</p>
                </div>
              </div>
            </div>
          </InfoCard>
        </aside>

        <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card lg:col-span-8">
          <h2 className="heading-md mb-6 flex items-center gap-2 border-b border-petcenter-border pb-4 text-petcenter-text">
            <Microscope className="h-6 w-6 text-petcenter-primary" />
            Kết quả khám
          </h2>

          <div className="space-y-8">
            <ResultSection title="Triệu chứng ban đầu">
              <ResultBox>{exam.symptomDescription || "Không ghi nhận triệu chứng ban đầu."}</ResultBox>
            </ResultSection>

            <ResultSection title="Chẩn đoán">
              <ResultBox>{exam.diagnosis || "Chưa cập nhật chẩn đoán."}</ResultBox>
            </ResultSection>

            <ResultSection title="Xét nghiệm">
              {exam.fieldValues.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {exam.fieldValues.map((field) => (
                    <FieldValueCard field={field} key={field.fieldValueId} />
                  ))}
                </div>
              ) : (
                <p className="body-md italic text-petcenter-text-muted">Chưa có kết quả xét nghiệm đính kèm.</p>
              )}
            </ResultSection>

            <ResultSection title="Kết luận & khuyến nghị">
              <div className="rounded-control border border-petcenter-border bg-petcenter-filter p-4">
                <p className="body-md flex items-start gap-3 text-petcenter-text-secondary">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-petcenter-cta" />
                  <span>{exam.conclusion || exam.healthNote || "Chưa cập nhật kết luận."}</span>
                </p>
              </div>
            </ResultSection>

            <ResultSection title="Đơn thuốc">
              {exam.prescription?.items.length ? (
                <div className="overflow-x-auto rounded-control border border-petcenter-border">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-petcenter-primary/10 text-petcenter-primary-active">
                      <tr>
                        <TableHeader>Tên thuốc</TableHeader>
                        <TableHeader>Số lượng</TableHeader>
                        <TableHeader>Liều lượng</TableHeader>
                        <TableHeader>Tần suất</TableHeader>
                        <TableHeader>Thời gian</TableHeader>
                        <TableHeader>Ghi chú</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-petcenter-border bg-white">
                      {exam.prescription.items.map((item) => (
                        <tr className="transition hover:bg-petcenter-filter" key={item.prescriptionItemId}>
                          <TableCell className="font-semibold text-petcenter-text">{item.medicineName}</TableCell>
                          <TableCell>{formatPrescriptionQuantity(item.quantity, item.medicineUnit)}</TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell>{item.frequency}</TableCell>
                          <TableCell>{item.duration}</TableCell>
                          <TableCell>{item.usageInstruction || item.note || "Không có"}</TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {exam.prescription.generalNote ? <p className="body-sm border-t border-petcenter-border bg-petcenter-filter p-3 text-petcenter-text-secondary">{exam.prescription.generalNote}</p> : null}
                </div>
              ) : (
                <p className="body-md italic text-petcenter-text-muted">Chưa có đơn thuốc cho phiếu khám này.</p>
              )}
            </ResultSection>

            <ResultSection title="Tái khám">
              {exam.followUp ? (
                <div className="rounded-control border border-petcenter-border bg-petcenter-filter p-4">
                  <p className="title-md text-petcenter-primary">{formatDate(exam.followUp.followUpDate)}</p>
                  <p className="body-md mt-1 text-petcenter-text-secondary">{exam.followUp.reason}</p>
                  {exam.followUp.ownerNote ? <p className="body-sm mt-2 italic text-petcenter-text-muted">{exam.followUp.ownerNote}</p> : null}
                </div>
              ) : (
                <p className="body-md italic text-petcenter-text-muted">Chưa có chỉ định tái khám.</p>
              )}
            </ResultSection>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t border-petcenter-border-strong pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="label-md inline-flex h-11 items-center justify-center gap-2 rounded-control border border-petcenter-border-strong px-5 font-semibold text-petcenter-text-secondary transition hover:bg-petcenter-sidebar"
          href={`/owner/pets/${encodeURIComponent(petId)}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại lịch sử khám
        </Link>
        <button
          className="label-md inline-flex h-11 items-center justify-center gap-2 rounded-control bg-petcenter-primary px-5 font-semibold text-white shadow-card transition hover:bg-petcenter-primary-hover disabled:cursor-not-allowed disabled:bg-petcenter-text-muted"
          disabled={!exam.prescription}
          onClick={downloadPrescription}
          type="button"
        >
          <Download className="h-4 w-4" />
          Tải toa thuốc
        </button>
      </div>
    </div>
  )
}

function InfoCard({ children, icon: Icon, title }: { children: React.ReactNode; icon: LucideIcon; title: string }) {
  return (
    <section className="rounded-card border border-petcenter-border bg-white p-6 shadow-card">
      <h2 className="title-md mb-4 flex items-center gap-2 text-petcenter-text">
        <Icon className="h-5 w-5 text-petcenter-primary" />
        {title}
      </h2>
      {children}
    </section>
  )
}

function InfoRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-petcenter-border py-3 last:border-b-0">
      <span className="body-sm text-petcenter-text-muted">{label}</span>
      <span className={cn("body-sm max-w-[60%] text-right font-semibold text-petcenter-text", valueClassName)}>{value}</span>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-sm mb-1 text-petcenter-text-secondary">{label}</p>
      <p className="body-md font-semibold text-petcenter-text">{value}</p>
    </div>
  )
}

function ResultSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <h3 className="title-md mb-3 text-petcenter-text">{title}</h3>
      {children}
    </section>
  )
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return <div className="body-md rounded-control border border-petcenter-border bg-petcenter-filter p-4 text-petcenter-text-secondary">{children}</div>
}

function FieldValueCard({ field }: { field: PetMedicalExamFieldValue }) {
  const isFile = field.fieldType === "file" && field.fileUrl

  return (
    <div className="flex items-start gap-3 rounded-control border border-petcenter-border bg-petcenter-filter p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-petcenter-border bg-white text-petcenter-primary">
        {isFile ? <FileIcon fileUrl={field.fileUrl} /> : <FileText className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="body-sm truncate font-semibold text-petcenter-text">{field.fieldLabel}</p>
        <p className="label-sm mt-1 text-petcenter-text-muted">{formatDateTime(field.createdAt)}</p>
        {isFile ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              className="label-sm rounded-control border border-petcenter-primary px-2 py-1 font-semibold text-petcenter-primary transition hover:bg-petcenter-primary/5"
              href={field.fileUrl ?? "#"}
              rel="noreferrer"
              target="_blank"
            >
              Xem file
            </a>
            <a className="label-sm px-2 py-1 font-semibold text-petcenter-text-secondary transition hover:text-petcenter-primary" href={field.fileUrl ?? "#"} download>
              Tải xuống
            </a>
          </div>
        ) : (
          <p className="body-md mt-2 text-petcenter-text-secondary">{getFieldDisplayValue(field)}</p>
        )}
      </div>
    </div>
  )
}

function FileIcon({ fileUrl }: { fileUrl: string | null }) {
  if (fileUrl?.match(/\.(png|jpe?g|webp|gif)$/i)) {
    return <ImageIcon className="h-5 w-5" />
  }

  return <FileText className="h-5 w-5" />
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <th className="label-md border-b border-petcenter-border px-4 py-3 font-semibold">{children}</th>
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("body-sm px-4 py-3 text-petcenter-text-secondary", className)}>{children}</td>
}

function ExamDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-6">
      <div className="h-6 w-96 max-w-full rounded bg-petcenter-sidebar" />
      <div className="h-20 rounded bg-petcenter-sidebar" />
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="space-y-gutter lg:col-span-4">
          <div className="h-64 rounded-card bg-white shadow-card" />
          <div className="h-56 rounded-card bg-white shadow-card" />
          <div className="h-52 rounded-card bg-white shadow-card" />
        </div>
        <div className="h-[720px] rounded-card bg-white shadow-card lg:col-span-8" />
      </div>
    </div>
  )
}

function ErrorState({ message, petId }: { message: string; petId: string }) {
  return (
    <section className="mx-auto flex w-full max-w-3xl items-start gap-3 rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h1 className="label-md font-semibold">Không thể tải chi tiết phiếu khám</h1>
        <p className="body-md mt-1">{message}</p>
        <Link className="label-md mt-4 inline-flex font-semibold text-petcenter-danger-text underline" href={`/owner/pets/${encodeURIComponent(petId)}`}>
          Quay lại hồ sơ thú cưng
        </Link>
      </div>
    </section>
  )
}

function getExamStatusLabel(status: PetMedicalExamDetail["examStatus"]) {
  return {
    result_recorded: "Đã có kết quả",
    prescribed: "Có toa thuốc",
    follow_up_required: "Cần tái khám",
  }[status]
}

function getFieldDisplayValue(field: PetMedicalExamFieldValue) {
  if (field.valueText) return field.valueText
  if (field.valueNumber !== null) return String(field.valueNumber)
  if (field.valueDate) return formatDate(field.valueDate)

  return "Chưa có dữ liệu"
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

function formatTime(value: string | null) {
  if (!value) return "Chưa cập nhật"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
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

function buildExamPrintHtml(exam: PetMedicalExamDetail) {
  const petSubtitle = [exam.pet.speciesLabel, exam.pet.breed].filter(Boolean).join(" / ")
  const fieldRows = exam.fieldValues.length
    ? exam.fieldValues
      .map(
        (field) => `
            <tr>
              <td>${escapeHtml(field.fieldLabel)}</td>
              <td>${escapeHtml(field.fieldType === "file" && field.fileUrl ? field.fileUrl : getFieldDisplayValue(field))}</td>
            </tr>`
      )
      .join("")
    : `<tr><td colspan="2">Chưa có kết quả xét nghiệm đính kèm.</td></tr>`
  const prescriptionRows = exam.prescription?.items.length
    ? exam.prescription.items
      .map(
        (item) => `
            <tr>
              <td>${escapeHtml(item.medicineName)}</td>
              <td>${escapeHtml(formatPrescriptionQuantity(item.quantity, item.medicineUnit))}</td>
              <td>${escapeHtml(item.dosage)}</td>
              <td>${escapeHtml(item.frequency)}</td>
              <td>${escapeHtml(item.duration)}</td>
              <td>${escapeHtml(item.usageInstruction || item.note || "")}</td>
            </tr>`
      )
      .join("")
    : `<tr><td colspan="6">Chưa có đơn thuốc cho phiếu khám này.</td></tr>`

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Phiếu khám ${escapeHtml(exam.examId)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #fff; color: #1b1c15; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.5; }
      main { max-width: 900px; margin: 0 auto; padding: 32px; }
      header { border-bottom: 2px solid #00796b; padding-bottom: 16px; margin-bottom: 24px; }
      h1 { margin: 0; font-size: 24px; color: #005e53; }
      h2 { margin: 24px 0 10px; font-size: 16px; color: #005e53; }
      p { margin: 4px 0; }
      .muted { color: #52605c; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 28px; }
      .box { border: 1px solid #d3dad6; border-radius: 8px; padding: 12px; background: #fbfaf2; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #d3dad6; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #d8f3ee; color: #003d36; }
      footer { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; text-align: center; }
      .signature { padding-top: 56px; border-top: 1px solid transparent; }
      @media print {
        main { padding: 0; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Phiếu khám bệnh thú cưng</h1>
        <p class="muted">Mã phiếu: <strong>${escapeHtml(exam.examId)}</strong> • Trạng thái: ${escapeHtml(getExamStatusLabel(exam.examStatus))}</p>
      </header>

      <section class="grid">
        <div class="box">
          <h2>Thông tin phiếu khám</h2>
          <p><strong>Ngày khám:</strong> ${escapeHtml(formatDate(exam.examDate))}</p>
          <p><strong>Giờ khám:</strong> ${escapeHtml(formatTime(exam.scheduledAt))}</p>
          <p><strong>Loại khám:</strong> ${escapeHtml(exam.examTypeName)}</p>
          <p><strong>Bác sĩ:</strong> ${escapeHtml(exam.veterinarianName)}</p>
        </div>
        <div class="box">
          <h2>Thông tin thú cưng</h2>
          <p><strong>Tên:</strong> ${escapeHtml(exam.pet.petName)}</p>
          <p><strong>Giống loài:</strong> ${escapeHtml(petSubtitle || exam.pet.speciesLabel)}</p>
          <p><strong>Tuổi:</strong> ${escapeHtml(exam.pet.ageLabel)}</p>
          <p><strong>Giới tính:</strong> ${escapeHtml(exam.pet.genderLabel)}</p>
        </div>
      </section>

      <h2>Triệu chứng ban đầu</h2>
      <div class="box">${escapeHtml(exam.symptomDescription || "Không ghi nhận triệu chứng ban đầu.")}</div>

      <h2>Chẩn đoán</h2>
      <div class="box">${escapeHtml(exam.diagnosis || "Chưa cập nhật chẩn đoán.")}</div>

      <h2>Kết quả xét nghiệm</h2>
      <table>
        <thead><tr><th>Thông tin</th><th>Kết quả</th></tr></thead>
        <tbody>${fieldRows}</tbody>
      </table>

      <h2>Kết luận & khuyến nghị</h2>
      <div class="box">${escapeHtml(exam.conclusion || exam.healthNote || "Chưa cập nhật kết luận.")}</div>

      <h2>Đơn thuốc</h2>
      <table>
        <thead><tr><th>Tên thuốc</th><th>Số lượng</th><th>Liều lượng</th><th>Tần suất</th><th>Thời gian</th><th>Hướng dẫn</th></tr></thead>
        <tbody>${prescriptionRows}</tbody>
      </table>

      <h2>Tái khám</h2>
      <div class="box">${exam.followUp
      ? `${escapeHtml(formatDate(exam.followUp.followUpDate))}<br />${escapeHtml(exam.followUp.reason)}`
      : "Chưa có chỉ định tái khám."
    }</div>

      <footer>
        <div>
          <p><strong>Chủ nuôi</strong></p>
          <p class="signature">Ký và ghi rõ họ tên</p>
        </div>
        <div>
          <p><strong>Bác sĩ phụ trách</strong></p>
          <p class="signature">${escapeHtml(exam.veterinarianName)}</p>
        </div>
      </footer>
    </main>
  </body>
</html>`
}

function printHtmlDocument(title: string, html: string) {
  const printWindow = window.open("", "_blank", "width=980,height=720")

  if (!printWindow) {
    window.print()
    return
  }

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.document.title = title
  printWindow.focus()

  window.setTimeout(() => {
    printWindow.print()
  }, 250)
}

function exportPrescriptionExcel({
  exam,
  generatedAt,
  prescription,
}: {
  exam: PetMedicalExamDetail
  generatedAt: Date
  prescription: NonNullable<PetMedicalExamDetail["prescription"]>
}) {
  const headers = ["STT", "Tên thuốc", "Số lượng", "Liều lượng", "Tần suất", "Thời gian", "Hướng dẫn sử dụng", "Ghi chú"]
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")
  const rowHtml = prescription.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.medicineName)}</td>
          <td>${escapeHtml(formatPrescriptionQuantity(item.quantity, item.medicineUnit))}</td>
          <td>${escapeHtml(item.dosage)}</td>
          <td>${escapeHtml(item.frequency)}</td>
          <td>${escapeHtml(item.duration)}</td>
          <td>${escapeHtml(item.usageInstruction || "Không có")}</td>
          <td>${escapeHtml(item.note || "Không có")}</td>
        </tr>
      `
    )
    .join("")
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #1f2a27; }
          table { border-collapse: collapse; width: 100%; }
          th { background: #005e53; color: #ffffff; font-weight: 700; }
          th, td { border: 1px solid #cfd9d5; padding: 8px; mso-number-format: "\\@"; vertical-align: top; }
          .title { color: #005e53; font-size: 22px; font-weight: 700; }
          .section { background: #eef7f4; font-weight: 700; }
          .meta-label { width: 180px; font-weight: 700; color: #4f625d; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="${headers.length}" class="title">PetCenter - Toa thuốc</td></tr>
          <tr><td class="meta-label">Mã phiếu</td><td colspan="${headers.length - 1}">${escapeHtml(exam.examId)}</td></tr>
          <tr><td class="meta-label">Thú cưng</td><td colspan="${headers.length - 1}">${escapeHtml(exam.pet.petName)}</td></tr>
          <tr><td class="meta-label">Ngày khám</td><td colspan="${headers.length - 1}">${escapeHtml(formatDate(exam.examDate))}</td></tr>
          <tr><td class="meta-label">Bác sĩ</td><td colspan="${headers.length - 1}">${escapeHtml(exam.veterinarianName)}</td></tr>
          <tr><td class="meta-label">Ngày xuất toa</td><td colspan="${headers.length - 1}">${escapeHtml(formatDate(prescription.prescribedAt))}</td></tr>
          <tr><td class="meta-label">Ngày tải file</td><td colspan="${headers.length - 1}">${escapeHtml(formatDateTime(generatedAt.toISOString()))}</td></tr>
          <tr><td class="meta-label">Ghi chú chung</td><td colspan="${headers.length - 1}">${escapeHtml(prescription.generalNote || "Không có")}</td></tr>
          <tr><td colspan="${headers.length}" class="section">Danh sách thuốc</td></tr>
          <tr>${headerHtml}</tr>
          ${rowHtml || `<tr><td colspan="${headers.length}">Không có thuốc trong toa.</td></tr>`}
        </table>
      </body>
    </html>
  `

  downloadTextFile(
    `toa-thuoc-${toSafeFilename(exam.pet.petName)}-${exam.examId}-${formatFileDate(generatedAt)}.xls`,
    `\uFEFF${html}`,
    "application/vnd.ms-excel;charset=utf-8"
  )
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

function escapeHtml(value: string | number | null | undefined) {
  const normalizedValue = value === null || value === undefined ? "" : String(value)

  return normalizedValue
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function toSafeFilename(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "thu-cung"
  )
}

function formatFileDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value)
}
