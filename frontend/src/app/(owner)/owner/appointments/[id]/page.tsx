import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, Clock, Phone, User, Activity, FileText, Check } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Params = { params: { id: string } }

const buildMock = (id: string) => ({
  id,
  status: "Chờ xác nhận",
  appointmentInfo: {
    service: "Tiêm phòng định kỳ",
    date: "20/10/2026",
    time: "14:00",
    location: "Phòng khám ABC",
    doctor: "Phân công sau",
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
    note: "Bé hơi nhát người lạ",
  },
})

export default function AppointmentDetailPage({ params }: Params) {
  const mockDetail = buildMock(params?.id ?? "APP-1025")

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/owner/appointments">
              <ChevronLeft className="w-5 h-5 text-petcenter-text-secondary" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-petcenter-text">Chi tiết lịch hẹn #{mockDetail.id}</h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-petcenter-warning-bg text-petcenter-warning-text flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-petcenter-warning-text" />
              {mockDetail.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg text-petcenter-text">Thông tin lịch hẹn</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Dịch vụ</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.appointmentInfo.service}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Ngày khám</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.appointmentInfo.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Giờ khám</p>
                  <p className="font-medium text-petcenter-text">{mockDetail.appointmentInfo.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-petcenter-primary" />
                </div>
                <div>
                  <p className="text-sm text-petcenter-text-secondary mb-1">Bác sĩ phụ trách</p>
                  <p className="font-medium text-petcenter-text italic text-petcenter-text-muted">{mockDetail.appointmentInfo.doctor}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-4 border-b">
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

          <Card className="bg-white">
            <CardHeader className="pb-4 border-b">
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
          <Card className="bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg text-petcenter-text flex items-center gap-2">
                <FileText className="w-5 h-5 text-petcenter-primary" />
                Ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-petcenter-text-secondary text-sm leading-relaxed p-4 bg-gray-50 rounded-lg">
                {mockDetail.bookingContent.note}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-4 border-b">
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
                  <h4 className="font-medium text-petcenter-text-muted">Hoàn tất khám</h4>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 mt-6">
            <Button variant="outline" className="w-full bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-11">
              Hủy lịch hẹn
            </Button>
            <Button variant="ghost" className="w-full h-11 text-petcenter-text-secondary" asChild>
              <Link href="/owner/appointments">Quay lại danh sách</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
