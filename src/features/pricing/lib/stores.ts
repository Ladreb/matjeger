import type { Store } from "@prisma/client";

export const STORE_LABELS: Record<Store, string> = {
  REMA_1000: "Rema 1000",
  KIWI: "Kiwi",
  SPAR: "Spar",
  MENY: "Meny",
  COOP_EXTRA: "Coop Extra",
  COOP_OBS: "Coop Obs",
  COOP_PRIX: "Coop Prix",
  BUNNPRIS: "Bunnpris",
  ODA: "Oda",
};

export const STORES = Object.keys(STORE_LABELS) as Store[];

export function isStore(value: string): value is Store {
  return Object.hasOwn(STORE_LABELS, value);
}
