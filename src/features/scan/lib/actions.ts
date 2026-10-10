"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { isValidBarcode } from "@/features/products/lib/barcode";
import { findProductByBarcode } from "@/features/products/lib/queries";

export type LookupResult =
  | { ok: true; product: { id: string; name: string; brand: string | null } | null }
  | { ok: false; error: string };

export async function lookupBarcode(barcode: string): Promise<LookupResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Du må være logget inn" };

  const value = barcode.trim();
  if (!isValidBarcode(value)) {
    return { ok: false, error: "Strekkode må være 8 til 14 siffer" };
  }

  return { ok: true, product: await findProductByBarcode(value) };
}
