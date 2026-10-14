import { Prisma } from "@prisma/client";
import { inPriceArea, ownPostalCodeFirst } from "@/features/location/lib/price-area-sql";

// The newest visible per-unit report per store chain for one product (DECISIONS #2, #3, #7): the user's own postal code wins,
// a store chain without one gets the newest report from the postal code area. Without a postal code it selects nothing.
// A fragment, so search can run it inside its own query instead of costing a round trip per result.
// The store column stays an enum so callers that sort on it keep the order of the Store enum.
export function latestPricesPerStoreSql(productId: Prisma.Sql, postalCode: string | null | undefined) {
  const postalCodeColumn = Prisma.sql`r."postalCode"`;
  const inArea = postalCode ? inPriceArea(postalCodeColumn, postalCode) : Prisma.sql`FALSE`;
  // A constant here would be read by Postgres as a column position, so with no postal code the term is left out.
  const ownFirst = postalCode ? Prisma.sql`${ownPostalCodeFirst(postalCodeColumn, postalCode)}, ` : Prisma.empty;
  return Prisma.sql`
    SELECT DISTINCT ON (r.store) r.id, r.store, r.price, r."reportedAt", r."postalCode"
    FROM "PriceReport" r
    WHERE r."productId" = ${productId}
      AND ${inArea}
      AND r."priceUnit" = 'PER_UNIT'
      AND r."hiddenAt" IS NULL
    ORDER BY r.store, ${ownFirst}r."reportedAt" DESC, r.id DESC`;
}
