"use server";

import type { Store } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/features/auth/lib/auth";
import { requireCatalogueEditor } from "@/features/auth/lib/require-catalogue-editor";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { parsePriceToOre } from "./parse-price";
import { isImplausiblePrice, medianPrice } from "./plausibility";
import { findLatestPricesPerStore, findStorePreferences } from "./queries";
import type { StorePreferences } from "./store-preferences";
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

export async function hideReport(reportId: string) {
  const session = await requireCatalogueEditor();
  const report = await db.priceReport.update({
    where: { id: reportId },
    data: { hiddenAt: new Date(), hiddenById: session.user.id },
    select: { productId: true },
  });
  revalidateReportViews(report.productId);
}

export async function restoreReport(reportId: string) {
  await requireCatalogueEditor();
  const report = await db.priceReport.update({
    where: { id: reportId },
    data: { hiddenAt: null, hiddenById: null },
    select: { productId: true },
  });
  revalidateReportViews(report.productId);
}

function revalidateReportViews(productId: string) {
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/shopping-list");
  revalidatePath("/search");
}

export async function loadStorePreferences(): Promise<StorePreferences | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return findStorePreferences(session.user.id);
}

export async function toggleFavouriteStore(store: string): Promise<Store[] | null> {
  const session = await getServerSession(authOptions);
  if (!session || !isStore(store)) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { favouriteStores: true },
  });
  const current = user?.favouriteStores ?? [];
  const favouriteStores = current.includes(store)
    ? current.filter((s) => s !== store)
    : [...current, store];
  await db.user.update({
    where: { id: session.user.id },
    data: { favouriteStores },
  });
  return favouriteStores;
}
