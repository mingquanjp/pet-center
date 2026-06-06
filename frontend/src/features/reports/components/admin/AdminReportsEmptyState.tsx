import { BarChart3 } from "lucide-react";

export function AdminReportsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-petcenter-border bg-petcenter-card py-16 px-4 shadow-card">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-petcenter-filter">
        <BarChart3 className="h-8 w-8 text-petcenter-text-muted" />
      </div>
      <h3 className="title-md text-petcenter-text">Không có dữ liệu</h3>
      <p className="body-sm mt-2 text-center text-petcenter-text-secondary max-w-sm">
        Không có dữ liệu báo cáo trong khoảng thời gian này. Vui lòng chọn một khoảng thời gian khác.
      </p>
    </div>
  );
}
