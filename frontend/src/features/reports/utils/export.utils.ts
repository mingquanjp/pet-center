import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminReportsData, AdminReportTab, AdminReportFilters } from '../types/report.types';


// --- EXCEL EXPORT ---

export async function exportToExcel(
  data: AdminReportsData,
  tab: AdminReportTab,
  filters: AdminReportFilters
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PetCenter';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Báo cáo ${getTabName(tab)}`, {
    views: [{ state: 'frozen', ySplit: 5 }],
  });

  // Header Styling
  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `BÁO CÁO ${getTabName(tab).toUpperCase()} PETCENTER`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('A2:E2');
  const periodCell = sheet.getCell('A2');
  periodCell.value = `Kỳ báo cáo: ${getTimeRangeName(filters.timeRange)}`;
  periodCell.font = { name: 'Arial', size: 11, italic: true };
  periodCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.addRow([]);

  // Common styles
  const headerFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FF374151' } };

  let startRow = 5;

  if (tab === 'REVENUE') {
    sheet.getCell(`A${startRow}`).value = 'TỔNG QUAN DOANH THU';
    sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const metricsHeader = sheet.addRow(['Chỉ số', 'Giá trị', 'Tăng trưởng']);
    metricsHeader.eachCell(c => { c.fill = headerFill; c.font = headerFont; });

    data.revenue.metrics.forEach(m => {
      sheet.addRow([
        m.label,
        m.value,
        m.trend ? `${m.trend.direction === 'up' ? '+' : '-'}${m.trend.value}%` : '-'
      ]);
    });
    
    startRow += data.revenue.metrics.length + 2;

    sheet.getCell(`A${startRow}`).value = 'CƠ CẤU DOANH THU THEO NGUỒN';
    sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const sourceHeader = sheet.addRow(['Nguồn', 'Số hóa đơn', 'Doanh thu', 'Tỷ trọng', 'Tăng trưởng']);
    sourceHeader.eachCell(c => { c.fill = headerFill; c.font = headerFont; });

    data.revenue.sourceBreakdown.forEach(s => {
      sheet.addRow([
        s.label,
        s.invoiceCount,
        s.revenue.toLocaleString() + ' ₫',
        `${s.percentage}%`,
        s.changePercent != null ? `${s.changePercent > 0 ? '+' : ''}${s.changePercent}%` : '-'
      ]);
    });
  }

  if (tab === 'SERVICES') {
    sheet.getCell(`A${startRow}`).value = 'TỔNG QUAN DỊCH VỤ SPA';
    sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const metricsHeader = sheet.addRow(['Chỉ số', 'Giá trị', 'Tăng trưởng']);
    metricsHeader.eachCell(c => { c.fill = headerFill; c.font = headerFont; });

    data.services.metrics.forEach(m => {
      sheet.addRow([m.label, m.value, m.trend ? `${m.trend.direction === 'up' ? '+' : '-'}${m.trend.value}%` : '-']);
    });
    
    startRow += data.services.metrics.length + 2;

    sheet.getCell(`A${startRow}`).value = 'DỊCH VỤ PHỔ BIẾN';
    sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const topHeader = sheet.addRow(['Tên dịch vụ', 'Lượt đặt', 'Hoàn thành', 'Doanh thu']);
    topHeader.eachCell(c => { c.fill = headerFill; c.font = headerFont; });

    data.services.topServices.forEach(s => {
      sheet.addRow([s.serviceName, s.bookingCount, s.completedCount, s.revenue.toLocaleString() + ' ₫']);
    });
  }
  
  if (tab === 'BOARDING') {
    sheet.getCell(`A${startRow}`).value = 'CÔNG SUẤT PHÒNG LƯU TRÚ';
    sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const roomHeader = sheet.addRow(['Loại phòng', 'Tổng sức chứa', 'Đang sử dụng', 'Công suất', 'Doanh thu']);
    roomHeader.eachCell(c => { c.fill = headerFill; c.font = headerFont; });

    data.boarding.roomOccupancy.forEach(r => {
      sheet.addRow([
        r.roomTypeName,
        r.capacity,
        r.currentOccupancy,
        `${r.occupancyRate}%`,
        r.revenue.toLocaleString() + ' ₫'
      ]);
    });
  }

  if (tab === 'MEDICAL') {
    sheet.getCell(`A${startRow}`).value = 'HIỆU SUẤT BÁC SĨ';
    sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const docHeader = sheet.addRow(['Tên bác sĩ', 'Lịch phân công', 'Phiếu khám', 'Đơn thuốc', 'Tỷ lệ hoàn thành']);
    docHeader.eachCell(c => { c.fill = headerFill; c.font = headerFont; });

    data.medical.doctorPerformance.forEach(d => {
      sheet.addRow([
        d.doctorName,
        d.assignedAppointments,
        d.medicalExamCount,
        d.prescriptionCount,
        `${d.completionRate}%`
      ]);
    });
  }

  if (tab === 'CUSTOMERS') {
    sheet.getCell(`A${startRow}`).value = 'TỔNG QUAN KHÁCH HÀNG & THÚ CƯNG';
    sheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
    startRow++;

    const metricsHeader = sheet.addRow(['Chỉ số', 'Giá trị', 'Tăng trưởng']);
    metricsHeader.eachCell(c => { c.fill = headerFill; c.font = headerFont; });

    data.customers.metrics.forEach(m => {
      sheet.addRow([m.label, m.value, m.trend ? `${m.trend.direction === 'up' ? '+' : '-'}${m.trend.value}%` : '-']);
    });
  }

  // Auto-fit columns
  sheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength < 12 ? 12 : maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `PetCenter_Report_${tab}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// --- PDF EXPORT ---

export async function exportToPdf(data: AdminReportsData, tab: AdminReportTab, filters: AdminReportFilters) {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // 1. Tải Font Roboto hỗ trợ Tiếng Việt (UTF-8)
  try {
    const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    
    // Safer Base64 conversion for large files
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Font = btoa(binary);

    pdf.addFileToVFS('Roboto-Regular.ttf', base64Font);
    pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    pdf.setFont('Roboto');
  } catch (err) {
    console.warn("Không tải được font Roboto, có thể bị lỗi font Tiếng Việt.", err);
  }

  const pdfWidth = pdf.internal.pageSize.getWidth();
  
  // Header
  pdf.setFontSize(16);
  pdf.setTextColor(0, 121, 107); // petcenter-primary
  pdf.text(`BÁO CÁO ${getTabName(tab).toUpperCase()} PETCENTER`, pdfWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Kỳ báo cáo: ${getTimeRangeName(filters.timeRange)}`, pdfWidth / 2, 27, { align: 'center' });
  pdf.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, pdfWidth / 2, 33, { align: 'center' });

  let startY = 45;

  const styles = { font: 'Roboto', fontStyle: 'normal' as const, fontSize: 10 };
  const headStyles = { fillColor: [0, 121, 107] as [number, number, number], font: 'Roboto', fontStyle: 'normal' as const, textColor: 255 };

  if (tab === 'REVENUE') {
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('1. TỔNG QUAN DOANH THU', 14, startY);
    
    autoTable(pdf, {
      startY: startY + 5,
      head: [['Chỉ số', 'Giá trị', 'Tăng trưởng']],
      body: data.revenue.metrics.map(m => [
        m.label,
        m.value,
        m.trend ? `${m.trend.direction === 'up' ? '+' : '-'}${m.trend.value}%` : '-'
      ]),
      styles, headStyles
    });

    // @ts-expect-error jspdf-autotable adds lastAutoTable to jsPDF
    startY = pdf.lastAutoTable.finalY + 15;

    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('2. CƠ CẤU DOANH THU THEO NGUỒN', 14, startY);

    autoTable(pdf, {
      startY: startY + 5,
      head: [['Nguồn', 'Số hóa đơn', 'Doanh thu', 'Tỷ trọng', 'Tăng trưởng']],
      body: data.revenue.sourceBreakdown.map(s => [
        s.label,
        s.invoiceCount.toString(),
        s.revenue.toLocaleString() + ' đ',
        `${s.percentage}%`,
        s.changePercent != null ? `${s.changePercent > 0 ? '+' : ''}${s.changePercent}%` : '-'
      ]),
      styles, headStyles
    });
  }

  if (tab === 'SERVICES') {
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('1. TỔNG QUAN DỊCH VỤ SPA', 14, startY);
    
    autoTable(pdf, {
      startY: startY + 5,
      head: [['Chỉ số', 'Giá trị', 'Tăng trưởng']],
      body: data.services.metrics.map(m => [
        m.label, m.value, m.trend ? `${m.trend.direction === 'up' ? '+' : '-'}${m.trend.value}%` : '-'
      ]),
      styles, headStyles
    });

    // @ts-expect-error jspdf-autotable adds lastAutoTable to jsPDF
    startY = pdf.lastAutoTable.finalY + 15;

    pdf.setFontSize(12);
    pdf.text('2. DỊCH VỤ PHỔ BIẾN', 14, startY);

    autoTable(pdf, {
      startY: startY + 5,
      head: [['Tên dịch vụ', 'Lượt đặt', 'Hoàn thành', 'Doanh thu']],
      body: data.services.topServices.map(s => [
        s.serviceName, s.bookingCount.toString(), s.completedCount.toString(), s.revenue.toLocaleString() + ' đ'
      ]),
      styles, headStyles
    });
  }

  if (tab === 'BOARDING') {
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('1. CÔNG SUẤT PHÒNG LƯU TRÚ', 14, startY);
    
    autoTable(pdf, {
      startY: startY + 5,
      head: [['Loại phòng', 'Tổng sức chứa', 'Đang sử dụng', 'Công suất', 'Doanh thu']],
      body: data.boarding.roomOccupancy.map(r => [
        r.roomTypeName, r.capacity.toString(), r.currentOccupancy.toString(), `${r.occupancyRate}%`, r.revenue.toLocaleString() + ' đ'
      ]),
      styles, headStyles
    });
  }

  if (tab === 'MEDICAL') {
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('1. HIỆU SUẤT BÁC SĨ', 14, startY);
    
    autoTable(pdf, {
      startY: startY + 5,
      head: [['Tên bác sĩ', 'Lịch phân công', 'Phiếu khám', 'Đơn thuốc', 'Tỷ lệ hoàn thành']],
      body: data.medical.doctorPerformance.map(d => [
        d.doctorName, d.assignedAppointments.toString(), d.medicalExamCount.toString(), d.prescriptionCount.toString(), `${d.completionRate}%`
      ]),
      styles, headStyles
    });
  }

  if (tab === 'CUSTOMERS') {
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('1. TỔNG QUAN KHÁCH HÀNG & THÚ CƯNG', 14, startY);
    
    autoTable(pdf, {
      startY: startY + 5,
      head: [['Chỉ số', 'Giá trị', 'Tăng trưởng']],
      body: data.customers.metrics.map(m => [
        m.label, m.value, m.trend ? `${m.trend.direction === 'up' ? '+' : '-'}${m.trend.value}%` : '-'
      ]),
      styles, headStyles
    });
  }

  // Footer / Page numbers
  // @ts-expect-error internal exists
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Trang ${i} / ${pageCount}`, pdfWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  pdf.save(`PetCenter_Report_${tab}_${new Date().toISOString().slice(0,10)}.pdf`);
}

function getTabName(tab: AdminReportTab): string {
  switch (tab) {
    case 'REVENUE': return 'Doanh thu';
    case 'SERVICES': return 'Dịch vụ Spa';
    case 'BOARDING': return 'Lưu trú';
    case 'MEDICAL': return 'Khám bệnh';
    case 'CUSTOMERS': return 'Khách hàng';
    default: return 'Tổng hợp';
  }
}

function getTimeRangeName(range: string): string {
  switch (range) {
    case 'TODAY': return 'Hôm nay';
    case 'LAST_7_DAYS': return '7 ngày qua';
    case 'LAST_30_DAYS': return '30 ngày qua';
    case 'THIS_MONTH': return 'Tháng này';
    case 'THIS_QUARTER': return 'Quý này';
    case 'THIS_YEAR': return 'Năm nay';
    case 'CUSTOM': return 'Tùy chỉnh';
    default: return range;
  }
}
