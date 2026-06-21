import { describe, expect, it } from "vitest";
import {
  calculateGrowthPercent,
  calculatePercentage,
  formatCompactVnd,
  formatPercent,
  getCompareLabel,
  getTrendDirection,
} from "../../../src/modules/reports/report-trend.calculator.js";
import { getCurrentPeriod, getPreviousPeriod } from "../../../src/modules/reports/report-period.factory.js";

describe("report trend calculator", () => {
  it.each([
    [1, "up"],
    [-1, "down"],
    [0, "neutral"],
  ] as const)("maps growth %s to %s", (growth, direction) => {
    expect(getTrendDirection(growth)).toBe(direction);
  });

  it("calculates and rounds growth", () => {
    expect(calculateGrowthPercent(125, 100)).toBe(25);
    expect(calculateGrowthPercent(100, 125)).toBe(-20);
    expect(calculateGrowthPercent(100, 100)).toBe(0);
    expect(calculateGrowthPercent(10, 0)).toBeNull();
  });

  it.each([
    [999, "999"], [1_000, "1k"], [1_500, "1.5k"],
    [1_000_000, "1M"], [1_500_000_000, "1.5B"],
  ])("formats compact VND %#", (amount, expected) => {
    expect(formatCompactVnd(amount as number)).toBe(expected);
  });

  it("formats percentages safely", () => {
    expect(formatPercent(12.34)).toBe(12.3);
    expect(calculatePercentage(1, 4)).toBe(25);
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it("returns compare labels", () => {
    expect(getCompareLabel("NONE")).toBe("");
    expect(getCompareLabel("PREVIOUS_PERIOD")).not.toBe("");
    expect(getCompareLabel("SAME_PERIOD_LAST_MONTH")).not.toBe("");
  });
});

describe("report period factory", () => {
  const now = new Date("2026-06-20T12:00:00.000Z");

  it("builds today, rolling and calendar periods", () => {
    expect(getCurrentPeriod("TODAY", undefined, undefined, now).from).toBe("2026-06-20T00:00:00.000Z");
    expect(getCurrentPeriod("LAST_7_DAYS", undefined, undefined, now).from).toBe("2026-06-14T00:00:00.000Z");
    expect(getCurrentPeriod("THIS_MONTH", undefined, undefined, now).from).toBe("2026-06-01T00:00:00.000Z");
    expect(getCurrentPeriod("THIS_QUARTER", undefined, undefined, now).from).toBe("2026-04-01T00:00:00.000Z");
    expect(getCurrentPeriod("THIS_YEAR", undefined, undefined, now).from).toBe("2026-01-01T00:00:00.000Z");
  });

  it("normalizes custom period boundaries", () => {
    const period = getCurrentPeriod("CUSTOM", "2026-06-02", "2026-06-05", now);
    expect(period.from).toBe("2026-06-02T00:00:00.000Z");
    expect(period.to).toBe("2026-06-05T23:59:59.999Z");
  });

  it("builds previous periods and supports no comparison", () => {
    const current = getCurrentPeriod("LAST_7_DAYS", undefined, undefined, now);
    expect(getPreviousPeriod(current, "NONE")).toBeNull();
    const previous = getPreviousPeriod(current, "PREVIOUS_PERIOD");
    expect(new Date(previous!.to).getTime()).toBe(new Date(current.from).getTime() - 1);
    expect(getPreviousPeriod(current, "SAME_PERIOD_LAST_MONTH")!.from).toContain("2026-05");
  });
});
