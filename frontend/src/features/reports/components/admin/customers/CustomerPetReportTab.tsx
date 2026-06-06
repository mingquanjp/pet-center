import { AdminReportsData } from "../../../types/report.types";
import { AdminReportMetricCard } from "../AdminReportMetricCard";
import { AdminReportChartCard } from "../AdminReportChartCard";
import { calculatePercentage, formatPercent } from "../../../utils/report-format";
import { AdminReportsEmptyState } from "../AdminReportsEmptyState";

interface CustomerPetReportTabProps {
  data: AdminReportsData["customers"];
}

export function CustomerPetReportTab({ data }: CustomerPetReportTabProps) {
  if (!data || data.metrics.length === 0) return <AdminReportsEmptyState />;

  const totalRoleCount = Math.max(data.userRoleCounts.reduce((acc, curr) => acc + curr.count, 0), 1);
  const totalSpeciesCount = Math.max(data.petSpeciesCounts.reduce((acc, curr) => acc + curr.count, 0), 1);
  const totalAccounts = data.accountStatusCounts.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.metrics.map((metric) => (
          <AdminReportMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Role Chart */}
        <AdminReportChartCard 
          title="Phân bố tài khoản theo vai trò"
          action={<span className="rounded-full bg-petcenter-filter px-2 py-1 text-xs font-medium text-petcenter-text-muted border border-petcenter-border">Toàn thời gian</span>}
        >
          <div className="flex flex-col gap-4 py-2">
            {data.userRoleCounts.map((status, index) => {
              const widthPercent = (status.count / totalRoleCount) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-sm text-petcenter-text-secondary">
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
                  <div className="w-12 shrink-0 text-right text-sm font-medium text-petcenter-text">
                    {status.count}
                  </div>
                </div>
              );
            })}
          </div>
        </AdminReportChartCard>

        {/* Species Chart */}
        <AdminReportChartCard 
          title="Thú cưng theo loài"
          action={<span className="rounded-full bg-petcenter-filter px-2 py-1 text-xs font-medium text-petcenter-text-muted border border-petcenter-border">Toàn thời gian</span>}
        >
          <div className="flex flex-col gap-4 py-2">
            {data.petSpeciesCounts.map((status, index) => {
              const widthPercent = (status.count / totalSpeciesCount) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-sm text-petcenter-text-secondary">
                    {status.label}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-full rounded-full bg-petcenter-filter">
                      <div 
                        className="h-full rounded-full bg-petcenter-cta"
                        style={{ width: `${Math.max(2, widthPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 shrink-0 text-right text-sm font-medium text-petcenter-text">
                    {status.count}
                  </div>
                </div>
              );
            })}
          </div>
        </AdminReportChartCard>
      </div>

      {/* Account Status Table */}
      <AdminReportChartCard 
        title="Trạng thái tài khoản"
        action={<span className="rounded-full bg-petcenter-filter px-2.5 py-1 text-xs font-medium text-petcenter-text-muted border border-petcenter-border">Tổng hiện có</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-petcenter-border text-petcenter-text-muted">
                <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                <th className="pb-3 px-4 font-medium text-right">Số lượng</th>
                <th className="pb-3 pl-4 font-medium text-right">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {data.accountStatusCounts.map((status, index) => {
                const percentage = calculatePercentage(status.count, totalAccounts);
                return (
                  <tr key={index} className="border-b border-petcenter-border/50 last:border-0 hover:bg-petcenter-filter/50">
                    <td className="py-3 pr-4 font-medium text-petcenter-text">
                      {status.label}
                    </td>
                    <td className="py-3 px-4 text-right text-petcenter-text">{status.count}</td>
                    <td className="py-3 pl-4 text-right font-medium text-petcenter-text">
                      {formatPercent(percentage)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminReportChartCard>
    </div>
  );
}
