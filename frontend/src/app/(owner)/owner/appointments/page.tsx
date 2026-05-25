"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Clock, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AppointmentsPage() {
  const mockAppointments = [
    { id: "APP-1024", petName: "Lucky", petType: "Chó", service: "Khám sức khỏe định kỳ", date: "15/10/2026", time: "09:00 SA", status: "Đã xác nhận", statusColor: "bg-petcenter-success-bg text-petcenter-success-text" },
    { id: "APP-1025", petName: "Milo", petType: "Mèo", service: "Tiêm phòng định kỳ", date: "20/10/2026", time: "14:00", status: "Chờ xác nhận", statusColor: "bg-petcenter-warning-bg text-petcenter-warning-text" },
    { id: "APP-1026", petName: "Bé Bông", petType: "Chó", service: "Xét nghiệm", date: "25/10/2026", time: "10:30", status: "Chờ xác nhận", statusColor: "bg-petcenter-warning-bg text-petcenter-warning-text" },
    { id: "APP-1027", petName: "Mimi", petType: "Mèo", service: "Khám định kỳ", date: "28/10/2026", time: "08:30", status: "Đã xác nhận", statusColor: "bg-petcenter-success-bg text-petcenter-success-text" },
    { id: "APP-1028", petName: "Lucky", petType: "Chó", service: "Khám tổng quát", date: "02/11/2026", time: "15:00", status: "Chờ xác nhận", statusColor: "bg-petcenter-warning-bg text-petcenter-warning-text" },
    { id: "APP-1029", petName: "Milo", petType: "Mèo", service: "Xét nghiệm máu", date: "05/11/2026", time: "09:30", status: "Đã xác nhận", statusColor: "bg-petcenter-success-bg text-petcenter-success-text" },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-petcenter-text">Lịch hẹn của tôi</h1>
          <p className="text-petcenter-text-secondary mt-1">Theo dõi và quản lý các lịch khám của thú cưng.</p>
        </div>
        <Button className="bg-petcenter-cta hover:bg-petcenter-cta-hover text-white flex-shrink-0 min-w-fit h-11" asChild>
          <Link href="/owner/appointments/create">
            <Plus className="w-4 h-4 mr-2" />
            Tạo lịch hẹn
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border-petcenter-border shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-petcenter-text-muted w-4 h-4" />
            <Input 
              placeholder="Tìm kiếm theo mã, dịch vụ..." 
              className="pl-9 h-10 bg-gray-50/50 border-gray-200"
            />
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-10 bg-white border-gray-200">
              <SelectValue placeholder="Thú cưng: Tất cả" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4} className="w-[var(--radix-select-trigger-width)] bg-white">
              <SelectItem value="all">Thú cưng: Tất cả</SelectItem>
              <SelectItem value="lucky">Lucky</SelectItem>
              <SelectItem value="milo">Milo</SelectItem>
              <SelectItem value="bebong">Bé Bông</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-10 bg-white border-gray-200">
              <SelectValue placeholder="Trạng thái: Tất cả" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4} className="w-[var(--radix-select-trigger-width)] bg-white">
              <SelectItem value="all">Trạng thái: Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xác nhận</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-10 bg-white border-gray-200 text-petcenter-text">
            <Calendar className="w-4 h-4 mr-2 text-petcenter-text-muted" />
            Thời gian
          </Button>
        </CardContent>
      </Card>

      {/* Appointment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAppointments.map((app) => (
          <Card key={app.id} className="bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden relative">
            {/* Status badge */}
            <div className="absolute top-0 right-0 p-3 flex gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium flex items-center gap-1.5 ${app.statusColor}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Đã xác nhận' ? 'bg-petcenter-success-text' : 'bg-petcenter-warning-text'}`} />
                {app.status}
              </span>
            </div>

            <CardContent className="p-6 pt-7 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                  <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">{app.petName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-petcenter-text">{app.petName}</h3>
                  <p className="text-xs text-petcenter-text-muted">Mã: {app.id}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-petcenter-primary mb-3 text-sm">{app.service}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs text-petcenter-text-secondary bg-gray-50 p-2 rounded-md">
                    <Calendar className="w-3.5 h-3.5 text-petcenter-text-muted" />
                    <span>{app.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-petcenter-text-secondary bg-gray-50 p-2 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-petcenter-text-muted" />
                    <span>{app.time}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2 border-t mt-4 mb-2 bg-transparent justify-start">
              <Button asChild className="flex-1 bg-petcenter-primary hover:bg-petcenter-primary-hover text-white h-10 shadow-sm">
                <Link href={`/owner/appointments/${app.id}`}>
                  Xem chi tiết
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 border-gray-200 bg-white hover:bg-gray-50 shrink-0 text-petcenter-text-secondary" asChild>
                <Link href={`/owner/appointments/${app.id}`}>
                   <Calendar className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-1 mt-4">
        <Button variant="outline" size="icon" className="w-9 h-9 border-none text-petcenter-text-muted hover:text-petcenter-text" disabled>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="w-9 h-9 border-petcenter-primary bg-petcenter-primary/5 text-petcenter-primary font-medium hover:bg-petcenter-primary/10">
          1
        </Button>
        <Button variant="ghost" className="w-9 h-9 text-petcenter-text-secondary hover:text-petcenter-text">
          2
        </Button>
        <Button variant="outline" size="icon" className="w-9 h-9 border-none text-petcenter-text-secondary hover:text-petcenter-text">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  )
}
