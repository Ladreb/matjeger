"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { isValidPostalCode } from "./postal-code";

type Result = { ok: true; postalCode: string } | { ok: false; error: string };

export async function savePostalCode(postalCode: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Du må være logget inn" };

  const value = postalCode.trim();
  if (!isValidPostalCode(value)) {
    return { ok: false, error: "Postnummer må være 4 siffer" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { postalCode: value },
  });
  revalidatePath("/", "layout");
  return { ok: true, postalCode: value };
}

/** Look up the postal code for a position using Kartverket's open address API. */
export async function postalCodeFromPosition(
  lat: number,
  lon: number,
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Du må være logget inn" };
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { ok: false, error: "Ugyldig posisjon" };
  }

  try {
    const url = `https://ws.geonorge.no/adresser/v1/punktsok?lat=${lat}&lon=${lon}&radius=1000&treffPerSide=1`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      adresser?: { postnummer?: string }[];
    };
    const found = data.adresser?.[0]?.postnummer;
    if (!found || !isValidPostalCode(found)) {
      return { ok: false, error: "Fant ikke postnummer for posisjonen din" };
    }
    return savePostalCode(found);
  } catch {
    return { ok: false, error: "Kunne ikke slå opp posisjonen din" };
  }
}
