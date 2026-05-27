"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Clock, ChevronLeft, ChevronRight, Plus, Filter, Sparkles, PawPrint } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getMedicalAppointmentStatusLabel, getMedicalAppointmentStatusTone, medicalAppointmentExamTypes } from "@/features/appointments/constants/medical-appointments"

const appointmentStats = [
  { label: "Tổng lịch", value: "12", tone: "bg-petcenter-primary/10 text-petcenter-primary" },
  { label: "Chờ thanh toán", value: "1", tone: "bg-amber-100 text-amber-700" },
  { label: "Chờ xác nhận", value: "4", tone: "bg-petcenter-warning-bg text-petcenter-warning-text" },
  { label: "Đã xác nhận", value: "6", tone: "bg-petcenter-success-bg text-petcenter-success-text" },
]

const mockAppointments = [
  { id: "APP-1024", petName: "Lucky", petType: "Chó", examType: "Khám tổng quát", scheduledAt: "15/10/2026 - 09:00", status: "confirmed" },
  { id: "APP-1025", petName: "Milo", petType: "Mèo", examType: "Tiêm phòng", scheduledAt: "20/10/2026 - 14:00", status: "pending" },
  { id: "APP-1026", petName: "Bé Bông", petType: "Chó", examType: "Xét nghiệm", scheduledAt: "25/10/2026 - 10:30", status: "pending_payment" },
  { id: "APP-1027", petName: "Mimi", petType: "Mèo", examType: "Tái khám", scheduledAt: "28/10/2026 - 08:30", status: "confirmed" },
  { id: "APP-1028", petName: "Lucky", petType: "Chó", examType: "Khám tổng quát", scheduledAt: "02/11/2026 - 15:00", status: "rejected" },
  { id: "APP-1029", petName: "Milo", petType: "Mèo", examType: "Xét nghiệm", scheduledAt: "05/11/2026 - 09:30", status: "cancelled" },
]
export default function AppointmentsPage() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 animate-in fade-in duration-500">
      <Card className="overflow-hidden border-petcenter-border bg-gradient-to-r from-[#fcfbf5] via-white to-[#f8fbf8] shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-petcenter-primary/10 px-3 py-1 text-sm font-medium text-petcenter-primary">
              <Sparkles className="h-4 w-4" />
              Quản lý lịch hẹn
            </div>
            <div>
              <h1 className="text-3xl font-bold text-petcenter-text">Lịch hẹn của tôi</h1>
              <p className="mt-1 text-petcenter-text-secondary">Theo dõi, lọc và mở nhanh chi tiết các lịch khám của thú cưng.</p>
            </div>
          </div>

          <Button className="h-11 bg-petcenter-cta text-white hover:bg-petcenter-cta-hover" asChild>
            <Link href="/owner/appointments/create">
              <Plus className="mr-2 h-4 w-4" />
              Tạo lịch hẹn
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {appointmentStats.map((item) => (
          <Card key={item.label} className="border-petcenter-border bg-white shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-petcenter-text-secondary">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-petcenter-text">{item.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${item.tone}`}>
                <PawPrint className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-petcenter-border bg-white shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
            <Input placeholder="Tìm kiếm theo mã, loại khám, thú cưng..." className="h-11 border-gray-200 bg-gray-50/70 pl-9" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
            <Select defaultValue="all">
              <SelectTrigger className="h-11 w-full border-gray-200 bg-white sm:w-[180px]">
                <SelectValue placeholder="Thú cưng" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" sideOffset={4} className="w-[var(--radix-select-trigger-width)] bg-white">
                <SelectItem value="all">Thú cưng: Tất cả</SelectItem>
                <SelectItem value="lucky">Lucky</SelectItem>
                <SelectItem value="milo">Milo</SelectItem>
                <SelectItem value="bebong">Bé Bông</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="h-11 w-full border-gray-200 bg-white sm:w-[180px]">
                <SelectValue placeholder="Trạng thái lịch hẹn" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" sideOffset={4} className="w-[var(--radix-select-trigger-width)] bg-white">
                <SelectItem value="all">Trạng thái: Tất cả</SelectItem>
                <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="h-11 w-full border-gray-200 bg-white sm:w-[180px]">
                <SelectValue placeholder="Loại khám" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" sideOffset={4} className="w-[var(--radix-select-trigger-width)] bg-white">
                <SelectItem value="all">Loại khám: Tất cả</SelectItem>
                {medicalAppointmentExamTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-11 border-gray-200 bg-white text-petcenter-text sm:w-[150px]">
              <Filter className="mr-2 h-4 w-4 text-petcenter-text-muted" />
              Bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockAppointments.map((app) => (
          <Card key={app.id} className="group overflow-hidden border-petcenter-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                    <AvatarFallback className="bg-orange-100 text-lg font-bold text-orange-600">{app.petName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-petcenter-text">{app.petName}</h3>
                    <p className="text-xs text-petcenter-text-muted">{app.petType} • Mã lịch hẹn {app.id}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${getMedicalAppointmentStatusTone(app.status)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {getMedicalAppointmentStatusLabel(app.status)}
                </span>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-petcenter-primary">{app.examType}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3 text-xs text-petcenter-text-secondary">
                    <Calendar className="h-3.5 w-3.5 text-petcenter-text-muted" />
                    <span>{app.scheduledAt.split(" - ")[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3 text-xs text-petcenter-text-secondary">
                    <Clock className="h-3.5 w-3.5 text-petcenter-text-muted" />
                    <span>{app.scheduledAt.split(" - ")[1]}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 border-t bg-transparent px-6 py-4">
              <Button asChild className="h-10 flex-1 bg-petcenter-primary text-white hover:bg-petcenter-primary-hover">
                <Link href={`/owner/appointments/${app.id}`}>Xem chi tiết</Link>
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 border-gray-200 bg-white text-petcenter-text-secondary hover:bg-gray-50" asChild>
                <Link href={`/owner/appointments/${app.id}`}>
                  <Calendar className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button variant="outline" size="icon" className="h-9 w-9 border-none text-petcenter-text-muted hover:text-petcenter-text" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="h-9 w-9 border-petcenter-primary bg-petcenter-primary/5 font-medium text-petcenter-primary hover:bg-petcenter-primary/10">
          1
        </Button>
        <Button variant="ghost" className="h-9 w-9 text-petcenter-text-secondary hover:text-petcenter-text">
          2
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9 border-none text-petcenter-text-secondary hover:text-petcenter-text">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
