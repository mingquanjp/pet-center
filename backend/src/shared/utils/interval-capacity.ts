export type TimeInterval = {
  start: Date;
  end: Date;
};

export function getMaxConcurrentIntervals(
  intervals: TimeInterval[],
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const events: Array<{ time: number; delta: number }> = [];

  for (const interval of intervals) {
    const start = Math.max(interval.start.getTime(), rangeStart.getTime());
    const end = Math.min(interval.end.getTime(), rangeEnd.getTime());

    if (start >= end) continue;

    events.push({ time: start, delta: 1 });
    events.push({ time: end, delta: -1 });
  }

  events.sort((left, right) => left.time - right.time || left.delta - right.delta);

  let concurrent = 0;
  let maxConcurrent = 0;

  for (const event of events) {
    concurrent += event.delta;
    maxConcurrent = Math.max(maxConcurrent, concurrent);
  }

  return maxConcurrent;
}

export function intervalsOverlap(
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date,
): boolean {
  return leftStart < rightEnd && leftEnd > rightStart;
}
