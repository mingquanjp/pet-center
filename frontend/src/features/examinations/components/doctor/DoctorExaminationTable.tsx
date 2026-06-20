import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ClipboardList, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { DoctorExamination } from "../../types/examination.types"
import { DoctorExaminationStatusBadge } from "./DoctorExaminationStatusBadge"

interface Props {
  examinations: DoctorExamination[]
  pagination: { total: number; totalPages: number; currentPage: number; limit: number }
  onPageChange: (page: number) => void
  onStartExamination: (appointmentId: string) => void
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

function getPetInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getActionLabel(examination: DoctorExamination) {
  if (examination.status === "EXAMINING") return "Tiếp tục"
  if (examination.status === "WAITING") return "Khám"
  return "Xem"
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) items.add(currentPage - 1)
  if (currentPage < totalPages) items.add(currentPage + 1)
  if (currentPage <= 3) {
    items.add(2)
    items.add(3)
    items.add(4)
  }
  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 3)
    items.add(totalPages - 2)
    items.add(totalPages - 1)
  }

  const sortedItems = Array.from(items)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)

  return sortedItems.flatMap((item, index) => {
    const previousItem = sortedItems[index - 1]

    if (previousItem && item - previousItem > 1) {
      return ["ellipsis", item] as Array<number | "ellipsis">
    }

    return [item]
  })
}

export function DoctorExaminationTable({ examinations, pagination, onPageChange, onStartExamination }: Props) {
  if (examinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center animate-in fade-in duration-500">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-petcenter-info-bg">
          <SearchX className="h-10 w-10 text-petcenter-primary" />
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-petcenter-border bg-petcenter-card shadow-sm">
            <ClipboardList className="h-4 w-4 text-petcenter-text-muted" />
          </div>
        </div>
        <h3 className="heading-sm mb-2 text-petcenter-text">Không có phiếu khám phù hợp</h3>
        <p className="body-md mb-6 text-petcenter-text-secondary">
          Thử đổi bộ lọc hoặc tìm bằng mã phiếu, tên thú cưng, tên chủ nuôi.
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-200 table-fixed border-collapse text-left">
          <thead className="border-b border-petcenter-border bg-petcenter-background">
            <tr>
              <th className="w-[14%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Mã phiếu</th>
              <th className="w-[18%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Thú cưng</th>
              <th className="w-[18%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Chủ nuôi</th>
              <th className="w-[12%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Thời gian</th>
              <th className="w-[13%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Loại khám</th>
              <th className="w-[15%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Trạng thái</th>
              <th className="w-[10%] px-6 py-4 text-center text-sm font-medium text-petcenter-text-secondary">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-petcenter-border bg-white">
            {examinations.map((examination) => {
              const scheduledAt = new Date(examination.scheduledAt)
              const primaryAction = examination.status === "WAITING" || examination.status === "EXAMINING"

              return (
                <tr
                  key={examination.id}
                  className="transition-colors hover:bg-petcenter-background/60"
                >
                  <td className="px-6 py-4 font-semibold text-petcenter-text">
                    {examination.examinationCode}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-petcenter-filter text-xs font-bold text-petcenter-primary">
                        {examination.pet.imageUrl ? (
                          <Image
                            src={examination.pet.imageUrl}
                            alt={examination.pet.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getPetInitials(examination.pet.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-petcenter-text">{examination.pet.name}</p>
                        <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                          {examination.pet.species}
                          {examination.pet.breed ? ` · ${examination.pet.breed}` : ""}
                          {examination.pet.ageText ? ` · ${examination.pet.ageText}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-petcenter-text">{examination.owner.fullName}</p>
                    <p className="body-sm mt-0.5 text-petcenter-text-secondary">{examination.owner.phoneNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-petcenter-text">{dateFormatter.format(scheduledAt)}</p>
                    <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                      {timeFormatter.format(scheduledAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-petcenter-text">{examination.examType.name}</td>
                  <td className="px-6 py-4">
                    <DoctorExaminationStatusBadge status={examination.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {examination.status === "WAITING" ? (
                      <Button
                        className="h-9 whitespace-nowrap rounded-control bg-petcenter-primary px-4 text-white shadow-sm hover:bg-petcenter-primary-hover active:scale-95"
                        onClick={() => onStartExamination(examination.id)}
                        type="button"
                      >
                        {getActionLabel(examination)}
                      </Button>
                    ) : (
                      <Link href={`/doctor/examinations/${examination.id}`}>
                        <Button
                          variant={primaryAction ? "default" : "outline"}
                          className={
                            primaryAction
                              ? "h-9 whitespace-nowrap rounded-control bg-petcenter-primary px-4 text-white shadow-sm hover:bg-petcenter-primary-hover active:scale-95"
                              : "h-9 whitespace-nowrap rounded-control bg-petcenter-cta px-4 font-semibold text-white shadow-sm transition-all hover:bg-petcenter-cta-hover active:scale-95 active:bg-petcenter-cta-active"
                          }
                          type="button"
                        >
                          {getActionLabel(examination)}
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row">
          <p className="text-sm text-petcenter-text-secondary">
            Hiển thị{" "}
            <span className="font-medium text-petcenter-text">
              {(pagination.currentPage - 1) * pagination.limit + 1}
            </span>
            -
            <span className="font-medium text-petcenter-text">
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
            </span>{" "}
            của <span className="font-medium text-petcenter-text">{pagination.total}</span> phiếu khám
          </p>
          <nav className="flex items-center gap-2" aria-label="Phân trang">
            <button
              aria-label="Trang trước"
              className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {getPaginationItems(pagination.currentPage, pagination.totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-9 min-w-9 items-center justify-center text-sm font-medium text-petcenter-text-secondary"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    aria-current={item === pagination.currentPage ? "page" : undefined}
                    className={cn(
                      "h-9 min-w-9 rounded-[0.75rem] px-3 text-sm font-medium transition disabled:cursor-not-allowed",
                      item === pagination.currentPage
                        ? "bg-petcenter-primary text-white shadow-sm"
                        : "border border-petcenter-border bg-white text-petcenter-text hover:bg-petcenter-background"
                    )}
                    onClick={() => onPageChange(item)}
                    type="button"
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
              aria-label="Trang sau"
              className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => onPageChange(pagination.currentPage + 1)}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
