import { AdminReportsData } from "../../../types/report.types";
import { AdminReportMetricCard } from "../AdminReportMetricCard";
import { AdminReportChartCard } from "../AdminReportChartCard";
import { formatCompactVnd, formatPercent, getTrendClass } from "../../../utils/report-format";
import { AdminReportsEmptyState } from "../AdminReportsEmptyState";

import { AdminReportFilters } from "../../../types/report.types";

interface RevenueReportTabProps {
  data: AdminReportsData["revenue"];
  compareMode: AdminReportFilters["compareMode"];
}

export function RevenueReportTab({ data, compareMode }: RevenueReportTabProps) {
  if (!data || data.metrics.length === 0) return <AdminReportsEmptyState />;

  const maxRevenue = Math.max(...data.trend.map((t) => t.revenue));

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.metrics.map((metric) => (
          <AdminReportMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <AdminReportChartCard title="Doanh thu theo thời gian">
          <div className="w-full overflow-x-auto overflow-y-hidden pb-2">
            <div className="flex h-64 items-end gap-2 px-2 min-w-max">
              {data.trend.map((point, index) => {
                const currentHeight = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                const prevHeight = (point.previousRevenue && maxRevenue > 0) ? (point.previousRevenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="group relative flex flex-1 flex-col items-center justify-end gap-2 h-full min-w-[36px]">
                    <div className="w-full flex justify-center items-end gap-1 h-full">
                      {/* Previous period bar (if compare mode is not NONE and previous data exists) */}
                      {compareMode !== "NONE" && point.previousRevenue !== undefined && (
                        <div 
                          className="w-full max-w-[20px] rounded-t-sm bg-petcenter-filter transition-all group-hover:bg-petcenter-border"
                          style={{ height: `${Math.max(5, prevHeight)}%` }}
                        ></div>
                      )}
                      {/* Current period bar */}
                      <div 
                        className="w-full max-w-[20px] rounded-t-sm bg-petcenter-primary transition-all group-hover:bg-petcenter-primary-hover"
                        style={{ height: `${Math.max(5, currentHeight)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-petcenter-text-secondary whitespace-nowrap">{point.label}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block z-10 text-center">
                      <div>{formatCompactVnd(point.revenue)}</div>
                      {compareMode !== "NONE" && point.previousRevenue !== undefined && (
                        <div className="text-gray-400 text-[10px]">Kỳ trước: {formatCompactVnd(point.previousRevenue)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AdminReportChartCard>

        {/* Source Table */}
        <AdminReportChartCard title="Cơ cấu doanh thu theo nguồn">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-petcenter-border text-petcenter-text-muted">
                  <th className="pb-3 pr-4 font-medium">Nguồn</th>
                  <th className="pb-3 px-4 font-medium text-right">Số HĐ</th>
                  <th className="pb-3 px-4 font-medium text-right">Doanh thu</th>
                  <th className="pb-3 px-4 font-medium text-right">Tỷ trọng</th>
                  {compareMode !== "NONE" && (
                    <th className="pb-3 pl-4 font-medium text-right">Tăng trưởng</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.sourceBreakdown.map((item, index) => (
                  <tr key={index} className="border-b border-petcenter-border/50 last:border-0 hover:bg-petcenter-filter/50">
                    <td className="py-3 pr-4 font-medium text-petcenter-text">{item.label}</td>
                    <td className="py-3 px-4 text-right text-petcenter-text">{item.invoiceCount}</td>
                    <td className="py-3 px-4 text-right font-medium text-petcenter-text">
                      {formatCompactVnd(item.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-petcenter-text">
                      {formatPercent(item.percentage)}
                    </td>
                    {compareMode !== "NONE" && (
                      <td className="py-3 pl-4 text-right">
                        {item.changePercent != null ? (
                          <span className={`text-xs font-semibold ${getTrendClass(item.changePercent >= 0 ? "up" : "down")}`}>
                            {item.changePercent > 0 ? "+" : ""}{formatPercent(item.changePercent)}
                          </span>
                        ) : (
                          <span className="text-petcenter-text-muted">—</span>
                        )}
                      </td>
                    )}
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
