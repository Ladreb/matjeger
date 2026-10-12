import type { Store } from "@prisma/client";

export type RecentReport = {
  id: string;
  store: Store;
  price: number;
  reportedById: string | null;
  reportedAt: Date;
};

export function countAgreeingReporters(
  store: Store,
  price: number,
  recentReports: RecentReport[],
): number {
  const newestFirst = [...recentReports].sort(
    (a, b) =>
      b.reportedAt.getTime() - a.reportedAt.getTime() || b.id.localeCompare(a.id),
  );
  const newestPriceByReporter = new Map<string, number>();
  for (const report of newestFirst) {
    if (report.store !== store) continue;
    const reporter = report.reportedById ?? report.id;
    if (!newestPriceByReporter.has(reporter)) {
      newestPriceByReporter.set(reporter, report.price);
    }
  }
  return [...newestPriceByReporter.values()].filter((p) => p === price).length;
}
