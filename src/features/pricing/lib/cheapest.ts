import type { Store } from "@prisma/client";

type StorePrice = { store: Store; price: number; reportedAt: Date };

export function findCheapest<T extends StorePrice>(prices: T[]): T | null {
  let cheapest: T | null = null;
  for (const entry of prices) {
    if (cheapest === null || entry.price < cheapest.price) cheapest = entry;
  }
  return cheapest;
}
