import type { Store } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { computePlans, maxSaving, type Plan, type StorePrice } from "./plans";

const NOW = new Date("2026-10-11T12:00:00Z");
const FRESH = new Date("2026-10-01T12:00:00Z");
const OLD = new Date("2026-08-27T12:00:00Z");

function price(
  productId: string,
  store: Store,
  øre: number,
  reportedAt = FRESH,
): StorePrice {
  return { productId, store, price: øre, reportedAt };
}

function item(productId: string, quantity = 1) {
  return { productId, quantity };
}

function compute(
  items: ReturnType<typeof item>[],
  prices: StorePrice[],
) {
  return computePlans(items, prices, NOW);
}

describe("computePlans", () => {
  it("returns nothing for an empty list", () => {
    expect(compute([], [])).toEqual({ plans: [], unpricedProductIds: [] });
  });

  it("returns no plans when no chain has a price", () => {
    const result = compute([item("a")], []);
    expect(result.plans).toEqual([]);
    expect(result.unpricedProductIds).toEqual(["a"]);
  });

  it("builds a one-stop plan per chain that covers everything", () => {
    const { plans } = compute(
      [item("a"), item("b")],
      [
        price("a", "KIWI", 1000),
        price("b", "KIWI", 2000),
        price("a", "REMA_1000", 1100),
        price("b", "REMA_1000", 1800),
      ],
    );
    expect(plans.map((p) => [p.stops.map((s) => s.store), p.total])).toEqual([
      [["REMA_1000"], 2900],
      [["KIWI"], 3000],
    ]);
    expect(plans.every((p) => p.uncoveredProductIds.length === 0)).toBe(true);
  });

  it("multiplies price by quantity", () => {
    const { plans } = compute(
      [item("a", 3)],
      [price("a", "KIWI", 1000)],
    );
    expect(plans[0].total).toBe(3000);
    expect(plans[0].stops[0].lines[0]).toMatchObject({
      productId: "a",
      quantity: 3,
      unitPrice: 1000,
      lineTotal: 3000,
    });
  });

  it("fills gaps from the one other chain that covers the most of them", () => {
    const { plans } = compute(
      [item("a"), item("b"), item("c")],
      [
        price("a", "KIWI", 1000),
        price("b", "REMA_1000", 500),
        price("c", "REMA_1000", 600),
        price("b", "SPAR", 400),
      ],
    );
    const kiwi = plans.find((p) => p.stops[0].store === "KIWI")!;
    expect(kiwi.stops.map((s) => s.store)).toEqual(["KIWI", "REMA_1000"]);
    expect(kiwi.stops[1].lines.map((l) => l.productId)).toEqual(["b", "c"]);
    expect(kiwi.total).toBe(2100);
    expect(kiwi.uncoveredProductIds).toEqual([]);
  });

  it("breaks a tie between extra chains on the lowest cost, then chain name", () => {
    const cheaper = compute(
      [item("a"), item("b")],
      [
        price("a", "KIWI", 1000),
        price("b", "SPAR", 500),
        price("b", "REMA_1000", 400),
      ],
    ).plans.find((p) => p.stops[0].store === "KIWI")!;
    expect(cheaper.stops[1].store).toBe("REMA_1000");

    const byName = compute(
      [item("a"), item("b")],
      [
        price("a", "KIWI", 1000),
        price("b", "SPAR", 500),
        price("b", "MENY", 500),
      ],
    ).plans.find((p) => p.stops[0].store === "KIWI")!;
    expect(byName.stops[1].store).toBe("MENY");
  });

  it("marks a plan partial when the extra chain misses some gaps", () => {
    const { plans } = compute(
      [item("a"), item("b"), item("c")],
      [
        price("a", "KIWI", 1000),
        price("b", "REMA_1000", 500),
        price("c", "SPAR", 700),
      ],
    );
    const kiwi = plans.find((p) => p.stops[0].store === "KIWI")!;
    expect(kiwi.uncoveredProductIds).toHaveLength(1);
    expect(kiwi.total).toBe(1500);
  });

  it("sets aside items no chain prices, so they do not make every plan partial", () => {
    const result = compute(
      [item("a"), item("nobody")],
      [price("a", "KIWI", 1000)],
    );
    expect(result.unpricedProductIds).toEqual(["nobody"]);
    expect(result.plans).toHaveLength(1);
    expect(result.plans[0].uncoveredProductIds).toEqual([]);
  });

  it("puts complete plans before partial ones even when partial is cheaper", () => {
    const { plans } = compute(
      [item("a"), item("b"), item("c"), item("d")],
      [
        price("a", "KIWI", 100),
        price("b", "KIWI", 100),
        price("c", "REMA_1000", 100),
        price("c", "MENY", 1000),
        price("d", "MENY", 1000),
      ],
    );
    const complete = plans.filter((p) => p.uncoveredProductIds.length === 0);
    const partial = plans.filter((p) => p.uncoveredProductIds.length > 0);
    expect(complete).not.toHaveLength(0);
    expect(partial).not.toHaveLength(0);
    expect(Math.min(...partial.map((p) => p.total))).toBeLessThan(
      Math.min(...complete.map((p) => p.total)),
    );
    expect(plans.slice(0, complete.length)).toEqual(complete);
  });

  it("ranks equal totals by fewer stops, then chain name", () => {
    const { plans } = compute(
      [item("a"), item("b")],
      [
        price("a", "KIWI", 500),
        price("b", "KIWI", 500),
        price("a", "REMA_1000", 500),
        price("b", "SPAR", 500),
        price("a", "SPAR", 500),
        price("b", "REMA_1000", 500),
      ],
    );
    expect(plans.map((p) => p.stops[0].store)).toEqual([
      "KIWI",
      "REMA_1000",
      "SPAR",
    ]);
  });

  it("ranks a one-stop plan before a two-stop plan with the same total, even if its name sorts later", () => {
    const { plans } = compute(
      [item("a"), item("b")],
      [
        price("a", "SPAR", 250),
        price("b", "SPAR", 250),
        price("a", "KIWI", 250),
        price("b", "MENY", 250),
      ],
    );
    expect(plans.map((p) => p.stops.map((s) => s.store))).toEqual([
      ["SPAR"],
      ["KIWI", "MENY"],
    ]);
  });

  it("ranks fewer uncovered items before a lower total", () => {
    const { plans } = compute(
      [item("a"), item("b"), item("c"), item("d")],
      [
        price("a", "KIWI", 1000),
        price("b", "KIWI", 1000),
        price("c", "REMA_1000", 1),
        price("d", "SPAR", 1),
        price("a", "MENY", 1),
      ],
    );
    const first = plans[0];
    const last = plans[plans.length - 1];
    expect(first.uncoveredProductIds).toHaveLength(1);
    expect(last.uncoveredProductIds).toHaveLength(2);
    expect(last.total).toBeLessThan(first.total);
  });

  it("picks the extra chain that covers more gaps even when another is cheaper", () => {
    const kiwi = compute(
      [item("a"), item("b"), item("c")],
      [
        price("a", "KIWI", 100),
        price("b", "MENY", 1000),
        price("c", "MENY", 1000),
        price("b", "SPAR", 1),
      ],
    ).plans.find((p) => p.stops[0].store === "KIWI")!;
    expect(kiwi.stops[1].store).toBe("MENY");
  });

  it("ignores prices for products that are no longer on the list", () => {
    const { plans } = compute(
      [item("a")],
      [price("a", "KIWI", 100), price("removed", "SPAR", 50)],
    );
    expect(plans.map((p) => p.stops.map((s) => s.store))).toEqual([["KIWI"]]);
  });

  it("counts a stale price in the extra stop", () => {
    const { plans } = compute(
      [item("a"), item("b")],
      [price("a", "KIWI", 100), price("b", "SPAR", 100, OLD)],
    );
    expect(plans[0].staleLineCount).toBe(1);
  });

  it("counts two plans with the same chains and items as one trip", () => {
    const { plans } = compute(
      [item("a"), item("b")],
      [price("a", "KIWI", 100), price("b", "REMA_1000", 200)],
    );
    expect(plans).toHaveLength(1);
    expect(plans[0].stops.map((s) => s.store)).toEqual(["KIWI", "REMA_1000"]);
  });

  it("counts plan lines that use a stale price", () => {
    const { plans } = compute(
      [item("a", 5), item("b")],
      [price("a", "KIWI", 100, OLD), price("b", "KIWI", 200)],
    );
    expect(plans[0].staleLineCount).toBe(1);
    expect(plans[0].stops[0].lines.find((l) => l.productId === "a")).toMatchObject(
      { isStale: true, reportedAt: OLD },
    );
  });

  it("does not call a price of exactly 30 days stale", () => {
    const thirtyDays = new Date("2026-09-11T12:00:00Z");
    const { plans } = compute([item("a")], [price("a", "KIWI", 100, thirtyDays)]);
    expect(plans[0].staleLineCount).toBe(0);
  });

  it("sums each stop and the whole plan", () => {
    const { plans } = compute(
      [item("a", 2), item("b")],
      [price("a", "KIWI", 100), price("b", "SPAR", 300)],
    );
    const kiwi = plans.find((p) => p.stops[0].store === "KIWI")!;
    expect(kiwi.stops.map((s) => s.total)).toEqual([200, 300]);
    expect(kiwi.total).toBe(500);
  });
});

describe("maxSaving", () => {
  function plan(total: number, uncovered: string[] = []): Plan {
    return { stops: [], uncoveredProductIds: uncovered, total, staleLineCount: 0 };
  }

  it("is the gap between the cheapest and the most expensive complete plan", () => {
    expect(maxSaving([plan(10000), plan(12000), plan(15000)])).toBe(5000);
  });

  it("is null with one complete plan", () => {
    expect(maxSaving([plan(10000), plan(9000, ["a"])])).toBeNull();
  });

  it("is null when the complete plans cost the same", () => {
    expect(maxSaving([plan(10000), plan(10000)])).toBeNull();
  });

  it("ignores partial plans", () => {
    expect(maxSaving([plan(10000), plan(11000), plan(90000, ["a"])])).toBe(1000);
  });

  it("is null without plans", () => {
    expect(maxSaving([])).toBeNull();
  });
});
