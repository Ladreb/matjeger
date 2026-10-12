import { Prisma, type Store } from "@prisma/client";
import { inPriceArea, ownPostalCodeFirst } from "@/features/location/lib/price-area-sql";
import { db } from "@/lib/db";
import { STALE_AFTER_DAYS } from "./staleness";
import { buildStorePreferences } from "./store-preferences";

type LatestPriceRow = {
  id: string;
  store: string;
  price: number;
  reportedAt: Date;
  postalCode: string;
};

// The user's own postal code wins per chain; a chain without one gets the newest price from the postal code area (DECISIONS #3).
export async function findLatestPricesPerStore(productId: string, postalCode: string) {
  const rows = await db.$queryRaw<LatestPriceRow[]>(Prisma.sql`
    SELECT DISTINCT ON (r.store) r.id, r.store::text AS store, r.price, r."reportedAt", r."postalCode"
    FROM "PriceReport" r
    WHERE r."productId" = ${productId}
      AND ${inPriceArea(Prisma.sql`r."postalCode"`, postalCode)}
      AND r."hiddenAt" IS NULL
    ORDER BY r.store, ${ownPostalCodeFirst(Prisma.sql`r."postalCode"`, postalCode)}, r."reportedAt" DESC, r.id DESC
  `);
  return rows.map((row) => ({ ...row, store: row.store as Store }));
}

// Exact postal code only, so the same-price count never mixes areas.
export function findRecentVisibleReports(
  productId: string,
  postalCode: string,
  now: Date = new Date(),
) {
  const since = new Date(now.getTime() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000);
  return db.priceReport.findMany({
    where: { productId, postalCode, hiddenAt: null, reportedAt: { gte: since } },
    select: {
      id: true,
      store: true,
      price: true,
      reportedById: true,
      reportedAt: true,
    },
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
