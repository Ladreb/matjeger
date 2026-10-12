import type { Store } from "@prisma/client";
import { STORE_LABELS, STORES } from "./stores";

const MAX_NAMED = 3;

export function describeMissingStores(pricedStores: Store[]): string | null {
  const missing = STORES.filter((store) => !pricedStores.includes(store)).map(
    (store) => STORE_LABELS[store],
  );
  if (missing.length === 0) return null;
  if (missing.length > MAX_NAMED) {
    const named = missing.slice(0, MAX_NAMED).join(", ");
    return `Ingen pris ennå for ${named} og ${missing.length - MAX_NAMED} til.`;
  }
  if (missing.length === 1) return `Ingen pris ennå for ${missing[0]}.`;
  const last = missing[missing.length - 1];
  return `Ingen pris ennå for ${missing.slice(0, -1).join(", ")} og ${last}.`;
}
