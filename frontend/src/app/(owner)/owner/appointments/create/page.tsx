"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronRight, Calendar, AlertCircle, CheckCircle, Plus, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getMedicalAppointmentStatusLabel, getMedicalAppointmentStatusTone, medicalAppointmentExamTypes } from "@/features/appointments/constants/medical-appointments"

export default function CreateAppointmentPage() {
  const [selectedPet, setSelectedPet] = useState("lucky")
  const [appointmentType, setAppointmentType] = useState("general_checkup")
  const [date, setDate] = useState("2024-05-15")
  const [time, setTime] = useState("10:30")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const timeSlots = ["08:00", "09:00", "10:30", "14:00", "15:30", "16:30"]

  const formatAppointmentDate = (dateStr: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const dayName = days[d.getDay()]
    const formattedDate = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return `${dayName}, ${formattedDate}`
  }

  const formatTime = (t: string) => {
    if (!t) return '—'
    const hour = parseInt(t.split(':')[0])
    return `${t} ${hour < 12 ? 'SA' : 'CH'}`
  }

  const handleCreateAppointment = () => {
    if (!selectedPet || !appointmentType || !date || !time) {
      alert("Vui lòng nhập đầy đủ thông tin: thú cưng, loại hình khám, ngày và giờ khám.")
      return
    }
    setShowSuccessDialog(true)
  }

  const getTimeSlotButtonClass = (slot: string) => {
    if (slot === "16:30") {
      return "h-11 font-normal bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed opacity-100"
    }

    return time === slot
      ? "h-11 font-normal bg-petcenter-primary text-white border-petcenter-primary hover:bg-petcenter-primary-hover hover:text-white"
      : "h-11 font-normal bg-white text-petcenter-text-secondary hover:text-petcenter-text hover:bg-gray-50"
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <div className="flex items-center text-sm text-petcenter-text-muted">
        <Link href="/owner/appointments" className="hover:text-petcenter-primary transition-colors">Lịch hẹn</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-petcenter-text font-medium">Tạo lịch hẹn</span>
      </div>

      <Card className="border-petcenter-border bg-gradient-to-r from-[#fcfbf5] via-white to-[#f8fbf8] shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-petcenter-text animate-in fade-in slide-in-from-bottom-2 duration-500">
              Tạo lịch hẹn khám
            </h1>
            <p className="text-petcenter-text-secondary animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
              Chọn thú cưng, loại khám và thời gian phù hợp với lịch `medical_appointments`.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="h-11 border-petcenter-border-strong text-petcenter-text" asChild>
              <Link href="/owner/appointments">Quay lại danh sách</Link>
            </Button>
            <Button className="h-11 bg-petcenter-cta text-white hover:bg-petcenter-cta-hover" onClick={handleCreateAppointment}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận tạo lịch
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        
        {/* Form Area */}
        <Card className="lg:col-span-2 border-none shadow-sm h-fit bg-white">
          <CardContent className="p-6 space-y-8">
            
            {/* 1. Chọn thú cưng */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                1. Chọn thú cưng
              </h3>
              <div className="space-y-2">
                <Label htmlFor="pet" className="text-petcenter-text-secondary text-sm">Thú cưng</Label>
                <Select value={selectedPet} onValueChange={(val) => {
                  if (val === 'add_new') {
                    // Do something to add new pet instead of setting selection
                  } else {
                    setSelectedPet(val)
                  }
                }}>
                  <SelectTrigger id="pet" className="min-h-16 w-full md:w-[460px] bg-white px-4 py-3">
                    <SelectValue placeholder="Chọn thú cưng của bạn..." />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" sideOffset={8} className="w-[var(--radix-select-trigger-width)] bg-white">
                    <SelectItem value="lucky">
                      <div className="flex items-center gap-3 py-1 min-h-14">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-orange-100 text-orange-600">LK</AvatarFallback>
                          <AvatarImage src="https://github.com/shadcn.png" alt="Lucky" />
                        </Avatar>
                        <div className="flex flex-col items-start px-2">
                          <span className="font-medium">Lucky</span>
                          <span className="text-xs text-petcenter-text-muted">Chó • 15 kg</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="milo">
                      <div className="flex items-center gap-3 py-1 min-h-14">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-slate-100 text-slate-600">ML</AvatarFallback>
                          <AvatarImage src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop" alt="Milo" />
                        </Avatar>
                        <div className="flex flex-col items-start px-2">
                          <span className="font-medium">Milo</span>
                          <span className="text-xs text-petcenter-text-muted">Mèo • 4 kg</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="bebong">
                      <div className="flex items-center gap-3 py-1 min-h-14">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-yellow-100 text-yellow-600">BB</AvatarFallback>
                          <AvatarImage src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop" alt="Bé Bông" />
                        </Avatar>
                        <div className="flex flex-col items-start px-2">
                          <span className="font-medium">Bé Bông</span>
                          <span className="text-xs text-petcenter-text-muted">Chó • 6 kg</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="mimi">
                      <div className="flex items-center gap-3 py-1 min-h-14">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-[#e9e6dc] text-petcenter-text font-bold text-base">M</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start px-2">
                          <span className="font-medium">Mimi</span>
                          <span className="text-xs text-petcenter-text-muted">Mèo • 3 kg</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="buddy">
                      <div className="flex items-center gap-3 py-1 min-h-14">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-[#e9e6dc] text-petcenter-text font-bold text-base">B</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start px-2">
                          <span className="font-medium">Buddy</span>
                          <span className="text-xs text-petcenter-text-muted">Chó • 20 kg</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectSeparator className="my-1" />
                    <SelectItem value="add_new" className="text-petcenter-text-secondary cursor-pointer py-3.5">
                      <div className="flex items-center gap-2 font-medium">
                        <Plus className="w-4 h-4" />
                        Thêm hồ sơ thú cưng
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2. Loại hình khám */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                2. Loại khám
              </h3>
              <RadioGroup value={appointmentType} onValueChange={setAppointmentType} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {medicalAppointmentExamTypes.map(type => (
                  <div key={type.value}>
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.value}
                      className="flex items-center gap-2 p-3 bg-white border rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-petcenter-primary peer-data-[state=checked]:bg-petcenter-primary/5 hover:bg-gray-50"
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${appointmentType === type.value ? 'border-petcenter-primary' : 'border-gray-300'}`}>
                        {appointmentType === type.value && <div className="w-2 h-2 rounded-full bg-petcenter-primary" />}
                      </div>
                      <span className="font-normal">{type.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="bg-petcenter-warning-bg rounded-md p-3 flex text-sm text-petcenter-warning-text gap-2 items-start mt-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Vui lòng mang theo sổ sức khỏe, hồ sơ tiêm chủng hoặc kết quả xét nghiệm cũ khi đến khám.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 3. Ngày khám */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  3. Ngày khám
                </h3>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 bg-white" />
              </div>

              {/* 4. Giờ khám */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  4. Giờ khám
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(slot => (
                    <Button
                      key={slot}
                      type="button"
                      variant="outline"
                      disabled={slot === "16:30"}
                      className={getTimeSlotButtonClass(slot)}
                      onClick={() => {
                        if (slot !== "16:30") {
                          setTime(slot)
                        }
                      }}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Triệu chứng */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                5. Triệu chứng
              </h3>
              <Textarea placeholder="Mô tả triệu chứng, dấu hiệu bất thường hoặc tình trạng hiện tại của thú cưng..." className="min-h-[100px] resize-none bg-white" />
            </div>

            {/* 6. Ghi chú thêm */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                6. Ghi chú thêm
              </h3>
              <Textarea placeholder="Ghi chú nội bộ cho phòng khám hoặc yêu cầu đặc biệt..." className="min-h-[80px] resize-none bg-white" />
            </div>

          </CardContent>
        </Card>

        {/* Summary Area */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm sticky top-6 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Tóm tắt lịch hẹn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-petcenter-text-secondary">Thú cưng:</span>
                  <span className="font-medium">
                    {selectedPet === 'lucky' ? 'Lucky (Chó)' : 
                     selectedPet === 'milo' ? 'Milo (Mèo)' : 
                     selectedPet === 'bebong' ? 'Bé Bông (Chó)' : 
                     selectedPet === 'mimi' ? 'Mimi (Mèo)' : 
                     selectedPet === 'buddy' ? 'Buddy (Chó)' : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-petcenter-text-secondary">Loại khám:</span>
                  <span className="font-medium">{medicalAppointmentExamTypes.find(t => t.value === appointmentType)?.label || '—'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-petcenter-text-secondary">Ngày giờ khám:</span>
                  <span className="font-medium">{`${formatAppointmentDate(date)} • ${formatTime(time)}`}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-petcenter-border">
                  <span className="text-petcenter-text-secondary">Trạng thái:</span>
                  <span className={`px-2.5 py-1 rounded-full text-[13px] font-medium flex items-center gap-1.5 ${getMedicalAppointmentStatusTone("pending")}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {getMedicalAppointmentStatusLabel("pending")}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button 
                  className="w-full bg-petcenter-cta hover:bg-petcenter-cta-hover text-white h-11"
                  onClick={handleCreateAppointment}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Xác nhận tạo lịch
              </Button>
              <Button variant="outline" className="w-full h-11 border-petcenter-primary text-petcenter-primary hover:bg-petcenter-primary hover:text-white transition-colors" asChild>
                <Link href="/owner/appointments">
                  Hủy bỏ
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <div className="flex justify-center opacity-[0.03] pt-4">
            <Calendar className="w-48 h-48" />
          </div>
        </div>

      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px] p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-petcenter-success-bg rounded-full flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-white border pointer-events-none flex items-center justify-center">
                <Check className="text-petcenter-success-text w-6 h-6 stroke-[3]" />
              </div>
            </div>
            
            <DialogHeader className="items-center sm:text-center space-y-2">
              <DialogTitle className="text-2xl font-bold text-petcenter-text">Tạo lịch hẹn thành công</DialogTitle>
              <DialogDescription className="text-petcenter-text-secondary text-base">
                Lịch hẹn của bạn đã được tạo và đang chờ trung tâm xác nhận.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full bg-[#fbfaf2] border border-petcenter-border rounded-lg p-5 mt-2 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                  <span className="text-petcenter-text-secondary font-medium">ID lịch hẹn:</span>
                  <span className="font-semibold text-petcenter-text">{`appt_${selectedPet}_${date}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-petcenter-text-secondary font-medium">Thú cưng:</span>
                <span className="font-medium text-petcenter-text">
                  {selectedPet === 'lucky' ? 'Lucky' : 
                   selectedPet === 'milo' ? 'Milo' : 
                   selectedPet === 'bebong' ? 'Bé Bông' : 
                   selectedPet === 'mimi' ? 'Mimi' : 
                   selectedPet === 'buddy' ? 'Buddy' : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-petcenter-text-secondary font-medium">Loại khám:</span>
                  <span className="font-medium text-petcenter-text">{medicalAppointmentExamTypes.find(t => t.value === appointmentType)?.label || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-petcenter-text-secondary font-medium">Ngày hẹn:</span>
                <span className="font-medium text-petcenter-text">{formatAppointmentDate(date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-petcenter-text-secondary font-medium">Giờ hẹn:</span>
                <span className="font-medium text-petcenter-text">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-petcenter-text-secondary font-medium">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 ${getMedicalAppointmentStatusTone("pending")}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {getMedicalAppointmentStatusLabel("pending")}
                </span>
              </div>
            </div>

            <p className="text-[13px] text-petcenter-text-muted mt-2 px-2">
              Trung tâm sẽ kiểm tra và xác nhận lịch hẹn của bạn. Bạn sẽ nhận được thông báo khi lịch hẹn được xác nhận.
            </p>

            <DialogFooter className="w-full sm:justify-center flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                className="w-full sm:w-1/2 h-11 border-petcenter-border-strong text-petcenter-text hover:bg-gray-50"
                asChild
              >
                <Link href="/owner/appointments">
                  Về danh sách
                </Link>
              </Button>
              <Button 
                className="w-full sm:w-1/2 h-11 bg-petcenter-primary hover:bg-petcenter-primary-hover text-white sm:ml-0"
                asChild
              >
                <Link href={`/owner/appointments/${`appt_${selectedPet}_${date}`}`}>
                  Xem lịch hẹn
                </Link>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
