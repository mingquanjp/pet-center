import { describe, expect, it } from "vitest";
import { getMaxConcurrentIntervals, intervalsOverlap } from "../../../src/shared/utils/interval-capacity.js";

function at(time: string) {
  return new Date(`2026-06-15T${time}:00+07:00`);
}

describe("interval capacity", () => {
  it("counts the maximum concurrent intervals inside the requested range", () => {
    const maxConcurrent = getMaxConcurrentIntervals(
      [
        { start: at("08:00"), end: at("09:00") },
        { start: at("08:30"), end: at("09:30") },
        { start: at("09:00"), end: at("10:00") },
      ],
      at("08:30"),
      at("09:30"),
    );

    expect(maxConcurrent).toBe(2);
  });

  it("treats touching end and start times as non-overlapping", () => {
    expect(intervalsOverlap(at("08:00"), at("09:00"), at("09:00"), at("10:00"))).toBe(false);
  });
});
