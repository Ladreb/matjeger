import type { PriceUnit, Store } from "@prisma/client";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { findLatestPricesPerStore } from "@/features/pricing/lib/queries";
import { db } from "@/lib/db";
import { searchProducts } from "./queries";

const NO_USER = "nobody";
const productIds: string[] = [];
let productCount = 0;

afterEach(async () => {
  vi.restoreAllMocks();
  await db.priceReport.deleteMany({ where: { productId: { in: productIds } } });
  await db.product.deleteMany({ where: { id: { in: productIds } } });
  productIds.length = 0;
});

afterAll(() => db.$disconnect());

async function newProduct() {
  const word = `kvikk${++productCount}`;
  const product = await db.product.create({ data: { name: `${word} testvare` } });
  productIds.push(product.id);
  return { id: product.id, word };
}

type ReportOverrides = Partial<{
  id: string;
  store: Store;
  postalCode: string;
  price: number;
  priceUnit: PriceUnit;
  reportedAt: Date;
  hiddenAt: Date | null;
}>;

function report(productId: string, overrides: ReportOverrides = {}) {
  return db.priceReport.create({
    data: {
      productId,
      store: "KIWI",
      postalCode: "0150",
      price: 2000,
      reportedAt: new Date("2026-10-01T10:00:00Z"),
      ...overrides,
    },
  });
}

async function searchFor(word: string, postalCode: string | null) {
  const results = await searchProducts(word, NO_USER, postalCode);
  expect(results).toHaveLength(1);
  return results[0];
}

describe("searchProducts cheapest price", () => {
  it("is the lowest of the latest price per store chain", async () => {
    const { id, word } = await newProduct();
    await report(id, { store: "KIWI", price: 1000, reportedAt: new Date("2026-09-01") });
    await report(id, { store: "KIWI", price: 3000, reportedAt: new Date("2026-10-01") });
    await report(id, { store: "MENY", price: 2500 });

    const result = await searchFor(word, "0150");

    expect(result).toMatchObject({ cheapestPrice: 2500, cheapestStore: "MENY" });
  });

  it("ignores a hidden report and uses the previous visible one", async () => {
    const { id, word } = await newProduct();
    await report(id, { price: 2000, reportedAt: new Date("2026-09-01") });
    await report(id, { price: 100, reportedAt: new Date("2026-10-01"), hiddenAt: new Date() });

    const result = await searchFor(word, "0150");

    expect(result.cheapestPrice).toBe(2000);
  });

  it("ignores per-kg reports", async () => {
    const { id, word } = await newProduct();
    await report(id, { store: "KIWI", price: 100, priceUnit: "PER_KG" });
    await report(id, { store: "MENY", price: 2500 });

    const result = await searchFor(word, "0150");

    expect(result).toMatchObject({ cheapestPrice: 2500, cheapestStore: "MENY" });
  });

  it("prefers the own postal code over a newer, cheaper report from the area", async () => {
    const { id, word } = await newProduct();
    await report(id, { postalCode: "0151", price: 2100, reportedAt: new Date("2026-09-01") });
    await report(id, { postalCode: "0182", price: 1500, reportedAt: new Date("2026-10-01") });

    const result = await searchFor(word, "0151");

    expect(result).toMatchObject({ cheapestPrice: 2100, cheapestAreaLabel: null });
  });

  it("marks an area price with the label of the postal code area", async () => {
    const { id, word } = await newProduct();
    await report(id, { store: "MENY", postalCode: "0182", price: 2600 });

    const result = await searchFor(word, "0151");

    expect(result).toMatchObject({ cheapestPrice: 2600, cheapestAreaLabel: "01xx" });
  });

  it("has no price from outside the postal code area", async () => {
    const { id, word } = await newProduct();
    await report(id, { postalCode: "0250" });

    const result = await searchFor(word, "0151");

    expect(result).toMatchObject({ cheapestPrice: null, cheapestStore: null, cheapestAreaLabel: null });
  });

  it("has no price without a postal code", async () => {
    const { id, word } = await newProduct();
    await report(id);

    const result = await searchFor(word, null);

    expect(result).toMatchObject({ cheapestPrice: null, cheapestStore: null, cheapestAreaLabel: null });
  });

  it("picks the same report when two reports have the same time", async () => {
    const { id, word } = await newProduct();
    const reportedAt = new Date("2026-10-01T10:00:00Z");
    await report(id, { id: "report-a", price: 2000, reportedAt });
    await report(id, { id: "report-b", price: 2100, reportedAt });

    const result = await searchFor(word, "0150");

    expect(result.cheapestPrice).toBe(2100);
  });

  it("is the cheapest of the prices the product page shows", async () => {
    const { id, word } = await newProduct();
    await report(id, { store: "KIWI", postalCode: "0151", price: 2400 });
    await report(id, { store: "KIWI", postalCode: "0182", price: 1900, reportedAt: new Date("2026-10-02") });
    await report(id, { store: "MENY", postalCode: "0182", price: 2200 });
    await report(id, { store: "SPAR", postalCode: "0151", price: 100, priceUnit: "PER_KG" });
    await report(id, { store: "REMA_1000", postalCode: "0151", price: 9900, hiddenAt: new Date() });

    const result = await searchFor(word, "0151");
    const pagePrices = await findLatestPricesPerStore(id, "0151");
    const cheapestOnPage = [...pagePrices].sort((a, b) => a.price - b.price)[0];

    expect(result).toMatchObject({
      cheapestPrice: cheapestOnPage.price,
      cheapestStore: cheapestOnPage.store,
      cheapestAreaLabel: cheapestOnPage.areaLabel,
    });
  });

  it("is found in the same query that finds the results", async () => {
    const { id, word } = await newProduct();
    await report(id);
    const queryRaw = vi.spyOn(db, "$queryRaw");

    await searchFor(word, "0150");

    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
