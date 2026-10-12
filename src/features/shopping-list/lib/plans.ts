import type { Store } from "@prisma/client";
import { isStale } from "@/features/pricing/lib/staleness";
import { STORE_LABELS } from "@/features/pricing/lib/stores";

export type ListEntry = { productId: string; quantity: number };

export type StorePrice = {
  productId: string;
  store: Store;
  price: number;
  reportedAt: Date;
  isNearby: boolean;
};

export type PlanLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  reportedAt: Date;
  isStale: boolean;
  isNearby: boolean;
};

export type PlanStop = { store: Store; lines: PlanLine[]; total: number };

export type Plan = {
  stops: PlanStop[];
  uncoveredProductIds: string[];
  total: number;
  staleLineCount: number;
  nearbyLineCount: number;
};

export type PlanResult = { plans: Plan[]; unpricedProductIds: string[] };

type PricesByStore = Map<Store, Map<string, StorePrice>>;

function compareStores(a: Store, b: Store): number {
  return STORE_LABELS[a].localeCompare(STORE_LABELS[b], "nb");
}

function groupByStore(prices: StorePrice[]): PricesByStore {
  const byStore: PricesByStore = new Map();
  for (const entry of prices) {
    const forStore = byStore.get(entry.store) ?? new Map();
    forStore.set(entry.productId, entry);
    byStore.set(entry.store, forStore);
  }
  return byStore;
}

function buildStop(
  store: Store,
  entries: ListEntry[],
  prices: Map<string, StorePrice>,
  now: Date,
): PlanStop {
  const lines = entries.map(({ productId, quantity }) => {
    const { price, reportedAt, isNearby } = prices.get(productId)!;
    return {
      productId,
      quantity,
      unitPrice: price,
      lineTotal: price * quantity,
      reportedAt,
      isStale: isStale(reportedAt, now),
      isNearby,
    };
  });
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { store, lines, total };
}

function costOf(entries: ListEntry[], prices: Map<string, StorePrice>): number {
  return entries.reduce(
    (sum, { productId, quantity }) => sum + prices.get(productId)!.price * quantity,
    0,
  );
}

function pickExtraStore(
  gaps: ListEntry[],
  base: Store,
  pricesByStore: PricesByStore,
): { store: Store; covered: ListEntry[] } {
  const candidates = [...pricesByStore]
    .filter(([store]) => store !== base)
    .map(([store, prices]) => {
      const covered = gaps.filter((gap) => prices.has(gap.productId));
      return { store, covered, cost: costOf(covered, prices) };
    })
    .filter((candidate) => candidate.covered.length > 0);

  candidates.sort(
    (a, b) =>
      b.covered.length - a.covered.length ||
      a.cost - b.cost ||
      compareStores(a.store, b.store),
  );
  return candidates[0];
}

function buildPlan(
  base: Store,
  remaining: ListEntry[],
  pricesByStore: PricesByStore,
  now: Date,
): Plan {
  const basePrices = pricesByStore.get(base)!;
  const baseItems = remaining.filter((entry) => basePrices.has(entry.productId));
  const gaps = remaining.filter((entry) => !basePrices.has(entry.productId));

  const stops = [buildStop(base, baseItems, basePrices, now)];
  let uncovered = gaps;
  if (gaps.length > 0) {
    const extra = pickExtraStore(gaps, base, pricesByStore);
    stops.push(
      buildStop(extra.store, extra.covered, pricesByStore.get(extra.store)!, now),
    );
    uncovered = gaps.filter((gap) => !extra.covered.includes(gap));
  }

  return {
    stops,
    uncoveredProductIds: uncovered.map((entry) => entry.productId),
    total: stops.reduce((sum, stop) => sum + stop.total, 0),
    staleLineCount: stops
      .flatMap((stop) => stop.lines)
      .filter((line) => line.isStale).length,
    nearbyLineCount: stops
      .flatMap((stop) => stop.lines)
      .filter((line) => line.isNearby).length,
  };
}

function tripKey(plan: Plan): string {
  return plan.stops
    .map((stop) => `${stop.store}:${stop.lines.map((l) => l.productId).sort()}`)
    .sort()
    .join("|");
}

function comparePlans(a: Plan, b: Plan): number {
  return (
    a.uncoveredProductIds.length - b.uncoveredProductIds.length ||
    a.total - b.total ||
    a.stops.length - b.stops.length ||
    compareStores(a.stops[0].store, b.stops[0].store)
  );
}

export function computePlans(
  items: ListEntry[],
  prices: StorePrice[],
  now: Date = new Date(),
): PlanResult {
  const pricesByStore = groupByStore(prices);
  const pricedProductIds = new Set(prices.map((entry) => entry.productId));
  const remaining = items.filter((item) => pricedProductIds.has(item.productId));
  const unpricedProductIds = items
    .filter((item) => !pricedProductIds.has(item.productId))
    .map((item) => item.productId);

  const plans = [...pricesByStore.keys()]
    .map((base) => buildPlan(base, remaining, pricesByStore, now))
    .filter((plan) => plan.stops[0].lines.length > 0)
    .sort(comparePlans);

  const seenTrips = new Set<string>();
  const uniquePlans = plans.filter((plan) => {
    const key = tripKey(plan);
    if (seenTrips.has(key)) return false;
    seenTrips.add(key);
    return true;
  });

  return { plans: uniquePlans, unpricedProductIds };
}

export const VISIBLE_PLAN_COUNT = 3;

export function maxSaving(plans: Plan[]): number | null {
  const totals = plans
    .filter((plan) => plan.uncoveredProductIds.length === 0)
    .map((plan) => plan.total);
  if (totals.length < 2) return null;
  const gap = Math.max(...totals) - Math.min(...totals);
  return gap > 0 ? gap : null;
}
