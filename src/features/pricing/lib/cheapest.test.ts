import { describe, expect, it } from "vitest";
import { findCheapest } from "./cheapest";

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
