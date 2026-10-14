import type { PriceUnit, Store } from "@prisma/client";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { findLatestPricesPerStore } from "@/features/pricing/lib/queries";
import { db } from "@/lib/db";
import { findLatestListPrices } from "./queries";

const productIds: string[] = [];
const userIds: string[] = [];
let counter = 0;

afterEach(async () => {
  vi.restoreAllMocks();
  await db.shoppingListItem.deleteMany({ where: { productId: { in: productIds } } });
  await db.shoppingList.deleteMany({ where: { userId: { in: userIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.priceReport.deleteMany({ where: { productId: { in: productIds } } });
  await db.product.deleteMany({ where: { id: { in: productIds } } });
  productIds.length = 0;
  userIds.length = 0;
});

afterAll(() => db.$disconnect());

async function newProduct() {
  const product = await db.product.create({ data: { name: `Listevare ${++counter}` } });
  productIds.push(product.id);
  return product.id;
}

async function newListWith(...productIdsOnList: string[]) {
  const user = await db.user.create({ data: { email: `liste${++counter}@example.invalid` } });
  userIds.push(user.id);
  await db.shoppingList.create({
    data: { userId: user.id, items: { create: productIdsOnList.map((productId) => ({ productId })) } },
  });
  return user.id;
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

describe("findLatestListPrices", () => {
  it("prices every product on the list in one read", async () => {
    const milk = await newProduct();
    const butter = await newProduct();
    const userId = await newListWith(milk, butter);
    await report(milk, { store: "KIWI", price: 2000 });
    await report(milk, { store: "MENY", price: 2200 });
    await report(butter, { store: "KIWI", price: 4900 });
    const queryRaw = vi.spyOn(db, "$queryRaw");

    const prices = await findLatestListPrices(userId, "0150");

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(prices.map((p) => [p.productId, p.store, p.price]).sort()).toEqual(
      [
        [milk, "KIWI", 2000],
        [milk, "MENY", 2200],
        [butter, "KIWI", 4900],
      ].sort(),
    );
  });

  it("leaves out products that are not on the list", async () => {
    const onList = await newProduct();
    const notOnList = await newProduct();
    const userId = await newListWith(onList);
    await report(onList);
    await report(notOnList);

    const prices = await findLatestListPrices(userId, "0150");

    expect(prices.map((p) => p.productId)).toEqual([onList]);
  });

  it("uses the latest price for each product and store chain", async () => {
    const productId = await newProduct();
    const userId = await newListWith(productId);
    await report(productId, { price: 1000, reportedAt: new Date("2026-09-01") });
    await report(productId, { price: 3000, reportedAt: new Date("2026-10-01") });

    const prices = await findLatestListPrices(userId, "0150");

    expect(prices.map((p) => p.price)).toEqual([3000]);
  });

  it("ignores a hidden report and a per-kg report", async () => {
    const productId = await newProduct();
    const userId = await newListWith(productId);
    await report(productId, { price: 2000, reportedAt: new Date("2026-09-01") });
    await report(productId, { price: 100, reportedAt: new Date("2026-10-01"), hiddenAt: new Date() });
    await report(productId, { store: "MENY", price: 50, priceUnit: "PER_KG" });

    const prices = await findLatestListPrices(userId, "0150");

    expect(prices.map((p) => [p.store, p.price])).toEqual([["KIWI", 2000]]);
  });

  it("prefers the own postal code over a newer report from the area", async () => {
    const productId = await newProduct();
    const userId = await newListWith(productId);
    await report(productId, { postalCode: "0151", price: 2100, reportedAt: new Date("2026-09-01") });
    await report(productId, { postalCode: "0182", price: 1500, reportedAt: new Date("2026-10-01") });

    const prices = await findLatestListPrices(userId, "0151");

    expect(prices).toHaveLength(1);
    expect(prices[0]).toMatchObject({ price: 2100, areaLabel: null });
  });

  it("marks an area price with the label of the postal code area", async () => {
    const productId = await newProduct();
    const userId = await newListWith(productId);
    await report(productId, { store: "MENY", postalCode: "0182", price: 2600 });

    const prices = await findLatestListPrices(userId, "0151");

    expect(prices[0]).toMatchObject({ store: "MENY", price: 2600, areaLabel: "01xx" });
  });

  it("has no price from outside the postal code area", async () => {
    const productId = await newProduct();
    const userId = await newListWith(productId);
    await report(productId, { postalCode: "0250" });

    expect(await findLatestListPrices(userId, "0151")).toEqual([]);
  });

  it("has no prices without a postal code", async () => {
    const productId = await newProduct();
    const userId = await newListWith(productId);
    await report(productId);

    expect(await findLatestListPrices(userId, null)).toEqual([]);
    expect(await findLatestListPrices(userId, undefined)).toEqual([]);
  });

  it("picks the same report when two reports have the same time", async () => {
    const productId = await newProduct();
    const userId = await newListWith(productId);
    const reportedAt = new Date("2026-10-01T10:00:00Z");
    await report(productId, { id: "report-a", price: 2000, reportedAt });
    await report(productId, { id: "report-b", price: 2100, reportedAt });

    const prices = await findLatestListPrices(userId, "0150");

    expect(prices.map((p) => p.price)).toEqual([2100]);
  });

  it("has no prices for a user without a list", async () => {
    const productId = await newProduct();
    const user = await db.user.create({ data: { email: `utenliste${++counter}@example.invalid` } });
    userIds.push(user.id);
    await newListWith(productId);
    await report(productId);

    expect(await findLatestListPrices(user.id, "0150")).toEqual([]);
  });

  it("prices only the oldest list", async () => {
    const onOldestList = await newProduct();
    const onNewerList = await newProduct();
    const user = await db.user.create({ data: { email: `toliste${++counter}@example.invalid` } });
    userIds.push(user.id);
    await db.shoppingList.create({
      data: {
        userId: user.id,
        createdAt: new Date("2026-09-01"),
        items: { create: [{ productId: onOldestList }] },
      },
    });
    await db.shoppingList.create({
      data: {
        userId: user.id,
        createdAt: new Date("2026-10-01"),
        items: { create: [{ productId: onNewerList }] },
      },
    });
    await report(onOldestList);
    await report(onNewerList);

    const prices = await findLatestListPrices(user.id, "0150");

    expect(prices.map((p) => p.productId)).toEqual([onOldestList]);
  });

  it("gives each product the same prices as the product page", async () => {
    const first = await newProduct();
    const second = await newProduct();
    const userId = await newListWith(first, second);
    await report(first, { store: "KIWI", postalCode: "0151", price: 2400 });
    await report(first, { store: "KIWI", postalCode: "0182", price: 1900, reportedAt: new Date("2026-10-02") });
    await report(first, { store: "MENY", postalCode: "0182", price: 2200 });
    await report(second, { store: "SPAR", postalCode: "0151", price: 100, priceUnit: "PER_KG" });
    await report(second, { store: "SPAR", postalCode: "0151", price: 3100 });
    await report(second, { store: "REMA_1000", postalCode: "0151", price: 9900, hiddenAt: new Date() });

    const listPrices = await findLatestListPrices(userId, "0151");

    for (const productId of [first, second]) {
      const pagePrices = await findLatestPricesPerStore(productId, "0151");
      const onList = listPrices.filter((p) => p.productId === productId);
      expect(onList.map(({ store, price, reportedAt, areaLabel }) => ({ store, price, reportedAt, areaLabel }))).toEqual(
        pagePrices.map(({ store, price, reportedAt, areaLabel }) => ({ store, price, reportedAt, areaLabel })),
      );
    }
  });
});
