import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, Clock, Phone, User, Activity, FileText, Check, Printer, Ban, BadgeAlert } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getMedicalAppointmentStatusLabel, getMedicalAppointmentStatusTone } from "@/features/appointments/constants/medical-appointments"

type Params = { params: { id: string } }

const buildMock = (id: string) => ({
  id,
  status: "pending",
  appointmentInfo: {
    examType: "Tiêm phòng",
    scheduledDate: "20/10/2026",
    scheduledTime: "14:00",
    veterinarian: "Phân công sau",
    handledByStaff: "Hệ thống tiếp nhận",
  },
  petInfo: {
    name: "Milo",
    type: "Mèo",
    breed: "Anh Lông Ngắn",
    age: "1 tuổi",
    weight: "4 kg",
  },
  contactInfo: {
    ownerName: "Nguyễn Văn A",
    phone: "0901234567",
  },
  bookingContent: {
    symptomDescription: "Bé hơi mệt và ăn ít hơn bình thường.",
    internalNote: "", 
    rejectionReason: "",
  },
})

export default function AppointmentDetailPage({ params }: Params) {
  const mockDetail = buildMock(params?.id ?? "APP-1025")

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/owner/appointments">
              <ChevronLeft className="h-5 w-5 text-petcenter-text-secondary" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-petcenter-primary/10 px-3 py-1 text-sm font-medium text-petcenter-primary">
              <FileText className="h-4 w-4" />
              Chi tiết lịch hẹn
            </div>
            <h1 className="text-2xl font-bold text-petcenter-text">Lịch hẹn #{mockDetail.id}</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-11 border-petcenter-border-strong bg-white text-petcenter-text">
            <Printer className="mr-2 h-4 w-4" />
            In lịch hẹn
          </Button>
            <Button variant="destructive" className="h-11">
            <Ban className="mr-2 h-4 w-4" />
            Hủy lịch hẹn
          </Button>
        </div>
      </div>

      <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getMedicalAppointmentStatusTone(mockDetail.status)}`}>
        <span className="h-2 w-2 rounded-full bg-current" />
        {getMedicalAppointmentStatusLabel(mockDetail.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-petcenter-border bg-white shadow-sm">
            <CardHeader className="border-b bg-gray-50/60 pb-4">
              <CardTitle className="text-lg text-petcenter-text">Thông tin lịch hẹn</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Loại khám</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.appointmentInfo.examType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Ngày khám</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.appointmentInfo.scheduledDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Giờ khám</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.appointmentInfo.scheduledTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Bác sĩ phụ trách</p>
                  <p className="font-medium text-petcenter-text italic text-petcenter-text-muted">{mockDetail.appointmentInfo.veterinarian}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <BadgeAlert className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Nhân viên tiếp nhận</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.appointmentInfo.handledByStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-petcenter-border bg-white shadow-sm">
            <CardHeader className="border-b bg-gray-50/60 pb-4">
              <CardTitle className="text-lg text-petcenter-text">Thông tin thú cưng</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col sm:flex-row gap-6">
              <Avatar className="w-20 h-20 border-2 border-white shadow-sm ring-1 ring-gray-100">
                <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">{mockDetail.petInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 flex-1">
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Tên thú cưng</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.petInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Phân loại</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.petInfo.type} - {mockDetail.petInfo.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Độ tuổi</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.petInfo.age}</p>
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Cân nặng</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.petInfo.weight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-petcenter-border bg-white shadow-sm">
            <CardHeader className="border-b bg-gray-50/60 pb-4">
              <CardTitle className="text-lg text-petcenter-text">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-petcenter-text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-0.5">Người đặt lịch</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.contactInfo.ownerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-petcenter-text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-0.5">Số điện thoại</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.contactInfo.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-petcenter-border bg-white shadow-sm">
            <CardHeader className="border-b bg-gray-50/60 pb-4">
              <CardTitle className="text-lg text-petcenter-text flex items-center gap-2">
                <FileText className="w-5 h-5 text-petcenter-primary" />
                Triệu chứng & ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-petcenter-text-muted">symptom_description</p>
                  <p className="mt-2 text-sm leading-relaxed text-petcenter-text-secondary">{mockDetail.bookingContent.symptomDescription}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-petcenter-text-muted">internal_note</p>
                  <p className="mt-2 text-sm leading-relaxed text-petcenter-text-secondary">{mockDetail.bookingContent.internalNote || "Chưa có"}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-red-500">rejection_reason</p>
                  <p className="mt-2 text-sm leading-relaxed text-red-700">{mockDetail.bookingContent.rejectionReason || "Không áp dụng"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-petcenter-border bg-white shadow-sm">
            <CardHeader className="border-b bg-gray-50/60 pb-4">
              <CardTitle className="text-lg text-petcenter-text">Trạng thái xử lý</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-8">
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                <div className="relative pl-6">
                  <div className="absolute w-6 h-6 bg-petcenter-success-text rounded-full -left-[13px] top-0 shadow-sm flex items-center justify-center ring-4 ring-white">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="font-medium text-petcenter-text -mt-0.5">Đã tạo lịch</h4>
                  <p className="text-xs text-petcenter-text-muted mt-1">15/05/2026 - 08:30</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute w-6 h-6 bg-white border-2 border-petcenter-warning-text rounded-full -left-[13px] top-0 shadow-sm flex items-center justify-center ring-4 ring-white">
                    <div className="w-2.5 h-2.5 bg-petcenter-warning-text rounded-full" />
                  </div>
                  <h4 className="font-medium text-petcenter-warning-text -mt-0.5">Chờ trung tâm xác nhận</h4>
                </div>

                <div className="relative pl-6">
                  <div className="absolute w-4 h-4 bg-gray-200 rounded-full -left-[9px] top-1 ring-4 ring-white"></div>
                  <h4 className="font-medium text-petcenter-text-muted">Đã xác nhận</h4>
                </div>

                <div className="relative pl-6">
                  <div className="absolute w-4 h-4 bg-gray-200 rounded-full -left-[9px] top-1 ring-4 ring-white"></div>
                  <h4 className="font-medium text-petcenter-text-muted">Đã từ chối / Đã hủy</h4>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 mt-6">
            <Button variant="destructive" className="w-full h-11">
              Hủy lịch hẹn
            </Button>
            <Button variant="outline" className="w-full h-11 border-petcenter-border-strong bg-white text-petcenter-text-secondary" asChild>
              <Link href="/owner/appointments">Quay lại danh sách</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
