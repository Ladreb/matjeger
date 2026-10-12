import { Prisma, type Store } from "@prisma/client";
import { STALE_AFTER_DAYS } from "@/features/pricing/lib/staleness";
import { db } from "@/lib/db";
import {
  DASHBOARD_PAGE_SIZE,
  isBarcodeSearch,
  type DashboardFilter,
} from "./dashboard";

export type DashboardProduct = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  pluCode: string | null;
  chains: number;
  cheapestPrice: number | null;
  cheapestStore: Store | null;
  ageDays: number | null;
};

export type DashboardPage = {
  products: DashboardProduct[];
  total: number;
};

export type FilterCounts = Record<DashboardFilter, number>;

export type UnknownBarcode = {
  barcode: string;
  count: number;
  lastSeenDays: number;
};

const UNKNOWN_BARCODE_LIMIT = 100;

// Admins curate the whole catalogue, so every postal code counts. The latest report per product, chain and postal code is the current price (DECISIONS #2).
// The cheapest price skips per-kg reports, so it is never compared with a per-unit price.
const dashboardRows = Prisma.sql`
  WITH latest AS (
    SELECT DISTINCT ON (r."productId", r.store, r."postalCode")
      r."productId", r.store, r.price, r."priceUnit", r."reportedAt"
    FROM "PriceReport" r
    ORDER BY r."productId", r.store, r."postalCode", r."reportedAt" DESC, r.id DESC
  ),
  stats AS (
    SELECT "productId", count(DISTINCT store)::int AS chains, max("reportedAt") AS "lastReportedAt"
    FROM latest
    GROUP BY "productId"
  ),
  cheapest AS (
    SELECT DISTINCT ON ("productId") "productId", price, store::text AS store
    FROM latest
    WHERE "priceUnit" = 'PER_UNIT'
    ORDER BY "productId", price, store
  ),
  dashboard AS (
    SELECT p.id, p.name, p.brand, p.barcode, p."pluCode",
      coalesce(s.chains, 0) AS chains,
      c.price AS "cheapestPrice",
      c.store AS "cheapestStore",
      floor(extract(epoch FROM now() - s."lastReportedAt") / 86400)::int AS "ageDays"
    FROM "Product" p
    LEFT JOIN stats s ON s."productId" = p.id
    LEFT JOIN cheapest c ON c."productId" = p.id
  )
`;

const filterConditions: Record<DashboardFilter, Prisma.Sql> = {
  all: Prisma.sql`true`,
  "no-prices": Prisma.sql`chains = 0`,
  // Products without reports are only under "no-prices", so the two chips never count the same product.
  "old-prices": Prisma.sql`"ageDays" > ${STALE_AFTER_DAYS}`,
  "no-brand": Prisma.sql`coalesce(btrim(brand), '') = ''`,
};

function searchCondition(query: string) {
  if (!query) return Prisma.sql`true`;
  if (isBarcodeSearch(query)) {
    return Prisma.sql`(barcode = ${query} OR "pluCode" = ${query})`;
  }
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  return Prisma.sql`(name ILIKE ${pattern} OR brand ILIKE ${pattern} OR barcode ILIKE ${pattern} OR "pluCode" ILIKE ${pattern})`;
}

type DashboardRow = Omit<DashboardProduct, "cheapestStore"> & {
  cheapestStore: string | null;
  total: number;
};

export async function listDashboardProducts(
  query: string,
  filter: DashboardFilter,
  page: number,
): Promise<DashboardPage> {
  const rows = await db.$queryRaw<DashboardRow[]>(Prisma.sql`
    ${dashboardRows}
    SELECT *, count(*) OVER ()::int AS total
    FROM dashboard
    WHERE ${filterConditions[filter]} AND ${searchCondition(query)}
    ORDER BY lower(name), id
    LIMIT ${DASHBOARD_PAGE_SIZE} OFFSET ${(page - 1) * DASHBOARD_PAGE_SIZE}
  `);
  return {
    total: rows[0]?.total ?? 0,
    products: rows.map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      barcode: row.barcode,
      pluCode: row.pluCode,
      chains: row.chains,
      cheapestPrice: row.cheapestPrice,
      cheapestStore: row.cheapestStore as Store | null,
      ageDays: row.ageDays,
    })),
  };
}

export async function countDashboardFilters(): Promise<FilterCounts> {
  const [row] = await db.$queryRaw<
    { all: number; noPrices: number; oldPrices: number; noBrand: number }[]
  >(Prisma.sql`
    ${dashboardRows}
    SELECT count(*)::int AS "all",
      (count(*) FILTER (WHERE ${filterConditions["no-prices"]}))::int AS "noPrices",
      (count(*) FILTER (WHERE ${filterConditions["old-prices"]}))::int AS "oldPrices",
      (count(*) FILTER (WHERE ${filterConditions["no-brand"]}))::int AS "noBrand"
    FROM dashboard
  `);
  return {
    all: row.all,
    "no-prices": row.noPrices,
    "old-prices": row.oldPrices,
    "no-brand": row.noBrand,
  };
}

// No cleanup job: a scan leaves the list as soon as a product has its barcode.
const openUnknownBarcodes = Prisma.sql`
  FROM "UnknownBarcodeScan" u
  WHERE u."dismissedAt" IS NULL
    AND NOT EXISTS (SELECT 1 FROM "Product" p WHERE p.barcode = u.barcode)
`;

export async function listUnknownBarcodes(): Promise<UnknownBarcode[]> {
  return db.$queryRaw<UnknownBarcode[]>(Prisma.sql`
    SELECT u.barcode, u.count, floor(extract(epoch FROM now() - u."lastSeenAt") / 86400)::int AS "lastSeenDays"
    ${openUnknownBarcodes}
    ORDER BY u.count DESC, u."lastSeenAt" DESC, u.barcode
    LIMIT ${UNKNOWN_BARCODE_LIMIT}
  `);
}

export async function countUnknownBarcodes(): Promise<number> {
  const [row] = await db.$queryRaw<{ count: number }[]>(Prisma.sql`
    SELECT count(*)::int AS count ${openUnknownBarcodes}
  `);
  return row.count;
}
