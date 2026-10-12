"use server";

import type { Store } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { isValidBarcode } from "@/features/products/lib/barcode";
import { findCheapest } from "@/features/pricing/lib/cheapest";
import { findLatestPricesPerStore } from "@/features/pricing/lib/queries";
import { findProductByBarcode } from "@/features/products/lib/queries";
import { isOnList } from "@/features/shopping-list/lib/queries";

export type ScannedProduct = {
  id: string;
  name: string;
  brand: string | null;
  onList: boolean;
  cheapest: { store: Store; price: number; reportedAt: Date } | null;
};

export type LookupResult =
  | { ok: true; product: ScannedProduct | null; postalCode: string | null }
  | { ok: false; error: string };

export async function lookupBarcode(barcode: string): Promise<LookupResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Du må være logget inn" };

  const value = barcode.trim();
  if (!isValidBarcode(value)) {
    return { ok: false, error: "Strekkode må være 8 til 14 siffer" };
  }

  const product = await findProductByBarcode(value);
  const postalCode = session.user.postalCode;
  if (!product) return { ok: true, product: null, postalCode };

  const [prices, onList] = await Promise.all([
    postalCode ? findLatestPricesPerStore(product.id, postalCode) : [],
    isOnList(session.user.id, product.id),
  ]);
  return {
    ok: true,
    product: { ...product, onList, cheapest: findCheapest(prices) },
    postalCode,
  };
}
