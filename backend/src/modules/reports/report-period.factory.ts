import { ReportTimeRange, ReportCompareMode, ReportPeriodDto } from "./reports.types.js";
import { getCompareLabel } from "./report-trend.calculator.js";

export function getCurrentPeriod(timeRange: ReportTimeRange, fromDateStr?: string, toDateStr?: string, now: Date = new Date()): ReportPeriodDto {
    let from = new Date(now);
    let to = new Date(now);
    to.setUTCHours(23, 59, 59, 999);

    let label = "Khoảng thời gian";

    switch (timeRange) {
    case "TODAY":
      from.setUTCHours(0, 0, 0, 0);
      label = "Hôm nay";
      break;
    case "LAST_7_DAYS":
      from.setUTCDate(now.getUTCDate() - 6);
      from.setUTCHours(0, 0, 0, 0);
      label = "7 ngày qua";
      break;
    case "LAST_30_DAYS":
      from.setUTCDate(now.getUTCDate() - 29);
      from.setUTCHours(0, 0, 0, 0);
      label = "30 ngày qua";
      break;
    case "THIS_MONTH":
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      label = "Tháng này";
      break;
    case "THIS_QUARTER":
      const quarter = Math.floor(now.getUTCMonth() / 3);
      from = new Date(Date.UTC(now.getUTCFullYear(), quarter * 3, 1));
      label = "Quý này";
      break;
    case "THIS_YEAR":
      from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      label = "Năm nay";
      break;
    case "CUSTOM":
      if (fromDateStr) from = new Date(fromDateStr);
      if (toDateStr) to = new Date(toDateStr);
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);
      label = "Tùy chỉnh";
      break;
    default:
      from.setUTCDate(now.getUTCDate() - 29);
      from.setUTCHours(0, 0, 0, 0);
      label = "30 ngày qua";
    }

    return { from: from.toISOString(), to: to.toISOString(), label };
}

export function getPreviousPeriod(currentPeriod: ReportPeriodDto, compareMode: ReportCompareMode): ReportPeriodDto | null {
    if (compareMode === "NONE") return null;

    const currentFrom = new Date(currentPeriod.from);
    const currentTo = new Date(currentPeriod.to);
    const durationMs = currentTo.getTime() - currentFrom.getTime();

    let previousFrom: Date;
    let previousTo: Date;

    if (compareMode === "PREVIOUS_PERIOD") {
    previousTo = new Date(currentFrom.getTime() - 1);
    previousFrom = new Date(previousTo.getTime() - durationMs);
    } else { // SAME_PERIOD_LAST_MONTH
    previousFrom = new Date(currentFrom);
    previousFrom.setUTCMonth(previousFrom.getUTCMonth() - 1);
    previousTo = new Date(currentTo);
    previousTo.setUTCMonth(previousTo.getUTCMonth() - 1);
    }

    return { from: previousFrom.toISOString(), to: previousTo.toISOString(), label: getCompareLabel(compareMode) };
}
