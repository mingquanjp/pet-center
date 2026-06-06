import { AdminReportsData } from "../../../types/report.types";
import { AdminReportMetricCard } from "../AdminReportMetricCard";
import { AdminReportChartCard } from "../AdminReportChartCard";
import { formatCompactVnd, formatPercent } from "../../../utils/report-format";
import { AdminReportsEmptyState } from "../AdminReportsEmptyState";

interface BoardingReportTabProps {
  data: AdminReportsData["boarding"];
}

export function BoardingReportTab({ data }: BoardingReportTabProps) {
  if (!data || data.metrics.length === 0) return <AdminReportsEmptyState />;

  const totalCount = Math.max(data.statusCounts.reduce((acc, curr) => acc + curr.count, 0), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.metrics.map((metric) => (
          <AdminReportMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Chart */}
        <AdminReportChartCard title="Trạng thái lưu trú">
          <div className="flex flex-col gap-4 py-2">
            {data.statusCounts.map((status, index) => {
              const widthPercent = (status.count / totalCount) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 text-sm text-petcenter-text-secondary">
                    {status.label}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-full rounded-full bg-petcenter-filter">
                      <div 
                        className="h-full rounded-full bg-petcenter-primary"
                        style={{ width: `${Math.max(2, widthPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-10 shrink-0 text-right text-sm font-medium text-petcenter-text">
                    {status.count}
                  </div>
                </div>
              );
            })}
          </div>
        </AdminReportChartCard>

        {/* Room Occupancy Table */}
        <AdminReportChartCard title="Báo cáo theo loại phòng">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-petcenter-border text-petcenter-text-muted">
                  <th className="pb-3 pr-4 font-medium">Loại phòng</th>
                  <th className="pb-3 px-4 font-medium text-right">Sức chứa</th>
                  <th className="pb-3 px-4 font-medium text-right">Đang ở</th>
                  <th className="pb-3 px-4 font-medium text-right">Công suất</th>
                  <th className="pb-3 pl-4 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.roomOccupancy.map((room, index) => (
                  <tr key={index} className="border-b border-petcenter-border/50 last:border-0 hover:bg-petcenter-filter/50">
                    <td className="py-3 pr-4 font-medium text-petcenter-text">
                      {room.roomTypeName}
                    </td>
                    <td className="py-3 px-4 text-right text-petcenter-text">{room.capacity}</td>
                    <td className="py-3 px-4 text-right text-petcenter-text">{room.currentOccupancy}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-petcenter-text">{formatPercent(room.occupancyRate)}</span>
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-right font-medium text-petcenter-text">
                      {formatCompactVnd(room.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminReportChartCard>
      </div>
    </div>
  );
}
