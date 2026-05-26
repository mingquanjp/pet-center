"use client"

import { useState, useMemo } from "react"
import { Search, RefreshCcw, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type InvoiceStatus = "Đã thanh toán" | "Chờ tại quầy"
type PaymentMethod = "Tại quầy" | "Online"

interface Invoice {
  id: string
  code: string
  title: string
  petName: string
  serviceType: string
  date: string
  paymentMethod: PaymentMethod
  status: InvoiceStatus
  amount: number
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    title: "Spa & Cắt tỉa",
    code: "INV-2024-001",
    petName: "Lucky",
    serviceType: "Spa",
    date: "25/09/2023",
    paymentMethod: "Tại quầy",
    status: "Đã thanh toán",
    amount: 250000,
  },
  {
    id: "2",
    title: "Tắm gội cơ bản",
    code: "INV-2024-002",
    petName: "Bé Bông",
    serviceType: "Spa",
    date: "05/10/2023",
    paymentMethod: "Online",
    status: "Đã thanh toán",
    amount: 180000,
  },
  {
    id: "3",
    title: "Lưu trú phòng VIP",
    code: "INV-2024-003",
    petName: "Lucky",
    serviceType: "Lưu trú",
    date: "15/11/2023",
    paymentMethod: "Online",
    status: "Đã thanh toán",
    amount: 350000,
  },
  {
    id: "4",
    title: "Lưu trú phòng tiêu chuẩn",
    code: "INV-2024-004",
    petName: "Milo",
    serviceType: "Lưu trú",
    date: "18/11/2023",
    paymentMethod: "Tại quầy",
    status: "Chờ tại quầy",
    amount: 220000,
  }
]

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ"
}

export default function MyInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(inv => {
      const matchSearch = inv.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.petName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === "all" || inv.status === statusFilter
      const matchType = typeFilter === "all" || inv.serviceType === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [searchQuery, statusFilter, typeFilter])

  const handleReset = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-petcenter-text mb-1">Hóa đơn của tôi</h1>
        <p className="text-petcenter-text-secondary">Theo dõi hóa đơn, trạng thái thanh toán và lịch sử giao dịch của bạn.</p>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border-0 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Tìm mã hóa đơn, tên thú cưng..." 
              className="pl-10 bg-gray-50 border-transparent focus-visible:ring-petcenter-primary/20 h-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-transparent h-10 rounded-xl">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)] bg-white">
                <SelectItem value="all">Trạng thái: Tất cả</SelectItem>
                <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
                <SelectItem value="Chờ tại quầy">Chờ tại quầy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-transparent h-10 rounded-xl">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)] bg-white">
                <SelectItem value="all">Loại: Tất cả</SelectItem>
                <SelectItem value="Spa">Spa</SelectItem>
                <SelectItem value="Lưu trú">Lưu trú</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-[150px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                type="text"
                placeholder="mm/dd/yyyy"
                className="pl-9 bg-gray-50 border-transparent h-10 rounded-xl text-sm"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="px-3 h-10 shrink-0 border-gray-200 text-gray-600 rounded-xl"
              onClick={handleReset}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* List */}
      <div className="flex flex-col gap-4">
        {filteredInvoices.map(invoice => (
          <Card key={invoice.id} className="bg-white border-0 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-6">
              
              {/* Left Logo & Title */}
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-[#00796B]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-[#00796B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{invoice.title}</h3>
                  <p className="text-sm text-gray-500">Mã HĐ: {invoice.code}</p>
                </div>
              </div>

              {/* Center Info Grid */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 tracking-wider">THÚ CƯNG</p>
                  <p className="text-sm font-medium text-gray-800">{invoice.petName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 tracking-wider">DỊCH VỤ</p>
                  <p className="text-sm font-medium text-gray-800">{invoice.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 tracking-wider">NGÀY TẠO</p>
                  <p className="text-sm font-medium text-gray-800">{invoice.date}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 tracking-wider">HÌNH THỨC TT</p>
                  <p className="text-sm font-medium text-gray-800">{invoice.paymentMethod}</p>
                </div>
              </div>

              {/* Right Status & Action */}
              <div className="flex flex-col items-end justify-between self-stretch shrink-0 md:w-[200px]">
                <div className="flex flex-col items-end gap-1">
                  <div className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                    invoice.status === "Đã thanh toán" 
                      ? "bg-green-50 text-green-600" 
                      : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}>
                    {invoice.status}
                  </div>
                  <div className={`font-bold text-xl ${invoice.status === 'Đã thanh toán' ? 'text-gray-800' : 'text-[#00796B]'}`}>
                    {formatMoney(invoice.amount)}
                  </div>
                  {invoice.status === "Chờ tại quầy" && (
                    <p className="text-[11px] text-[#F59E0B] text-right mt-1">Vui lòng thanh toán tại trung tâm</p>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-lg border-[#00796B] text-[#00796B] hover:bg-[#00796B]/5 mt-4 w-full"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  Xem chi tiết
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl">
            Không tìm thấy hóa đơn nào
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" className="rounded-lg" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive className="rounded-lg bg-[#00796B] text-white hover:bg-[#006B5B] hover:text-white border-0">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="rounded-lg">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="rounded-lg">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" className="rounded-lg" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent showCloseButton={false} data-hide-scrollbar className="sm:max-w-[520px] w-full rounded-xl p-0 gap-0 border-0 bg-white max-h-[80vh] overflow-auto">
          <style dangerouslySetInnerHTML={{ __html: `[data-hide-scrollbar]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch}[data-hide-scrollbar]::-webkit-scrollbar{display:none}` }} />
          {selectedInvoice && (
            <>
              {/* Header */}
              <DialogHeader className="px-6 py-5 border-b flex flex-row items-start justify-between space-y-0">
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-800">Chi tiết hóa đơn</DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">{selectedInvoice.code} • {selectedInvoice.petName}</p>
                </div>
                <div className={`px-2.5 py-1 text-xs font-medium rounded-md self-start ${
                  selectedInvoice.status === "Đã thanh toán" 
                    ? "bg-green-50 text-green-600" 
                    : "bg-[#F59E0B]/10 text-[#F59E0B]"
                }`}>
                  {selectedInvoice.status}
                </div>
              </DialogHeader>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {/* Thông tin Box */}
                <div className="bg-[#F7F5EA]/70 p-5 rounded-xl border border-[#F7F5EA]">
                  <h4 className="text-xs font-bold text-gray-500 mb-4 tracking-wider">THÔNG TIN HÓA ĐƠN</h4>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Mã hóa đơn</p>
                      <p className="text-sm font-medium text-gray-800">{selectedInvoice.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dịch vụ</p>
                      <p className="text-sm font-medium text-gray-800">{selectedInvoice.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Loại dịch vụ</p>
                      <p className="text-sm font-medium text-gray-800">{selectedInvoice.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Thú cưng</p>
                      <p className="text-sm font-medium text-gray-800">{selectedInvoice.petName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                      <p className="text-sm font-medium text-gray-800">{selectedInvoice.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                      <p className="text-sm font-medium text-gray-800">{selectedInvoice.status}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Hình thức thanh toán</p>
                      <p className="text-sm font-medium text-gray-800">{selectedInvoice.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Chi tiết thanh toán */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 mb-3 tracking-wider">CHI TIẾT THANH TOÁN</h4>
                  <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                    <span>Số tiền dịch vụ</span>
                    <span>{formatMoney(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t mt-2">
                    <span className="font-bold text-gray-800">Tổng thanh toán</span>
                    <span className="font-bold text-lg text-[#00796B]">{formatMoney(selectedInvoice.amount)}</span>
                  </div>
                </div>

                {/* Ghi chú */}
                {selectedInvoice.status === "Đã thanh toán" ? (
                  <div className="bg-green-50 text-green-700 text-sm p-4 rounded-lg flex items-start gap-2">
                    <span className="font-semibold whitespace-nowrap">Ghi chú:</span> 
                    <span>Hóa đơn đã được thanh toán thành công.</span>
                  </div>
                ) : (
                  <div className="bg-[#F59E0B]/10 text-[#F59E0B] text-sm p-4 rounded-lg flex items-start gap-2">
                    <span className="font-semibold whitespace-nowrap">Ghi chú:</span> 
                    <span>Vui lòng thanh toán trực tiếp tại trung tâm.</span>
                  </div>
                )}
                
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-lg h-10 px-6 border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Đóng
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}