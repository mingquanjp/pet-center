import { ReportCompareMode } from "./reports.types.js";

export function getCompareLabel(compareMode: ReportCompareMode): string {
    if (compareMode === "PREVIOUS_PERIOD") return "so với kỳ trước";
    if (compareMode === "SAME_PERIOD_LAST_MONTH") return "so với cùng kỳ tháng trước";
    return "";
}

export function getTrendDirection(growth: number): "up" | "down" | "neutral" {
    if (growth > 0) return "up";
    if (growth < 0) return "down";
    return "neutral";
}

export function calculateGrowthPercent(current: number, previous: number): number | null {
    if (previous <= 0) return null;
    if (current === previous) return 0;
    const growth = ((current - previous) / previous) * 100;
    return Number(growth.toFixed(1));
}

export function formatCompactVnd(amount: number): string {
    if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (amount >= 1_000) return (amount / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return amount.toString();
}

export function formatPercent(value: number): number {
    return Number(value.toFixed(1));
}

export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return formatPercent((value / total) * 100);
}
