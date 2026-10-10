"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { parsePriceToOre } from "./parse-price";
import { isStore } from "./stores";

export type ReportPriceState =
  | { ok: true; message: string }
  | { ok: false; message: string; values?: { store: string; price: string } }
  | null;

export async function reportPrice(
  productId: string,
  _previous: ReportPriceState,
  formData: FormData,
): Promise<ReportPriceState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, message: "Du må være logget inn" };

  const values = {
    store: String(formData.get("store") ?? ""),
    price: String(formData.get("price") ?? ""),
  };
  const { store } = values;
  if (!isStore(store)) {
    return { ok: false, message: "Velg en butikkjede", values };
  }

  const price = parsePriceToOre(values.price);
  if (price === null) {
    return {
      ok: false,
      message: "Skriv inn en pris med siffer og komma, for eksempel 29,90",
      values,
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { postalCode: true },
  });
  if (!user?.postalCode) {
    return { ok: false, message: "Lagre postnummeret ditt først", values };
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return { ok: false, message: "Fant ikke produktet", values };
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
  } catch (error) {
    console.error("reportPrice failed", error);
    return {
      ok: false,
      message: "Kunne ikke lagre prisen. Prøv igjen.",
      values,
    };
  }

  revalidatePath(`/products/${productId}`);
  return { ok: true, message: "Takk! Prisen er rapportert." };
}
