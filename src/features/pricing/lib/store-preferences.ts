import type { Store } from "@prisma/client";
import { STORES } from "./stores";

export type StoreUsage = { store: Store; reports: number; lastReportedAt: Date };

export type StorePreferences = {
  orderedStores: Store[];
  favouriteStores: Store[];
  lastUsedStore: Store | null;
};

export function buildStorePreferences(
  favouriteStores: Store[],
  usage: StoreUsage[],
): StorePreferences {
  const reportsPerStore = new Map(usage.map((u) => [u.store, u.reports]));
  const isFavourite = (store: Store) => favouriteStores.includes(store);
  const reports = (store: Store) => reportsPerStore.get(store) ?? 0;

  const orderedStores = [...STORES].sort(
    (a, b) =>
      Number(isFavourite(b)) - Number(isFavourite(a)) ||
      reports(b) - reports(a),
  );

  const lastUsed = usage.reduce<StoreUsage | null>(
    (latest, u) =>
      !latest || u.lastReportedAt > latest.lastReportedAt ? u : latest,
    null,
  );

  return {
    orderedStores,
    favouriteStores,
    lastUsedStore: lastUsed?.store ?? null,
  };
}
