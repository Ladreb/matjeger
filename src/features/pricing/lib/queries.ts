import { db } from "@/lib/db";

export function findLatestPricesPerStore(
  productId: string,
  postalCode: string,
) {
  return db.priceReport.findMany({
    where: { productId, postalCode },
    orderBy: [{ reportedAt: "desc" }, { id: "desc" }],
    distinct: ["store"],
    select: { id: true, store: true, price: true, reportedAt: true },
  });
}
