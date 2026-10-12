import type { Store } from "@prisma/client";
import { STORE_LABELS } from "@/features/pricing/lib/stores";
import { formatPrice } from "@/lib/utils";

export function splitByMatch<T extends { isSimilarMatch: boolean }>(
  results: T[],
): { matches: T[]; similar: T[] } {
  return {
    matches: results.filter((result) => !result.isSimilarMatch),
    similar: results.filter((result) => result.isSimilarMatch),
  };
}

export function cheapestPriceLabel(
  price: number | null,
  store: Store | null,
): string | null {
  if (price === null || store === null) return null;
  return `fra ${formatPrice(price)} hos ${STORE_LABELS[store]}`;
}
