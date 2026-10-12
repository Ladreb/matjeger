import { Prisma } from "@prisma/client";
import { priceAreaOf } from "./price-area";

export function inPriceArea(postalCodeColumn: Prisma.Sql, ownPostalCode: string) {
  const { from, to } = priceAreaOf(ownPostalCode);
  return Prisma.sql`${postalCodeColumn} BETWEEN ${from} AND ${to}`;
}

// Sorts the user's own postal code before the rest of the area, so a chain with an own price never shows an area price.
export function ownPostalCodeFirst(postalCodeColumn: Prisma.Sql, ownPostalCode: string) {
  return Prisma.sql`(${postalCodeColumn} = ${ownPostalCode}) DESC`;
}
