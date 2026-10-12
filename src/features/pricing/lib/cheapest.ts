import type { Store } from "@prisma/client";

type StorePrice = { store: Store; price: number };

export function findCheapest(prices: StorePrice[]): StorePrice | null {
  let cheapest: StorePrice | null = null;
  for (const entry of prices) {
    if (cheapest === null || entry.price < cheapest.price) cheapest = entry;
  }
  return cheapest && { store: cheapest.store, price: cheapest.price };
}
