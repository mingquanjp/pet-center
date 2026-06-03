"use client"

import { useMemo, useState } from "react"
import {
  CalendarDays,
  ClipboardList,
  CircleAlert,
  Eye,
  FileDown,
  RotateCcw,
  FlaskConical,
  Pill,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react"

import { AppPagination } from "@/components/ui/app-pagination"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type PrescriptionStatus = "prescribed"

type PrescriptionRow = {
  prescriptionId: string
  examId: string
  doctorName: string
  pet: {
    name: string
    species: string
    breed: string
    ageLabel: string
    accentClassName: string
  }
  ownerName: string
  ownerPhone: string
  prescribedDate: string
  medicineCount: number
  status: PrescriptionStatus
  diagnosis: string
  medicines: PrescriptionMedicine[]
  instructionNote: string
  followUp: {
    date: string
    reason: string
  } | null
}

type PrescriptionMedicine = {
  medicineName: string
  quantity: string
  dosage: string
  frequency: string
  duration: string
  instruction: string
}

const pageSize = 3

const prescriptions: PrescriptionRow[] = [
  {
    prescriptionId: "DT-2024-001",
    examId: "PK-2024-001",
    doctorName: "BS. Nguyễn Văn A",
    pet: {
      name: "Lucky",
      species: "Chó",
      breed: "Golden",
      ageLabel: "2 tuổi",
      accentClassName: "bg-[#fff3d8] text-[#b45309]",
    },
    ownerName: "Nguyễn Văn A",
    ownerPhone: "0901234567",
    prescribedDate: "24/10/2024",
    medicineCount: 2,
    status: "prescribed",
    diagnosis: "Viêm da tiết bã - Da vùng bụng hơi đỏ, cần theo dõi thêm",
    medicines: [
      {
        medicineName: "Ketoconazole",
        quantity: "10 viên",
        dosage: "1 viên/lần",
        frequency: "Ngày 2 lần",
        duration: "7 ngày",
        instruction: "Sau ăn 30p",
      },
      {
        medicineName: "Dung dịch vệ sinh da",
        quantity: "1 chai",
        dosage: "Dùng ngoài",
        frequency: "Ngày 1 lần",
        duration: "7 ngày",
        instruction: "Thoa mỏng vùng đỏ",
      },
    ],
    instructionNote:
      "Cho thú cưng dùng thuốc đúng liều lượng và thời gian chỉ định. Theo dõi các dấu hiệu bất thường như nôn mửa hoặc dị ứng da.",
    followUp: {
      date: "31/10/2024",
      reason: "Kiểm tra lại tình trạng da",
    },
  },
  {
    prescriptionId: "DT-2024-002",
    examId: "PK-2024-012",
    doctorName: "BS. Nguyễn Văn A",
    pet: {
      name: "Mimi",
      species: "Mèo",
      breed: "Anh lông ngắn",
      ageLabel: "1 tuổi",
      accentClassName: "bg-[#e0f2fe] text-[#0369a1]",
    },
    ownerName: "Trần Thị B",
    ownerPhone: "0912345678",
    prescribedDate: "24/10/2024",
    medicineCount: 4,
    status: "prescribed",
    diagnosis: "Viêm đường hô hấp nhẹ, cần dùng thuốc đúng lịch và giữ ấm.",
    medicines: [
      {
        medicineName: "Amoxicillin",
        quantity: "14 viên",
        dosage: "1 viên/lần",
        frequency: "Ngày 2 lần",
        duration: "7 ngày",
        instruction: "Sau ăn",
      },
      {
        medicineName: "Bromhexin",
        quantity: "1 lọ",
        dosage: "2ml/lần",
        frequency: "Ngày 2 lần",
        duration: "5 ngày",
        instruction: "Lắc đều trước khi dùng",
      },
    ],
    instructionNote: "Theo dõi ho, hắt hơi và tình trạng ăn uống. Tái khám nếu triệu chứng không giảm.",
    followUp: null,
  },
  {
    prescriptionId: "DT-2024-003",
    examId: "PK-2024-018",
    doctorName: "BS. Nguyễn Văn A",
    pet: {
      name: "Bull",
      species: "Chó",
      breed: "Pug",
      ageLabel: "3 tuổi",
      accentClassName: "bg-[#e4e3d7] text-[#3e4946]",
    },
    ownerName: "Lê Văn C",
    ownerPhone: "0987654321",
    prescribedDate: "23/10/2024",
    medicineCount: 1,
    status: "prescribed",
    diagnosis: "Rối loạn tiêu hóa nhẹ sau thay đổi khẩu phần ăn.",
    medicines: [
      {
        medicineName: "Men tiêu hóa",
        quantity: "10 gói",
        dosage: "1 gói/lần",
        frequency: "Ngày 2 lần",
        duration: "5 ngày",
        instruction: "Pha với thức ăn",
      },
    ],
    instructionNote: "Chia nhỏ bữa ăn, bổ sung nước và theo dõi phân trong 48 giờ.",
    followUp: null,
  },
  {
    prescriptionId: "DT-2024-004",
    examId: "PK-2024-024",
    doctorName: "BS. Nguyễn Văn A",
    pet: {
      name: "Bông",
      species: "Mèo",
      breed: "Ba Tư",
      ageLabel: "4 tuổi",
      accentClassName: "bg-[#d8f3ee] text-[#005e53]",
    },
    ownerName: "Phạm Minh D",
    ownerPhone: "0977001122",
    prescribedDate: "22/10/2024",
    medicineCount: 3,
    status: "prescribed",
    diagnosis: "Kích ứng mắt nhẹ do bụi, không ghi nhận tổn thương giác mạc.",
    medicines: [
      {
        medicineName: "Nước muối sinh lý",
        quantity: "1 chai",
        dosage: "2 giọt/lần",
        frequency: "Ngày 3 lần",
        duration: "5 ngày",
        instruction: "Nhỏ mắt",
      },
      {
        medicineName: "Vitamin tổng hợp",
        quantity: "10 viên",
        dosage: "1 viên/lần",
        frequency: "Ngày 1 lần",
        duration: "10 ngày",
        instruction: "Sau ăn",
      },
    ],
    instructionNote: "Vệ sinh mắt nhẹ nhàng, tránh để thú cưng dụi mắt trong thời gian dùng thuốc.",
    followUp: {
      date: "29/10/2024",
      reason: "Kiểm tra lại mắt",
    },
  },
]

const statusLabels: Record<PrescriptionStatus, string> = {
  prescribed: "Đã kê",
}

const stats = [
  {
    label: "Đơn thuốc đã kê",
    value: "18",
    icon: ClipboardList,
    iconClassName: "bg-[#d8f3ee] text-[#005e53]",
  },
  {
    label: "Đơn thuốc trong hôm nay",
    value: "04",
    icon: CalendarDays,
    iconClassName: "bg-[#fff3d8] text-[#b45309]",
  },
  {
    label: "Có tái khám",
    value: "06",
    icon: Stethoscope,
    iconClassName: "bg-[#e0f2fe] text-[#0369a1]",
  },
]

const parseVietnameseDate = (date: string) => {
  const [day, month, year] = date.split("/").map(Number)

  return new Date(year, month - 1, day).getTime()
}

export function DoctorPrescriptionsPage() {
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRow | null>(null)

  const filteredPrescriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return prescriptions
      .filter((prescription) => {
        if (!normalizedQuery) return true

        return [
          prescription.prescriptionId,
          prescription.examId,
          prescription.pet.name,
          prescription.pet.species,
          prescription.pet.breed,
          prescription.ownerName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((current, next) => parseVietnameseDate(next.prescribedDate) - parseVietnameseDate(current.prescribedDate))
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filteredPrescriptions.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const visiblePrescriptions = filteredPrescriptions.slice(startIndex, startIndex + pageSize)
  const startItem = filteredPrescriptions.length === 0 ? 0 : startIndex + 1
  const endItem = Math.min(startIndex + pageSize, filteredPrescriptions.length)

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[30px] font-bold leading-9 tracking-[0] text-[#1b1c15]">
              Đơn thuốc
            </h1>
            <p className="mt-1 max-w-[672px] text-sm leading-5 text-[#3e4946]">
              Xem lại các đơn thuốc đã kê và hướng dẫn sử dụng thuốc cho từng phiếu khám trong hệ thống.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Thống kê đơn thuốc" className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <article
              className="flex h-[110px] items-center gap-5 rounded-[16px] border border-[#e4e3d7] bg-white p-[25px] shadow-[0_4px_8px_rgba(31,38,31,0.05)]"
              key={stat.label}
            >
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-full",
                  stat.iconClassName
                )}
              >
                <Icon aria-hidden="true" className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-5 text-[#3e4946]">{stat.label}</p>
                <p className="mt-1 text-[30px] font-bold leading-9 text-[#1b1c15]">{stat.value}</p>
              </div>
            </article>
          )
        })}
      </section>

      <section className="rounded-[16px] border border-[#e4e3d7] bg-[#fbfaee] p-4 shadow-[0_4px_8px_rgba(31,38,31,0.05)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7a76]" />
            <input
              value={query}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Tìm theo mã đơn, tên thú cưng..."
              type="search"
              className="h-11 w-full rounded-full border border-[rgba(189,201,197,0.4)] bg-white pl-11 pr-4 text-sm text-[#1b1c15] outline-none transition placeholder:text-[#6b7280] focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-[#bdc9c5] bg-white px-4 font-medium text-[#3e4946] hover:bg-[#e9e9dd] xl:ml-auto"
            onClick={() => setQuery("")}
          >
            <RotateCcw aria-hidden="true" className="mr-2 size-4" />
            Đặt lại
          </Button>
        </div>
      </section>

          <section className="overflow-hidden rounded-[16px] border border-[#e4e3d7] bg-white shadow-[0_4px_16px_rgba(31,38,31,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e4e3d7] bg-[#d8f3ee]">
                    <TableHeaderCell className="w-[160px]">Mã đơn</TableHeaderCell>
                    <TableHeaderCell className="w-[150px]">Phiếu khám</TableHeaderCell>
                    <TableHeaderCell className="w-[220px]">Thú cưng</TableHeaderCell>
                    <TableHeaderCell className="w-[165px]">Chủ nuôi</TableHeaderCell>
                    <TableHeaderCell className="w-[140px]">Ngày kê</TableHeaderCell>
                    <TableHeaderCell className="w-[120px] text-center">Số thuốc</TableHeaderCell>
                    <TableHeaderCell className="w-[120px] text-right">Thao tác</TableHeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {visiblePrescriptions.map((prescription) => (
                    <tr className="border-b border-[#e4e3d7] last:border-b-0" key={prescription.prescriptionId}>
                      <TableBodyCell>
                        <span className="font-medium text-[#005e53]">{prescription.prescriptionId}</span>
                      </TableBodyCell>
                      <TableBodyCell>{prescription.examId}</TableBodyCell>
                      <TableBodyCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              prescription.pet.accentClassName
                            )}
                            aria-hidden="true"
                          >
                            {prescription.pet.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#1b1c15]">{prescription.pet.name}</p>
                            <p className="truncate text-xs leading-4 text-[#6e7a76]">
                              {prescription.pet.species} • {prescription.pet.breed}
                            </p>
                          </div>
                        </div>
                      </TableBodyCell>
                      <TableBodyCell>{prescription.ownerName}</TableBodyCell>
                      <TableBodyCell>{prescription.prescribedDate}</TableBodyCell>
                      <TableBodyCell className="text-center font-medium text-[#1b1c15]">
                        {prescription.medicineCount}
                      </TableBodyCell>
                      <TableBodyCell className="text-right">
                        <button
                          aria-label={`Xem đơn thuốc ${prescription.prescriptionId}`}
                          className="inline-flex size-8 items-center justify-center rounded-[12px] text-[#005e53] transition hover:bg-[#d8f3ee]"
                          onClick={() => setSelectedPrescription(prescription)}
                          type="button"
                        >
                          <Eye aria-hidden="true" className="size-[18px]" />
                        </button>
                      </TableBodyCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visiblePrescriptions.length === 0 ? (
              <div className="border-t border-[#e4e3d7] bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#1b1c15]">Không tìm thấy đơn thuốc phù hợp</p>
                <p className="mt-1 text-sm text-[#52605c]">Thử đổi từ khóa hoặc đặt lại bộ lọc.</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 border-t border-[#e4e3d7] bg-[#fbfaee] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-4 text-[#3e4946]">
                Hiển thị {startItem} đến {endItem} của {filteredPrescriptions.length || 0} kết quả
              </p>
              <AppPagination
                ariaLabel="Phân trang danh sách đơn thuốc"
                currentPage={safePage}
                onPageChange={setCurrentPage}
                totalPages={totalPages}
                size="sm"
              />
            </div>
          </section>

      <PrescriptionDetailDialog
        onOpenChange={(open) => {
          if (!open) setSelectedPrescription(null)
        }}
        prescription={selectedPrescription}
      />
    </div>
  )
}

function PrescriptionDetailDialog({
  onOpenChange,
  prescription,
}: {
  onOpenChange: (open: boolean) => void
  prescription: PrescriptionRow | null
}) {
  return (
    <Dialog open={Boolean(prescription)} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[900px] sm:max-w-[900px] flex-col gap-0 overflow-hidden rounded-[16px] border-0 bg-white p-0 text-[#1b1c15] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-0"
        showCloseButton={false}
      >
        {prescription ? (
          <>
            <header className="flex shrink-0 items-center justify-between border-b border-[#bdc9c5] bg-[#fbfaee] px-6 py-4">
              <div>
                <DialogTitle className="text-xl font-bold leading-7 text-[#1b1c15]">
                  Chi tiết đơn thuốc
                </DialogTitle>
                <p className="mt-0.5 text-sm font-medium leading-5 text-[#3e4946]">{prescription.examId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-[#dff3e3] px-3 py-1 text-xs font-semibold leading-4 text-[#2e7d32]">
                  {statusLabels[prescription.status]}
                </span>
                <DialogClose asChild>
                  <button
                    aria-label="Đóng chi tiết đơn thuốc"
                    className="inline-flex size-8 items-center justify-center rounded-full text-[#3e4946] transition hover:bg-[#e9e9dd]"
                    type="button"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </DialogClose>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-8">
                <section aria-label="Thông tin đơn thuốc" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <PrescriptionMeta label="PHIẾU KHÁM" value={prescription.examId} />
                  <PrescriptionMeta label="NGÀY KÊ" value={prescription.prescribedDate} />
                  <PrescriptionMeta label="BÁC SĨ KÊ" value={prescription.doctorName} />
                  <PrescriptionMeta label="SỐ THUỐC" value={`${prescription.medicineCount} loại`} />
                </section>

                <section aria-label="Thú cưng và chủ nuôi" className="grid gap-4 md:grid-cols-2">
                  <InfoCard
                    avatarClassName="bg-[rgba(0,121,107,0.2)] text-[#00796b]"
                    avatarLabel={prescription.pet.name.charAt(0)}
                    subtitle={`${prescription.pet.species} ${prescription.pet.breed} • ${prescription.pet.ageLabel}`}
                    title={prescription.pet.name}
                  />
                  <InfoCard
                    avatarClassName="bg-[rgba(254,166,25,0.2)] text-[#b45309]"
                    icon={<UserRound aria-hidden="true" className="size-4" />}
                    subtitle={`SĐT: ${prescription.ownerPhone}`}
                    title={prescription.ownerName}
                  />
                </section>

                <section className="flex flex-col gap-2">
                  <SectionHeading icon={<FlaskConical aria-hidden="true" className="size-[15px]" />}>
                    Chẩn đoán
                  </SectionHeading>
                  <div className="rounded-[16px] border border-[rgba(189,201,197,0.3)] bg-[#fbfaee] p-[13px] text-sm leading-5 text-[#3e4946]">
                    {prescription.diagnosis}
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<Pill aria-hidden="true" className="size-[15px]" />}>
                    Danh sách thuốc
                  </SectionHeading>
                  <div className="overflow-hidden rounded-[24px] border border-[rgba(189,201,197,0.5)]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[820px] border-collapse">
                        <thead>
                          <tr className="bg-[#e9e9dd]">
                            <MedicineHeaderCell className="w-[205px]">Tên thuốc</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[106px]">S.Lượng</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[128px]">Liều dùng</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[122px]">Tần suất</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[113px]">Thời gian</MedicineHeaderCell>
                            <MedicineHeaderCell className="w-[174px]">Hướng dẫn</MedicineHeaderCell>
                          </tr>
                        </thead>
                        <tbody>
                          {prescription.medicines.map((medicine) => (
                            <tr
                              className="border-t border-[rgba(189,201,197,0.3)] first:border-t-0"
                              key={`${prescription.prescriptionId}-${medicine.medicineName}`}
                            >
                              <MedicineBodyCell className="font-medium text-[#1b1c15]">
                                {medicine.medicineName}
                              </MedicineBodyCell>
                              <MedicineBodyCell>{medicine.quantity}</MedicineBodyCell>
                              <MedicineBodyCell>{medicine.dosage}</MedicineBodyCell>
                              <MedicineBodyCell>{medicine.frequency}</MedicineBodyCell>
                              <MedicineBodyCell>{medicine.duration}</MedicineBodyCell>
                              <MedicineBodyCell className="text-xs leading-4 text-[#3e4946]">
                                {medicine.instruction}
                              </MedicineBodyCell>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] border border-[rgba(255,185,95,0.2)] bg-[rgba(255,221,184,0.1)] p-[17px]">
                  <SectionHeading
                    className="text-[#855300]"
                    icon={<CircleAlert aria-hidden="true" className="size-[14px]" />}
                  >
                    Ghi chú hướng dẫn
                  </SectionHeading>
                  <p className="mt-1 text-sm leading-5 text-[#684000]">{prescription.instructionNote}</p>
                </section>

                {prescription.followUp ? (
                  <section className="flex items-start gap-4 rounded-[24px] border border-[rgba(0,121,107,0.2)] bg-[rgba(0,121,107,0.05)] p-[17px]">
                    <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#00796b]" />
                    <div>
                      <p className="text-sm font-bold leading-5 text-[#1b1c15]">
                        Có chỉ định tái khám:{" "}
                        <span className="text-[#00796b]">{prescription.followUp.date}</span>
                      </p>
                      <p className="text-sm leading-5 text-[#3e4946]">{prescription.followUp.reason}</p>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>

            <footer className="flex shrink-0 justify-end gap-3 border-t border-[#bdc9c5] bg-[#fbfaee] px-6 py-4">
              <DialogClose asChild>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#bdc9c5] bg-white px-6 text-sm font-semibold text-[#1b1c15] transition hover:bg-[#f5f4e8]"
                  type="button"
                >
                  Đóng
                </button>
              </DialogClose>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#005e53] px-6 text-sm font-semibold text-white transition hover:bg-[#004f47]"
                type="button"
              >
                <FileDown aria-hidden="true" className="size-4" />
                Xuất đơn thuốc
              </button>
            </footer>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function PrescriptionMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#3e4946]">{label}</p>
      <p className="mt-1 truncate text-sm font-medium leading-5 text-[#1b1c15]">{value}</p>
    </div>
  )
}

function InfoCard({
  avatarClassName,
  avatarLabel,
  icon,
  subtitle,
  title,
}: {
  avatarClassName: string
  avatarLabel?: string
  icon?: React.ReactNode
  subtitle: string
  title: string
}) {
  return (
    <article className="flex h-[82px] items-center gap-4 rounded-[12px] border border-[rgba(189,201,197,0.3)] bg-[#f5f4e8] p-[17px]">
      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full font-bold", avatarClassName)}>
        {icon ?? avatarLabel}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-5 text-[#1b1c15]">{title}</p>
        <p className="truncate text-xs leading-4 text-[#3e4946]">{subtitle}</p>
      </div>
    </article>
  )
}

function SectionHeading({
  children,
  className,
  icon,
}: {
  children: React.ReactNode
  className?: string
  icon: React.ReactNode
}) {
  return (
    <h3 className={cn("flex items-center gap-2 text-sm font-bold leading-5 text-[#1b1c15]", className)}>
      <span className="text-[#00796b]">{icon}</span>
      {children}
    </h3>
  )
}

function MedicineHeaderCell({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("px-4 py-3 text-left text-sm font-bold leading-5 text-[#3e4946]", className)} scope="col" {...props} />
}

function MedicineBodyCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 text-sm leading-5 text-[#1b1c15]", className)} {...props} />
}

function TableHeaderCell({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn("px-6 py-4 text-left text-base font-bold leading-5 text-[#003d36]", className)}
      scope="col"
      {...props}
    />
  )
}

function TableBodyCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-6 py-5 text-base leading-6 text-[#3e4946]", className)} {...props} />
}
