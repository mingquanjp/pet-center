import html2pdf from "html2pdf.js"
import { StaffInvoice } from "../types/invoice.types"
import { formatInvoiceMoney, formatInvoiceDate } from "./invoice-format"
import { invoicePaymentOptionLabel, invoiceServiceTypeLabel } from "../constants/invoice.constants"

export const generateInvoicePdf = async (invoice: StaffInvoice) => {
  // Create a hidden container for the PDF content
  const container = document.createElement("div")
  
  // Basic styles for the PDF
  container.innerHTML = `
    <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="color: #ff8e3c; margin: 0; font-size: 28px;">PETCENTER</h1>
          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Chăm sóc thú cưng chuyên nghiệp</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 24px; color: #333;">HÓA ĐƠN</h2>
          <p style="margin: 5px 0 0; color: #666; font-weight: bold;">Mã số: ${invoice.invoiceCode}</p>
          <p style="margin: 5px 0 0; color: #666;">Ngày: ${formatInvoiceDate(invoice.issuedAt)}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div>
          <h3 style="margin: 0 0 10px; font-size: 16px; color: #666; text-transform: uppercase;">Thông tin khách hàng</h3>
          <p style="margin: 0 0 5px;"><strong>Chủ nuôi:</strong> ${invoice.owner.fullName}</p>
          <p style="margin: 0 0 5px;"><strong>Số điện thoại:</strong> ${invoice.owner.phone}</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0 0 10px; font-size: 16px; color: #666; text-transform: uppercase;">Thông tin thú cưng</h3>
          <p style="margin: 0 0 5px;"><strong>Tên:</strong> ${invoice.pet.name}</p>
          <p style="margin: 0 0 5px;"><strong>Giống loài:</strong> ${invoice.pet.species}</p>
        </div>
      </div>

      <div style="margin-bottom: 40px;">
        <h3 style="margin: 0 0 15px; font-size: 16px; color: #666; text-transform: uppercase;">Chi tiết dịch vụ</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Dịch vụ</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Phân loại</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 15px 12px; border-bottom: 1px solid #eee;">
                <strong>${invoice.title}</strong>
              </td>
              <td style="padding: 15px 12px; border-bottom: 1px solid #eee; color: #666;">
                ${invoiceServiceTypeLabel[invoice.serviceType] || invoice.serviceType}
              </td>
              <td style="padding: 15px 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">
                ${formatInvoiceMoney(invoice.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #666;">Phương thức thanh toán:</span>
            <strong>${invoicePaymentOptionLabel[invoice.paymentOption]}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #333; padding-top: 15px; margin-top: 10px;">
            <span style="font-size: 18px; font-weight: bold;">Tổng cộng:</span>
            <span style="font-size: 20px; font-weight: bold; color: #ff8e3c;">${formatInvoiceMoney(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; color: #888; font-size: 14px; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin: 0;">Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của PetCenter!</p>
      </div>
    </div>
  `

  // Configure html2pdf options
  const opt = {
    margin:       [10, 0],
    filename:     `Hoa_Don_${invoice.invoiceCode}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Generate and save
  await html2pdf().set(opt).from(container).save()
}
