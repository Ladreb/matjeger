import { describe, expect, it } from "vitest";
import { cheapestAfterReport, findCheapest } from "./cheapest";

const day = new Date("2026-10-01");

describe("findCheapest", () => {
  it("returns null without prices", () => {
    expect(findCheapest([])).toBeNull();
  });

  it("returns the lowest price with its chain", () => {
    expect(
      findCheapest([
        { store: "KIWI", price: 2290, reportedAt: day },
        { store: "REMA_1000", price: 2190, reportedAt: day },
        { store: "MENY", price: 2490, reportedAt: day },
      ]),
    ).toEqual({ store: "REMA_1000", price: 2190, reportedAt: day });
  });
});

describe("cheapestAfterReport", () => {
  const shown = { store: "KIWI" as const, price: 2000, reportedAt: day, areaLabel: null };

  it("takes the report when nothing is shown", () => {
    expect(cheapestAfterReport(null, "MENY", 3000, day)).toEqual({
      store: "MENY", price: 3000, reportedAt: day, areaLabel: null,
    });
  });

  it("keeps a lower own price when another chain is reported higher", () => {
    expect(cheapestAfterReport(shown, "MENY", 3000, day)).toBe(shown);
  });

  it("replaces an area price with a higher own price", () => {
    expect(cheapestAfterReport({ ...shown, areaLabel: "01xx" }, "MENY", 3000, day)).toMatchObject(
      { store: "MENY", price: 3000, areaLabel: null },
    );
  });

  it("replaces the shown price when the same chain is reported higher", () => {
    expect(cheapestAfterReport(shown, "KIWI", 2500, day)).toMatchObject({ price: 2500 });
  });

  it("takes a lower price from another chain", () => {
    expect(cheapestAfterReport(shown, "MENY", 1500, day)).toMatchObject({ store: "MENY" });
  });
});
