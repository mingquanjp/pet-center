import { ReportMetric } from "../../types/report.types";
import { getTrendClass } from "../../utils/report-format";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminReportMetricCardProps {
  metric: ReportMetric;
}

export function AdminReportMetricCard({ metric }: AdminReportMetricCardProps) {
  const TrendIcon = 
    metric.trend?.direction === "up" ? TrendingUp : 
    metric.trend?.direction === "down" ? TrendingDown : 
    Minus;

  return (
    <div className="flex flex-col gap-2 rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card transition-shadow hover:shadow-lg">
      <h4 className="label-sm text-petcenter-text-muted uppercase tracking-wider">{metric.label}</h4>
      <div className="flex items-end gap-3">
        <span className="heading-md text-petcenter-text">{metric.value}</span>
        {metric.trend && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            getTrendClass(metric.trend.direction)
          )}>
            <TrendIcon className="h-3 w-3" />
            <span>{metric.trend.value}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-petcenter-text-muted">
        {metric.trend && metric.trend.label ? metric.trend.label : (metric.description || "trong kỳ đã chọn")}
      </p>
    </div>
  );
}
