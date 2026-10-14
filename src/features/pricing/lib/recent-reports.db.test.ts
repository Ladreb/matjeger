import type { PriceUnit, Store } from "@prisma/client";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { findRecentVisibleReports } from "./queries";

const NOW = new Date("2026-10-15T12:00:00Z");
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
  store: Store;
  postalCode: string;
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
      reportedAt: new Date("2026-10-10T10:00:00Z"),
      ...overrides,
    },
  });
}

describe("findRecentVisibleReports", () => {
  it("returns recent visible reports from the exact postal code", async () => {
    const productId = await newProduct();
    await report(productId);

    const reports = await findRecentVisibleReports(productId, "0150", NOW);

    expect(reports).toHaveLength(1);
  });

  it("ignores hidden reports", async () => {
    const productId = await newProduct();
    await report(productId, { hiddenAt: new Date() });

    expect(await findRecentVisibleReports(productId, "0150", NOW)).toEqual([]);
  });

  it("ignores per-kg reports, as every other price read does", async () => {
    const productId = await newProduct();
    await report(productId, { priceUnit: "PER_KG" });

    expect(await findRecentVisibleReports(productId, "0150", NOW)).toEqual([]);
  });

  it("ignores reports older than the stale limit", async () => {
    const productId = await newProduct();
    await report(productId, { reportedAt: new Date("2026-09-01T10:00:00Z") });

    expect(await findRecentVisibleReports(productId, "0150", NOW)).toEqual([]);
  });

  it("does not mix in reports from the postal code area", async () => {
    const productId = await newProduct();
    await report(productId, { postalCode: "0182" });

    expect(await findRecentVisibleReports(productId, "0150", NOW)).toEqual([]);
  });
});
