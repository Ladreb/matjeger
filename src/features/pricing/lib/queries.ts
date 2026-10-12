import { db } from "@/lib/db";
import { buildStorePreferences } from "./store-preferences";

export function findLatestPricesPerStore(
  productId: string,
  postalCode: string,
) {
  return db.priceReport.findMany({
    where: { productId, postalCode, hiddenAt: null },
    orderBy: [{ reportedAt: "desc" }, { id: "desc" }],
    distinct: ["store"],
    select: { id: true, store: true, price: true, reportedAt: true },
  });
}

export const ADMIN_REPORT_LIMIT = 20;

export function findRecentReports(productId: string) {
  return db.priceReport.findMany({
    where: { productId },
    orderBy: [{ reportedAt: "desc" }, { id: "desc" }],
    take: ADMIN_REPORT_LIMIT,
    select: {
      id: true,
      store: true,
      price: true,
      priceUnit: true,
      postalCode: true,
      reportedAt: true,
      hiddenAt: true,
      reportedBy: { select: { name: true } },
    },
  });
}

export async function findStorePreferences(userId: string) {
  const [user, usage] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { favouriteStores: true },
    }),
    db.priceReport.groupBy({
      by: ["store"],
      where: { reportedById: userId },
      _count: { _all: true },
      _max: { reportedAt: true },
    }),
  ]);
  return buildStorePreferences(
    user?.favouriteStores ?? [],
    usage.flatMap((row) =>
      row._max.reportedAt
        ? [{ store: row.store, reports: row._count._all, lastReportedAt: row._max.reportedAt }]
        : [],
    ),
  );
}
