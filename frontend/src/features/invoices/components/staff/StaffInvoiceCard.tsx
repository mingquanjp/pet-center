import * as React from "react"
// Force TS reload
import { Download, PawPrint, User, Calendar, Store, Globe, Bed, Scissors, Stethoscope, Pill, AlertCircle, Bath } from "lucide-react"
import { StaffInvoice } from "../../types/invoice.types"
import { InvoiceStatusBadge } from "../shared/InvoiceStatusBadge"
import { invoicePaymentOptionLabel } from "../../constants/invoice.constants"
import { formatInvoiceMoney, formatInvoiceDate } from "../../utils/invoice-format"
import { generateInvoicePdf } from "../../utils/pdf-generator"
import { toast } from "sonner"

export interface StaffInvoiceCardProps {
  invoice: StaffInvoice
  onConfirmPayment: (invoice: StaffInvoice) => void
  onCancelInvoice?: (invoice: StaffInvoice) => void
}

export function StaffInvoiceCard({ invoice, onConfirmPayment, onCancelInvoice }: StaffInvoiceCardProps) {
  const isPendingAtCounter = invoice.paymentStatus === "PENDING_PAYMENT" && invoice.paymentOption === "AT_COUNTER"
  const isPaid = invoice.paymentStatus === "PAID"
  const [isDownloading, setIsDownloading] = React.useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      toast.info("Đang tạo file PDF...")
      await generateInvoicePdf(invoice)
      toast.success("Tải hóa đơn thành công!")
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải hóa đơn. Vui lòng thử lại sau.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Icon config
  let Icon = AlertCircle
  let iconBg = "bg-petcenter-background"
  let iconColor = "text-petcenter-text-secondary"

  if (invoice.serviceType === "BOARDING") {
    Icon = Bed
    iconBg = "bg-petcenter-info-bg"
    iconColor = "text-petcenter-info-text"
  } else if (invoice.serviceType === "GROOMING") {
    Icon = Scissors
    iconBg = "bg-petcenter-warning-bg"
    iconColor = "text-petcenter-warning-text"
    if (invoice.title.toLowerCase().includes("tắm")) {
      Icon = Bath
      iconBg = "bg-petcenter-success-bg"
      iconColor = "text-petcenter-success-text"
    }
  } else if (invoice.serviceType === "MEDICAL") {
    Icon = Stethoscope
    iconBg = "bg-petcenter-danger-bg"
    iconColor = "text-petcenter-danger-text"
  } else if (invoice.serviceType === "PRESCRIPTION") {
    Icon = Pill
    iconBg = "bg-petcenter-info-bg"
    iconColor = "text-petcenter-info-text"
  }

  return (
    <div className={`bg-petcenter-card border border-petcenter-border rounded-[1rem] p-5 shadow-card transition-shadow duration-200 ${isPaid ? 'opacity-80' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-[0.75rem] flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="heading-sm text-petcenter-text">{invoice.title}</h3>
              <span className="label-sm px-2 py-0.5 rounded bg-petcenter-background text-petcenter-text-secondary border border-petcenter-border">{invoice.invoiceCode}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 body-md text-petcenter-text-secondary mt-1">
              <div className="flex items-center gap-1 min-w-[150px]"><PawPrint className="w-4 h-4 shrink-0" /> Thú cưng: <span className="font-medium text-petcenter-text truncate">{invoice.pet.name}</span></div>
              <div className="flex items-center gap-1 min-w-[180px]"><User className="w-4 h-4 shrink-0" /> Chủ nuôi: <span className="font-medium text-petcenter-text truncate">{invoice.owner.fullName}</span></div>
              <div className="flex items-center gap-1 min-w-[120px]"><Calendar className="w-4 h-4 shrink-0" /> {formatInvoiceDate(invoice.serviceDate || invoice.issuedAt)}</div>
              <div className="flex items-center gap-1 min-w-[130px]">
                {invoice.paymentOption === "ONLINE" ? <Globe className="w-4 h-4 shrink-0" /> : <Store className="w-4 h-4 shrink-0" />} 
                <span className="truncate">{invoicePaymentOptionLabel[invoice.paymentOption]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
          <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4">
            <InvoiceStatusBadge status={invoice.paymentStatus} />
            <span className="title-md text-petcenter-text">{formatInvoiceMoney(invoice.totalAmount)}</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto min-h-[40px]">
            {invoice.paymentStatus === "PENDING_PAYMENT" && onCancelInvoice && (
              <button 
                onClick={() => onCancelInvoice(invoice)}
                className="flex-1 md:flex-none px-4 py-2 bg-transparent text-petcenter-danger-text border border-petcenter-danger-border rounded-[0.75rem] body-md font-medium hover:bg-petcenter-danger-bg/50 transition-colors"
              >
                Đánh dấu quá hạn
              </button>
            )}

            {isPendingAtCounter && (
              <button 
                onClick={() => onConfirmPayment(invoice)}
                className="flex-1 md:flex-none px-4 py-2 bg-petcenter-primary text-white rounded-[0.75rem] body-md font-medium hover:bg-petcenter-primary-hover transition-colors"
              >
                Xác nhận thanh toán
              </button>
            )}
            
            {isPaid && (
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex-1 md:flex-none px-4 py-2 bg-petcenter-card text-petcenter-primary border border-petcenter-primary rounded-[0.75rem] body-md font-medium hover:bg-petcenter-background hover:text-petcenter-primary-hover transition-colors flex items-center justify-center gap-2 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-4 h-4" /> {isDownloading ? "Đang xử lý..." : "Tải hóa đơn"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
