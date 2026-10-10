"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { parsePriceToOre } from "./parse-price";
import { isStore } from "./stores";

export type ReportPriceState = { ok: boolean; message: string } | null;

export async function reportPrice(
  productId: string,
  _previous: ReportPriceState,
  formData: FormData,
): Promise<ReportPriceState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, message: "Du må være logget inn" };

  const store = String(formData.get("store") ?? "");
  if (!isStore(store)) return { ok: false, message: "Velg en butikkjede" };

  const price = parsePriceToOre(String(formData.get("price") ?? ""));
  if (price === null) {
    return { ok: false, message: "Skriv inn en pris, for eksempel 29,90" };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { postalCode: true },
  });
  if (!user?.postalCode) {
    return { ok: false, message: "Lagre postnummeret ditt først" };
  }

  try {
    await db.priceReport.create({
      data: {
        productId,
        store,
        price,
        postalCode: user.postalCode,
        reportedById: session.user.id,
      },
    });
  } catch {
    return { ok: false, message: "Kunne ikke lagre prisen. Prøv igjen." };
  }

  revalidatePath(`/products/${productId}`);
  return { ok: true, message: "Takk! Prisen er rapportert." };
}
