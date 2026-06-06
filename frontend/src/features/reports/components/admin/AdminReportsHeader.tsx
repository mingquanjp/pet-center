import { FileDown, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AdminReportsHeaderProps {
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export function AdminReportsHeader({ onExportExcel, onExportPdf }: AdminReportsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="heading-lg text-petcenter-text tracking-tight">Báo cáo & thống kê</h2>
        <p className="body-md text-petcenter-text-secondary mt-1">
          Phân tích doanh thu, dịch vụ và hiệu suất vận hành theo từng kỳ.
        </p>
      </div>
      <div className="flex items-center gap-2 self-start md:self-auto">
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 rounded-control border border-petcenter-border bg-petcenter-card px-4 py-2 text-sm font-medium text-petcenter-text shadow-sm transition-colors hover:bg-petcenter-background h-9"
        >
          <FileText className="h-4 w-4 text-petcenter-primary" />
          Xuất Excel
        </button>
        <button
          onClick={onExportPdf}
          className="flex items-center gap-2 rounded-control border border-petcenter-border bg-petcenter-card px-4 py-2 text-sm font-medium text-petcenter-text shadow-sm transition-colors hover:bg-petcenter-background h-9"
        >
          <FileDown className="h-4 w-4 text-petcenter-primary" />
          Xuất PDF
        </button>
      </div>
    </div>
  );
}
