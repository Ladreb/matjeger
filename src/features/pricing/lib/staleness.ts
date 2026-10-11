export const STALE_AFTER_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSince(date: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY));
}

export function isStale(reportedAt: Date, now: Date = new Date()): boolean {
  return daysSince(reportedAt, now) > STALE_AFTER_DAYS;
}

export function formatStaleAge(reportedAt: Date, now: Date = new Date()): string {
  return `Gammel pris, rapportert for ${daysSince(reportedAt, now)} dager siden`;
}
