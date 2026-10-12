"use server";

import type { Store } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { parsePriceToOre } from "./parse-price";
import { isImplausiblePrice, medianPrice } from "./plausibility";
import { findLatestPricesPerStore } from "./queries";
import { isStore } from "./stores";

export type ReportPriceInput = {
  store: string;
  price: string;
  confirmed: boolean;
};

export type ReportPriceResult =
  | { status: "saved"; store: Store; price: number; message: string }
  | { status: "needs-confirmation"; message: string }
  | { status: "error"; message: string };

export async function reportPrice(
  productId: string,
  input: ReportPriceInput,
): Promise<ReportPriceResult> {

  const session = await getServerSession(authOptions);
  if (!session) return { status: "error", message: "Du må være logget inn" };

  const { store } = input;
  if (!isStore(store)) {
    return { status: "error", message: "Velg en butikkjede" };
  }

  const price = parsePriceToOre(input.price);
  if (price === null) {
    return {
      status: "error",
      message: "Skriv inn en pris med siffer og komma, for eksempel 29,90",
    };
  }
  if (price === 0) {
    return { status: "error", message: "Prisen må være over 0" };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { postalCode: true },
  });
  if (!user?.postalCode) {
    return { status: "error", message: "Lagre postnummeret ditt først" };
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return { status: "error", message: "Fant ikke produktet" };
  }

  if (!input.confirmed) {
    const knownPrices = (
      await findLatestPricesPerStore(productId, user.postalCode)
    ).map((report) => report.price);
    if (isImplausiblePrice(price, knownPrices)) {
      return {
        status: "needs-confirmation",
        message: `Er du sikker? ${formatPrice(price)} er langt fra de andre prisene (rundt ${formatPrice(medianPrice(knownPrices) ?? 0)}).`,
      };
    }
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
    return { status: "error", message: "Kunne ikke lagre prisen. Prøv igjen." };
  }

  revalidatePath(`/products/${productId}`);
  return { status: "saved", store, price, message: "Takk! Prisen er rapportert." };
}
