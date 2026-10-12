import { db } from "@/lib/db";

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
