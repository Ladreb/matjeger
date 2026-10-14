import type { PriceUnit, Store } from "@prisma/client";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { findLatestPricesPerStore } from "./queries";

const productIds: string[] = [];

afterEach(async () => {
  await db.priceReport.deleteMany({ where: { productId: { in: productIds } } });
  await db.product.deleteMany({ where: { id: { in: productIds } } });
  productIds.length = 0;
});

afterAll(() => db.$disconnect());

async function newProduct() {
  const product = await db.product.create({ data: { name: "Testvare" } });
  productIds.push(product.id);
  return product.id;
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

describe("findLatestPricesPerStore", () => {
  it("returns the latest price for each store chain", async () => {
    const productId = await newProduct();
    await report(productId, { store: "KIWI", price: 2000, reportedAt: new Date("2026-09-01") });
    await report(productId, { store: "KIWI", price: 2200, reportedAt: new Date("2026-10-01") });
    await report(productId, { store: "MENY", price: 2500 });

    const prices = await findLatestPricesPerStore(productId, "0150");

    expect(prices.map((p) => [p.store, p.price]).sort()).toEqual([
      ["KIWI", 2200],
      ["MENY", 2500],
    ]);
  });

  it("ignores a hidden report and returns the previous visible one", async () => {
    const productId = await newProduct();
    await report(productId, { price: 2000, reportedAt: new Date("2026-09-01") });
    await report(productId, { price: 9900, reportedAt: new Date("2026-10-01"), hiddenAt: new Date() });

    const prices = await findLatestPricesPerStore(productId, "0150");

    expect(prices).toHaveLength(1);
    expect(prices[0].price).toBe(2000);
  });

  it("prefers the own postal code over a newer report from the postal code area", async () => {
    const productId = await newProduct();
    await report(productId, { postalCode: "0151", price: 2100, reportedAt: new Date("2026-09-01") });
    await report(productId, { postalCode: "0182", price: 1500, reportedAt: new Date("2026-10-01") });

    const prices = await findLatestPricesPerStore(productId, "0151");

    expect(prices).toHaveLength(1);
    expect(prices[0]).toMatchObject({ price: 2100, postalCode: "0151", areaLabel: null });
  });

  it("gives a store chain without an own price an area price with its label", async () => {
    const productId = await newProduct();
    await report(productId, { store: "KIWI", postalCode: "0151", price: 2100 });
    await report(productId, { store: "MENY", postalCode: "0182", price: 2600 });

    const prices = await findLatestPricesPerStore(productId, "0151");

    const byStore = Object.fromEntries(prices.map((p) => [p.store, p]));
    expect(byStore.KIWI.areaLabel).toBeNull();
    expect(byStore.MENY).toMatchObject({ price: 2600, areaLabel: "01xx" });
  });

  it("leaves out a store chain with no price in the postal code area", async () => {
    const productId = await newProduct();
    await report(productId, { store: "KIWI", postalCode: "0151" });
    await report(productId, { store: "MENY", postalCode: "0250" });

    const prices = await findLatestPricesPerStore(productId, "0151");

    expect(prices.map((p) => p.store)).toEqual(["KIWI"]);
  });

  it("ignores per-kg reports", async () => {
    const productId = await newProduct();
    await report(productId, { store: "KIWI", price: 2000, priceUnit: "PER_UNIT" });
    await report(productId, { store: "KIWI", price: 100, priceUnit: "PER_KG", reportedAt: new Date("2026-10-02") });
    await report(productId, { store: "MENY", price: 300, priceUnit: "PER_KG" });

    const prices = await findLatestPricesPerStore(productId, "0150");

    expect(prices.map((p) => [p.store, p.price])).toEqual([["KIWI", 2000]]);
  });

  it("returns a stale price with its date", async () => {
    const productId = await newProduct();
    const reportedAt = new Date("2026-01-15T08:00:00Z");
    await report(productId, { reportedAt });

    const prices = await findLatestPricesPerStore(productId, "0150");

    expect(prices[0].reportedAt).toEqual(reportedAt);
  });

  it("returns no prices without a postal code", async () => {
    const productId = await newProduct();
    await report(productId);

    expect(await findLatestPricesPerStore(productId, null)).toEqual([]);
    expect(await findLatestPricesPerStore(productId, undefined)).toEqual([]);
  });

  it("picks the same report every time when two reports have the same time", async () => {
    const productId = await newProduct();
    const reportedAt = new Date("2026-10-01T10:00:00Z");
    await report(productId, { id: "report-a", price: 2000, reportedAt });
    await report(productId, { id: "report-b", price: 2100, reportedAt });

    const first = await findLatestPricesPerStore(productId, "0150");
    const second = await findLatestPricesPerStore(productId, "0150");

    expect(first[0].id).toBe("report-b");
    expect(second).toEqual(first);
  });
});
