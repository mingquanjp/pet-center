"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react"

import { AppPagination } from "@/components/ui/app-pagination"
import { cn } from "@/lib/utils"

type FollowUpStatus = "upcoming" | "overdue" | "completed"

type FollowUpRow = {
  followUpId: string
  pet: {
    name: string
    species: string
    breed: string
    avatarClassName: string
  }
  ownerName: string
  examId: string
  appointmentDate: string
  reason: string
  status: FollowUpStatus
}

const pageSize = 3

const followUps: FollowUpRow[] = [
  {
    followUpId: "FU-2024-001",
    pet: {
      name: "Lucky",
      species: "Chó",
      breed: "Golden",
      avatarClassName: "bg-[#fff3d8] text-[#b45309]",
    },
    ownerName: "Nguyễn Văn A",
    examId: "PK-2024-001",
    appointmentDate: "31/10/2024",
    reason: "Kiểm tra lại tình trạng da",
    status: "upcoming",
  },
  {
    followUpId: "FU-2024-002",
    pet: {
      name: "Mimi",
      species: "Mèo",
      breed: "Anh Lông Ngắn",
      avatarClassName: "bg-[#e4e3d7] text-[#3e4946]",
    },
    ownerName: "Trần Thị B",
    examId: "PK-2024-002",
    appointmentDate: "25/10/2024",
    reason: "Tái khám sau phẫu thuật triệt sản",
    status: "overdue",
  },
  {
    followUpId: "FU-2024-003",
    pet: {
      name: "Kiki",
      species: "Chó",
      breed: "Poodle",
      avatarClassName: "bg-[#f5f4e8] text-[#3e4946]",
    },
    ownerName: "Lê Văn C",
    examId: "PK-2024-008",
    appointmentDate: "28/10/2024",
    reason: "Kiểm tra hô hấp",
    status: "completed",
  },
  {
    followUpId: "FU-2024-004",
    pet: {
      name: "Bông",
      species: "Mèo",
      breed: "Ba Tư",
      avatarClassName: "bg-[#d8f3ee] text-[#005e53]",
    },
    ownerName: "Phạm Minh D",
    examId: "PK-2024-012",
    appointmentDate: "02/11/2024",
    reason: "Đánh giá lại tình trạng mắt",
    status: "upcoming",
  },
  {
    followUpId: "FU-2024-005",
    pet: {
      name: "Bull",
      species: "Chó",
      breed: "Pug",
      avatarClassName: "bg-[#e0f2fe] text-[#0369a1]",
    },
    ownerName: "Hoàng Đức E",
    examId: "PK-2024-015",
    appointmentDate: "22/10/2024",
    reason: "Theo dõi tiêu hóa sau dùng thuốc",
    status: "overdue",
  },
  {
    followUpId: "FU-2024-006",
    pet: {
      name: "Milo",
      species: "Chó",
      breed: "Beagle",
      avatarClassName: "bg-[rgba(254,166,25,0.2)] text-[#855300]",
    },
    ownerName: "Đỗ Khánh H",
    examId: "PK-2024-018",
    appointmentDate: "20/10/2024",
    reason: "Kiểm tra lại phản ứng sau tiêm",
    status: "completed",
  },
  {
    followUpId: "FU-2024-007",
    pet: {
      name: "Kem",
      species: "Mèo",
      breed: "Munchkin",
      avatarClassName: "bg-[rgba(0,121,107,0.15)] text-[#00796b]",
    },
    ownerName: "Ngô Thanh K",
    examId: "PK-2024-021",
    appointmentDate: "04/11/2024",
    reason: "Theo dõi phục hồi da",
    status: "upcoming",
  },
  {
    followUpId: "FU-2024-008",
    pet: {
      name: "Mít",
      species: "Chó",
      breed: "Corgi",
      avatarClassName: "bg-[#fde2e2] text-[#b91c1c]",
    },
    ownerName: "Vũ Hải L",
    examId: "PK-2024-027",
    appointmentDate: "18/10/2024",
    reason: "Tái kiểm tra khớp chân sau",
    status: "completed",
  },
  {
    followUpId: "FU-2024-009",
    pet: {
      name: "Nâu",
      species: "Mèo",
      breed: "Xiêm",
      avatarClassName: "bg-[#f5f4e8] text-[#684000]",
    },
    ownerName: "Bùi Hà M",
    examId: "PK-2024-031",
    appointmentDate: "06/11/2024",
    reason: "Kiểm tra lại chỉ số sau xét nghiệm",
    status: "upcoming",
  },
  {
    followUpId: "FU-2024-010",
    pet: {
      name: "Gấu",
      species: "Chó",
      breed: "Samoyed",
      avatarClassName: "bg-[#e4e3d7] text-[#3e4946]",
    },
    ownerName: "Mai Anh N",
    examId: "PK-2024-034",
    appointmentDate: "16/10/2024",
    reason: "Đánh giá sau điều trị viêm tai",
    status: "completed",
  },
  {
    followUpId: "FU-2024-011",
    pet: {
      name: "Tôm",
      species: "Mèo",
      breed: "Maine Coon",
      avatarClassName: "bg-[#d8f3ee] text-[#005e53]",
    },
    ownerName: "Trịnh Quốc P",
    examId: "PK-2024-039",
    appointmentDate: "24/10/2024",
    reason: "Tái khám sau phẫu thuật nhỏ",
    status: "overdue",
  },
  {
    followUpId: "FU-2024-012",
    pet: {
      name: "Coco",
      species: "Chó",
      breed: "Pomeranian",
      avatarClassName: "bg-[#fff3d8] text-[#b45309]",
    },
    ownerName: "Lý Minh Q",
    examId: "PK-2024-041",
    appointmentDate: "12/10/2024",
    reason: "Theo dõi sau điều trị dị ứng",
    status: "completed",
  },
]

const statusStyles: Record<
  FollowUpStatus,
  {
    dateClassName: string
    icon: typeof CalendarDays
    label: string
    pillClassName: string
  }
> = {
  upcoming: {
    dateClassName: "text-[#3e4946]",
    icon: CalendarDays,
    label: "Sắp đến",
    pillClassName: "bg-[#fff3d8] text-[#b45309]",
  },
  overdue: {
    dateClassName: "text-[#ba1a1a]",
    icon: AlertTriangle,
    label: "Quá hạn",
    pillClassName: "bg-[#fde2e2] text-[#b91c1c]",
  },
  completed: {
    dateClassName: "text-[#3e4946]",
    icon: CalendarCheck,
    label: "Đã hoàn tất",
    pillClassName: "bg-[#dff3e3] text-[#2e7d32]",
  },
}

const stats = [
  {
    badge: "Quan trọng",
    badgeClassName: "bg-[#fea619] text-[#684000]",
    icon: CalendarClock,
    iconClassName: "bg-[rgba(254,166,25,0.3)] text-[#b45309]",
    label: "Sắp đến",
    value: "06",
    valueClassName: "text-[#1b1c15]",
  },
  {
    icon: AlertTriangle,
    iconClassName: "bg-[rgba(255,218,214,0.5)] text-[#ba1a1a]",
    label: "Quá hạn",
    value: "02",
    valueClassName: "text-[#ba1a1a]",
  },
  {
    icon: CheckCircle2,
    iconClassName: "bg-[rgba(80,115,87,0.4)] text-[#507357]",
    label: "Đã hoàn tất",
    value: "12",
    valueClassName: "text-[#1b1c15]",
  },
]

export function DoctorFollowUpsPage() {
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredFollowUps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) return followUps

    return followUps.filter((followUp) =>
      [
        followUp.followUpId,
        followUp.pet.name,
        followUp.pet.species,
        followUp.pet.breed,
        followUp.ownerName,
        followUp.examId,
        followUp.reason,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filteredFollowUps.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const visibleFollowUps = filteredFollowUps.slice(startIndex, startIndex + pageSize)
  const startItem = filteredFollowUps.length === 0 ? 0 : startIndex + 1
  const endItem = Math.min(startIndex + pageSize, filteredFollowUps.length)

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="h-full overflow-y-auto bg-petcenter-background">
      <main className="w-full px-6 py-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
          <header className="flex flex-col gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs leading-4">
              <span className="font-medium text-[#3e4946]">Tổng quan</span>
              <ChevronRight aria-hidden="true" className="size-3 text-[#6e7a76]" />
              <span className="font-semibold text-[#1b1c15]">Tái khám</span>
            </nav>

            <div>
              <h1 className="text-2xl font-bold leading-9 tracking-[-0.6px] text-[#1b1c15]">Tái khám</h1>
              <p className="mt-1 text-sm leading-[21px] text-[#3e4946]">
                Theo dõi các ca cần tái khám, nhắc lịch và cập nhật ghi chú chuyên môn.
              </p>
            </div>
          </header>

          <section aria-label="Thống kê tái khám" className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <article
                  className="relative min-h-[165px] overflow-hidden rounded-[12px] border border-[#bdc9c5] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  key={stat.label}
                >
                  <div className="absolute right-px top-px size-24 rounded-bl-full bg-[#fbfaee]" />
                  <div className="relative flex items-start justify-between">
                    <div className={cn("flex size-10 items-center justify-center rounded-[8px]", stat.iconClassName)}>
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    {stat.badge ? (
                      <span className={cn("rounded-full px-2 py-1 text-[11px] font-bold leading-[16px]", stat.badgeClassName)}>
                        {stat.badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="relative pt-4">
                    <p className="text-sm font-medium leading-[21px] text-[#3e4946]">{stat.label}</p>
                    <p className={cn("mt-1 text-[28px] font-bold leading-[42px]", stat.valueClassName)}>{stat.value}</p>
                  </div>
                </article>
              )
            })}
          </section>

          <section className="overflow-hidden rounded-[16px] border border-[#e4e3d7] bg-white shadow-[0_4px_16px_rgba(31,38,31,0.05)]">
            <div className="flex flex-col gap-4 border-b border-[#e4e3d7] bg-[#fbfaee] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative w-full sm:w-[256px]">
                  <span className="sr-only">Tìm lịch tái khám</span>
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-[#6e7a76]"
                  />
                  <input
                    className="h-11 w-full rounded-[8px] border border-[#bdc9c5] bg-[#fbfaee] pl-9 pr-4 text-[13px] leading-5 text-[#1b1c15] outline-none transition placeholder:text-[#6b7280] focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Tìm theo ID, tên thú cưng..."
                    type="search"
                    value={query}
                  />
                </label>

                <button
                  className="inline-flex h-11 w-fit items-center gap-2 rounded-[8px] border border-[#bdc9c5] bg-[#fbfaee] px-3 text-[13px] font-medium text-[#1b1c15] transition hover:border-[#005e53] hover:text-[#005e53]"
                  type="button"
                >
                  <Filter aria-hidden="true" className="size-4" />
                  Lọc
                </button>
              </div>

              <label className="flex w-fit items-center gap-2 text-[13px] font-medium leading-5 text-[#3e4946]">
                Sắp xếp theo:
                <span className="relative">
                  <select
                    className="h-11 appearance-none rounded-[8px] border border-[#bdc9c5] bg-[#fbfaee] pl-3 pr-9 text-[13px] leading-6 text-[#1b1c15] outline-none transition focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
                    defaultValue="latest"
                  >
                    <option value="latest">Ngày gần nhất</option>
                    <option value="oldest">Ngày xa nhất</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#3e4946]"
                  />
                </span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e4e3d7] bg-[#d8f3ee]">
                    <TableHeaderCell className="w-[210px]">Thú cưng</TableHeaderCell>
                    <TableHeaderCell className="w-[160px]">Chủ nuôi</TableHeaderCell>
                    <TableHeaderCell className="w-[220px]">Phiếu khám liên quan</TableHeaderCell>
                    <TableHeaderCell className="w-[150px]">Ngày hẹn</TableHeaderCell>
                    <TableHeaderCell className="min-w-[240px]">Lý do tái khám</TableHeaderCell>
                    <TableHeaderCell className="w-[150px]">Trạng thái</TableHeaderCell>
                    <TableHeaderCell className="w-[130px] text-right">Thao tác</TableHeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {visibleFollowUps.map((followUp) => (
                    <FollowUpTableRow followUp={followUp} key={followUp.followUpId} />
                  ))}
                </tbody>
              </table>
            </div>

            {visibleFollowUps.length === 0 ? (
              <div className="border-t border-[#e4e3d7] bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#1b1c15]">Không tìm thấy lịch tái khám phù hợp</p>
                <p className="mt-1 text-sm text-[#52605c]">Thử đổi từ khóa hoặc kiểm tra lại bộ lọc.</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 border-t border-[#e4e3d7] bg-[#fbfaee] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#3e4946]">
                Hiển thị {startItem}-{endItem} của {filteredFollowUps.length || 0} kết quả
              </p>
              <AppPagination
                ariaLabel="Phân trang danh sách tái khám"
                currentPage={safePage}
                onPageChange={setCurrentPage}
                size="sm"
                totalPages={totalPages}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function FollowUpTableRow({ followUp }: { followUp: FollowUpRow }) {
  const status = statusStyles[followUp.status]
  const DateIcon = status.icon

  return (
    <tr className="border-b border-[#e4e3d7] last:border-b-0">
      <TableBodyCell>
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold", followUp.pet.avatarClassName)}
          >
            {followUp.pet.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-[#1b1c15]">{followUp.pet.name}</p>
            <p className="truncate text-xs leading-4 text-[#3e4946]">
              {followUp.pet.species} - {followUp.pet.breed}
            </p>
          </div>
        </div>
      </TableBodyCell>
      <TableBodyCell>
        <span className="text-sm font-medium text-[#3e4946]">{followUp.ownerName}</span>
      </TableBodyCell>
      <TableBodyCell>
        <span className="text-sm font-semibold text-[#005e53]">{followUp.examId}</span>
      </TableBodyCell>
      <TableBodyCell>
        <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", status.dateClassName)}>
          <DateIcon aria-hidden="true" className="size-4" />
          {followUp.appointmentDate}
        </span>
      </TableBodyCell>
      <TableBodyCell>
        <span className="line-clamp-2 text-sm leading-5 text-[#3e4946]">{followUp.reason}</span>
      </TableBodyCell>
      <TableBodyCell>
        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-4", status.pillClassName)}>
          {status.label}
        </span>
      </TableBodyCell>
      <TableBodyCell className="text-right">
        <button
          aria-label={`Xem lịch tái khám ${followUp.followUpId}`}
          className="inline-flex h-9 items-center justify-center rounded-[12px] border border-[#005e53] bg-white px-4 text-sm font-medium leading-5 text-[#005e53] transition hover:bg-[#d8f3ee]"
          type="button"
        >
          Xem
        </button>
      </TableBodyCell>
    </tr>
  )
}

function TableHeaderCell({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn("px-4 py-4 text-left text-base font-bold uppercase leading-5 tracking-[0.05em] text-[#003d36]", className)}
      scope="col"
      {...props}
    />
  )
}

function TableBodyCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-4 align-middle text-sm leading-5 text-[#3e4946]", className)} {...props} />
}
