import type { Store } from "@prisma/client";

type StorePrice = { store: Store; price: number; reportedAt: Date };

export function findCheapest<T extends StorePrice>(prices: T[]): T | null {
  let cheapest: T | null = null;
  for (const entry of prices) {
    if (cheapest === null || entry.price < cheapest.price) cheapest = entry;
  }
  return cheapest;
}

export type ShownPrice = StorePrice & { isNearby: boolean };

// A reported price is in the user's own postal code, so it replaces a nearby price or an older price for the same chain even when higher.
export function cheapestAfterReport(
  current: ShownPrice | null,
  store: Store,
  price: number,
  reportedAt: Date,
): ShownPrice | null {
  const replaces =
    !current || current.isNearby || current.store === store || price < current.price;
  return replaces ? { store, price, reportedAt, isNearby: false } : current;
}
