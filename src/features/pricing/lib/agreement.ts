import type { Store } from "@prisma/client";

type RecentReport = {
  id: string;
  store: Store;
  price: number;
  reportedById: string | null;
};

export function countAgreeingReporters(
  store: Store,
  price: number,
  recentReports: RecentReport[],
): number {
  const reporters = new Set(
    recentReports
      .filter((report) => report.store === store && report.price === price)
      .map((report) => report.reportedById ?? report.id),
  );
  return reporters.size;
}
