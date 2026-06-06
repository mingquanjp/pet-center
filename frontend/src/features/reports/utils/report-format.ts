import { ReportCompareMode, ReportMetric } from "../types/report.types";

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactVnd(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return amount.toString();
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + "%";
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function getTrendClass(direction?: "up" | "down" | "neutral"): string {
  if (direction === "up") return "text-petcenter-success-text bg-petcenter-success-bg";
  if (direction === "down") return "text-petcenter-danger-text bg-petcenter-danger-bg";
  return "text-petcenter-text-muted bg-petcenter-filter";
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

export function calculateGrowthPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export function getTrendDirection(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

export function getCurrentPeriod(
  timeRange: string,
  fromDate?: string,
  toDate?: string
): { currentFrom: Date; currentTo: Date } {
  const now = new Date();
  let currentFrom = new Date(now);
  let currentTo = new Date(now);
  
  // Set to end of day
  currentTo.setHours(23, 59, 59, 999);
  
  switch (timeRange) {
    case "TODAY":
      currentFrom.setHours(0, 0, 0, 0);
      break;
    case "LAST_7_DAYS":
      currentFrom.setDate(now.getDate() - 6);
      currentFrom.setHours(0, 0, 0, 0);
      break;
    case "LAST_30_DAYS":
      currentFrom.setDate(now.getDate() - 29);
      currentFrom.setHours(0, 0, 0, 0);
      break;
    case "THIS_MONTH":
      currentFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      currentFrom.setHours(0, 0, 0, 0);
      break;
    case "THIS_QUARTER":
      const quarter = Math.floor(now.getMonth() / 3);
      currentFrom = new Date(now.getFullYear(), quarter * 3, 1);
      currentFrom.setHours(0, 0, 0, 0);
      break;
    case "THIS_YEAR":
      currentFrom = new Date(now.getFullYear(), 0, 1);
      currentFrom.setHours(0, 0, 0, 0);
      break;
    case "CUSTOM":
      if (fromDate) currentFrom = new Date(fromDate);
      if (toDate) currentTo = new Date(toDate);
      currentFrom.setHours(0, 0, 0, 0);
      currentTo.setHours(23, 59, 59, 999);
      break;
    default:
      currentFrom.setDate(now.getDate() - 29);
      currentFrom.setHours(0, 0, 0, 0);
  }
  
  return { currentFrom, currentTo };
}

export function getPreviousPeriod(
  currentFrom: Date,
  currentTo: Date,
  compareMode: string
): { previousFrom: Date; previousTo: Date } | null {
  if (compareMode === "NONE") return null;

  const durationMs = currentTo.getTime() - currentFrom.getTime();
  const previousTo = new Date(currentFrom.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);
  
  if (compareMode === "SAME_PERIOD_LAST_MONTH") {
    const prevMonthFrom = new Date(currentFrom);
    prevMonthFrom.setMonth(prevMonthFrom.getMonth() - 1);
    const prevMonthTo = new Date(currentTo);
    prevMonthTo.setMonth(prevMonthTo.getMonth() - 1);
    return { previousFrom: prevMonthFrom, previousTo: prevMonthTo };
  }

  return { previousFrom, previousTo };
}

export function shouldShowComparison(compareMode: ReportCompareMode) {
  return compareMode !== "NONE";
}

export function getCompareLabel(compareMode: ReportCompareMode) {
  if (compareMode === "PREVIOUS_PERIOD") return "so với kỳ trước";
  if (compareMode === "SAME_PERIOD_LAST_MONTH") return "so với cùng kỳ tháng trước";
  return "";
}

export function stripMetricTrendsWhenNoCompare(
  metrics: ReportMetric[],
  compareMode: ReportCompareMode
): ReportMetric[] {
  if (compareMode !== "NONE") return metrics;
  return metrics.map((metric) => ({
    ...metric,
    trend: undefined,
    description:
      metric.description && metric.description.includes("so với")
        ? "trong kỳ đã chọn"
        : metric.description,
  }));
}

